"""
基础合成：将RGBA图层叠加到背景上
"""
import cv2
import numpy as np


def composite_frame(background: np.ndarray, overlay: np.ndarray) -> np.ndarray:
    """
    Alpha composite an RGBA overlay onto a BGR background.
    overlay must have 4 channels (BGRA).
    """
    if overlay.shape[2] != 4:
        raise ValueError("Overlay must have 4 channels (BGRA)")

    h, w = background.shape[:2]
    oh, ow = overlay.shape[:2]

    # If overlay is canvas-sized, composite directly
    if oh == h and ow == w:
        return _alpha_blend(background, overlay)

    # Otherwise, place overlay at its position
    result = background.copy()
    alpha = overlay[:, :, 3].astype(np.float32) / 255.0

    for c in range(3):
        result[:, :, c] = (
            overlay[:, :, c] * alpha +
            background[:, :, c] * (1.0 - alpha)
        ).astype(np.uint8)

    return result


def _alpha_blend(background: np.ndarray, overlay: np.ndarray) -> np.ndarray:
    """Simple alpha blending of BGRA overlay on BGR background."""
    alpha = overlay[:, :, 3].astype(np.float32) / 255.0
    alpha_3ch = np.stack([alpha] * 3, axis=-1)

    blended = (
        overlay[:, :, :3].astype(np.float32) * alpha_3ch +
        background.astype(np.float32) * (1.0 - alpha_3ch)
    ).astype(np.uint8)

    return blended
