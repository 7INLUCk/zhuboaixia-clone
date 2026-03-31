"""
绿幕抠图服务
- 主方案：OpenCV HSV色彩空间阈值
- 降级方案：rembg AI抠图
"""
import cv2
import numpy as np
from PIL import Image
import io


def remove_green_screen(img: np.ndarray, tolerance: float = 0.35) -> np.ndarray:
    """
    Remove green screen using HSV color space thresholding.
    Returns RGBA image with alpha channel.
    """
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)

    # Green range in HSV
    lower_green = np.array([35, 50, 50])
    upper_green = np.array([85, 255, 255])

    # Create mask
    mask = cv2.inRange(hsv, lower_green, upper_green)

    # Morphological operations to clean up the mask
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)  # Fill small holes
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)   # Remove small noise

    # Feather edges for smoother transitions
    mask = cv2.GaussianBlur(mask, (3, 3), 0)

    # Invert mask (we want non-green areas)
    alpha = 255 - mask

    # Create RGBA image
    b, g, r = cv2.split(img)
    rgba = cv2.merge([b, g, r, alpha])

    # Remove green color spill from edges
    rgba = _despill_green(rgba)

    return rgba


def _despill_green(rgba: np.ndarray, amount: float = 0.5) -> np.ndarray:
    """Remove green color spill from the edges of the subject."""
    b, g, r, a = cv2.split(rgba)

    # Where green is dominant over blue and red, reduce it
    b_f = b.astype(np.float32)
    g_f = g.astype(np.float32)
    r_f = r.astype(np.float32)

    # Calculate green excess
    avg_rb = (b_f + r_f) / 2.0
    green_excess = np.maximum(0, g_f - avg_rb)

    # Reduce green spill proportionally to alpha (more reduction at edges)
    alpha_factor = (255.0 - a.astype(np.float32)) / 255.0
    g_corrected = g_f - green_excess * amount * (1.0 - alpha_factor)
    g_corrected = np.clip(g_corrected, 0, 255).astype(np.uint8)

    return cv2.merge([b, g_corrected, r, a])


def remove_background_ai(img: np.ndarray) -> np.ndarray:
    """
    AI-based background removal using rembg.
    Fallback when chroma key doesn't work well.
    """
    from rembg import remove

    # Convert BGR to RGB
    rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    pil_img = Image.fromarray(rgb)

    # Remove background
    result = remove(pil_img)

    # Convert back to OpenCV RGBA
    rgba = np.array(result)
    rgba = cv2.cvtColor(rgba, cv2.COLOR_RGBA2BGRA)

    return rgba
