"""
直播合成系统 - 后端入口
"""
import os
import uuid
import json
import shutil
from pathlib import Path
from typing import Optional

import cv2
import numpy as np
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel

from services.chroma_key import remove_green_screen, remove_background_ai
from services.composite import composite_frame
from services.harmonization import match_lighting
from services.shadow import add_contact_shadow
from services.blending import laplacian_blend

app = FastAPI(title="Stream Compositor API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Storage directories
UPLOAD_DIR = Path("/tmp/compositor/uploads")
OUTPUT_DIR = Path("/tmp/compositor/output")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


class CompositeParams(BaseModel):
    session_id: str
    host_x: float = 0.5
    host_y: float = 0.5
    host_scale: float = 1.0
    companion_x: float = 0.7
    companion_y: float = 0.7
    companion_scale: float = 0.5
    canvas_width: int = 1080
    canvas_height: int = 1920


@app.post("/api/upload")
async def upload_file(
    file: UploadFile = File(...),
    file_type: str = Form(...),  # "background", "host", "companion"
):
    """Upload a single asset and return its processed preview."""
    session_id = str(uuid.uuid4())[:8]
    session_dir = UPLOAD_DIR / session_id
    session_dir.mkdir(parents=True, exist_ok=True)

    # Save original file
    ext = Path(file.filename).suffix if file.filename else ".png"
    original_path = session_dir / f"{file_type}_original{ext}"
    content = await file.read()
    with open(original_path, "wb") as f:
        f.write(content)

    result = {"session_id": session_id, "file_type": file_type, "original": str(original_path)}

    if file_type == "background":
        # Background image - just return it as-is
        result["preview"] = str(original_path)
        result["status"] = "ok"

    elif file_type in ("host", "companion"):
        # Green screen removal
        preview_path = session_dir / f"{file_type}_preview.png"
        try:
            img_array = np.frombuffer(content, dtype=np.uint8)
            img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)

            if img is None:
                raise ValueError("Failed to decode image")

            # Try HSV chroma key first
            rgba = remove_green_screen(img)

            # Check if chroma key worked (enough pixels removed)
            alpha = rgba[:, :, 3]
            removed_ratio = np.sum(alpha < 128) / alpha.size

            if removed_ratio < 0.05:
                # Chroma key didn't remove much, try AI fallback
                print(f"Chroma key removed only {removed_ratio:.1%}, trying AI fallback")
                rgba = remove_background_ai(img)

            cv2.imwrite(str(preview_path), rgba)
            result["preview"] = str(preview_path)
            result["status"] = "ok"
        except Exception as e:
            result["status"] = "error"
            result["error"] = str(e)
    else:
        raise HTTPException(status_code=400, detail=f"Unknown file_type: {file_type}")

    return result


@app.post("/api/chroma-key-frame")
async def chroma_key_frame(file: UploadFile = File(...)):
    """Process a single frame: remove green screen, return PNG with alpha."""
    content = await file.read()
    img_array = np.frombuffer(content, dtype=np.uint8)
    img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
    if img is None:
        raise HTTPException(status_code=400, detail="Failed to decode image")

    rgba = remove_green_screen(img)

    # Check if chroma key was effective
    alpha = rgba[:, :, 3]
    removed_ratio = np.sum(alpha < 128) / alpha.size
    if removed_ratio < 0.05:
        rgba = remove_background_ai(img)

    # Encode as PNG
    _, buf = cv2.imencode(".png", rgba)
    session_id = str(uuid.uuid4())[:8]
    out_path = UPLOAD_DIR / f"{session_id}_frame.png"
    with open(out_path, "wb") as f:
        f.write(buf.tobytes())

    return FileResponse(str(out_path), media_type="image/png")


@app.post("/api/composite-preview")
async def composite_preview(params: CompositeParams):
    """Generate a single composited preview frame based on layer params."""
    session_dir = UPLOAD_DIR / params.session_id
    if not session_dir.exists():
        raise HTTPException(status_code=404, detail="Session not found")

    # Load background
    bg_files = list(session_dir.glob("background_original*"))
    if not bg_files:
        raise HTTPException(status_code=404, detail="No background found")

    bg = cv2.imread(str(bg_files[0]), cv2.IMREAD_COLOR)
    if bg is None:
        raise HTTPException(status_code=500, detail="Failed to load background")

    # Resize background to canvas size
    bg = cv2.resize(bg, (params.canvas_width, params.canvas_height))

    # Load host preview
    host_path = session_dir / "host_preview.png"
    if host_path.exists():
        host = cv2.imread(str(host_path), cv2.IMREAD_UNCHANGED)
        if host is not None:
            host = _scale_and_position(host, params.host_x, params.host_y,
                                       params.host_scale, params.canvas_width, params.canvas_height)
            bg = composite_frame(bg, host)

    # Load companion preview
    companion_path = session_dir / "companion_preview.png"
    if companion_path.exists():
        companion = cv2.imread(str(companion_path), cv2.IMREAD_UNCHANGED)
        if companion is not None:
            companion = _scale_and_position(companion, params.companion_x, params.companion_y,
                                            params.companion_scale, params.canvas_width, params.canvas_height)
            bg = composite_frame(bg, companion)

    _, buf = cv2.imencode(".jpg", bg, [cv2.IMWRITE_JPEG_QUALITY, 85])
    out_path = OUTPUT_DIR / f"{params.session_id}_preview.jpg"
    with open(out_path, "wb") as f:
        f.write(buf.tobytes())

    return FileResponse(str(out_path), media_type="image/jpeg")


