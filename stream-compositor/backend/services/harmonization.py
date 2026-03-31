"""
光照匹配：让抠图层的色调、亮度与背景一致
"""
import cv2
import numpy as np


def match_lighting(rgba: np.ndarray, background: np.ndarray) -> np.ndarray:
    """
    Match the lighting/color tone of the RGBA layer to the background.
    Uses histogram matching on the non-transparent regions.
    """
    b, g, r, alpha = cv2.split(rgba)

    # Only process non-transparent pixels
    mask = alpha > 128
    if np.sum(mask) < 100:
        return rgba  # Not enough visible pixels

    # Get foreground RGB (BGR in OpenCV)
    fg = rgba[:, :, :3].astype(np.float32)

    # Get background statistics
    bg_mean = cv2.mean(background)[:3]
    bg_mean = np.array(bg_mean, dtype=np.float32)

    # Compute foreground mean (only on visible pixels)
    fg_visible = fg.copy()
    fg_visible[alpha <= 128] = 0
    fg_count = np.sum(mask)

    fg_mean = np.array([
        np.sum(fg_visible[:, :, 0]) / fg_count,
        np.sum(fg_visible[:, :, 1]) / fg_count,
        np.sum(fg_visible[:, :, 2]) / fg_count,
    ], dtype=np.float32)

    # Calculate color shift
    shift = bg_mean - fg_mean

    # Apply shift with a moderate factor (don't overdo it)
    factor = 0.4  # 40% match to avoid washing out the subject
    result = fg.copy()
    for c in range(3):
        channel = result[:, :, c] + shift[c] * factor
        result[:, :, c] = np.clip(channel, 0, 255)

    # Also match brightness/contrast
    bg_gray = cv2.cvtColor(background, cv2.COLOR_BGR2GRAY)
    bg_brightness = np.mean(bg_gray)
    fg_gray = cv2.cvtColor(fg.astype(np.uint8), cv2.COLOR_BGR2GRAY)
    fg_brightness = np.mean(fg_gray[mask])

    brightness_ratio = bg_brightness / max(fg_brightness, 1.0)
    brightness_ratio = np.clip(brightness_ratio, 0.7, 1.3)  # Limit adjustment

    for c in range(3):
        channel = result[:, :, c] * (0.8 + 0.2 * brightness_ratio)
        result[:, :, c] = np.clip(channel, 0, 255)

    result_uint8 = result.astype(np.uint8)
    return cv2.merge([result_uint8[:, :, 0], result_uint8[:, :, 1],
                      result_uint8[:, :, 2], alpha])