@app.post("/api/composite-full")
async def composite_full(params: CompositeParams):
    """Full quality composite with harmonization, shadows, and blending."""
    session_dir = UPLOAD_DIR / params.session_id
    if not session_dir.exists():
        raise HTTPException(status_code=404, detail="Session not found")

    bg_files = list(session_dir.glob("background_original*"))
    if not bg_files:
        raise HTTPException(status_code=404, detail="No background found")

    bg = cv2.imread(str(bg_files[0]), cv2.IMREAD_COLOR)
    bg = cv2.resize(bg, (params.canvas_width, params.canvas_height))

    result = bg.copy()

    # Process host layer
    host_path = session_dir / "host_preview.png"
    if host_path.exists():
        host = cv2.imread(str(host_path), cv2.IMREAD_UNCHANGED)
        if host is not None:
            host = _scale_and_position(host, params.host_x, params.host_y,
                                       params.host_scale, params.canvas_width, params.canvas_height)
            # Step 1: Lighting match
            host = match_lighting(host, result)
            # Step 2: Contact shadow
            result = add_contact_shadow(result, host)
            # Step 3: Blend
            result = laplacian_blend(result, host)

    # Process companion layer
    companion_path = session_dir / "companion_preview.png"
    if companion_path.exists():
        companion = cv2.imread(str(companion_path), cv2.IMREAD_UNCHANGED)
        if companion is not None:
            companion = _scale_and_position(companion, params.companion_x, params.companion_y,
                                            params.companion_scale, params.canvas_width, params.canvas_height)
            companion = match_lighting(companion, result)
            result = add_contact_shadow(result, companion)
            result = laplacian_blend(result, companion)

    _, buf = cv2.imencode(".jpg", result, [cv2.IMWRITE_JPEG_QUALITY, 95])
    out_path = OUTPUT_DIR / f"{params.session_id}_final.jpg"
    with open(out_path, "wb") as f:
        f.write(buf.tobytes())

    return FileResponse(str(out_path), media_type="image/jpeg")


def _scale_and_position(rgba_img: np.ndarray, cx: float, cy: float,
                        scale: float, canvas_w: int, canvas_h: int) -> np.ndarray:
    """Scale an RGBA image and place it on a canvas-sized transparent layer."""
    h, w = rgba_img.shape[:2]

    # Target size: scale relative to canvas
    max_dim = min(canvas_w, canvas_h)
    target_h = int(max_dim * scale * 0.5)
    ratio = target_h / h
    target_w = int(w * ratio)

    if target_w < 1 or target_h < 1:
        return rgba_img

    resized = cv2.resize(rgba_img, (target_w, target_h), interpolation=cv2.INTER_LANCZOS4)

    # Create canvas-sized RGBA layer
    layer = np.zeros((canvas_h, canvas_w, 4), dtype=np.uint8)

    # Position: cx/cy are 0-1 ratios of canvas center position
    x = int(cx * canvas_w - target_w / 2)
    y = int(cy * canvas_h - target_h / 2)

    # Clamp to canvas bounds
    src_x1 = max(0, -x)
    src_y1 = max(0, -y)
    src_x2 = min(target_w, canvas_w - x)
    src_y2 = min(target_h, canvas_h - y)
    dst_x1 = max(0, x)
    dst_y1 = max(0, y)
    dst_x2 = dst_x1 + (src_x2 - src_x1)
    dst_y2 = dst_y1 + (src_y2 - src_y1)

    if src_x2 > src_x1 and src_y2 > src_y1:
        layer[dst_y1:dst_y2, dst_x1:dst_x2] = resized[src_y1:src_y2, src_x1:src_x2]

    return layer


@app.get("/api/health")
async def health():
    return {"status": "ok"}
