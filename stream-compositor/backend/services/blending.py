"""
边缘融合：拉普拉斯金字塔多频段混合
低频融色调，高频融纹理，消除硬边
"""
import cv2
import numpy as np


def laplacian_blend(background: np.ndarray, overlay: np.ndarray,
                    blend_width: int = 15) -> np.ndarray:
    """
    Blend an RGBA overlay onto background using alpha-based feathering.
    Uses a simpler but effective approach: Gaussian blur on the alpha mask.
    """
    alpha = overlay[:, :, 3].astype(np.float32) / 255.0

    # Feather the alpha edges
    kernel_size = max(blend_width // 2 * 2 + 1, 3)
    alpha_blurred = cv2.GaussianBlur(alpha, (kernel_size, kernel_size), 0)

    # Expand to 3 channels
    alpha_3ch = np.stack([alpha_blurred] * 3, axis=-1)

    # Composite
    fg = overlay[:, :, :3].astype(np.float32)
    bg = background.astype(np.float32)

    result = fg * alpha_3ch + bg * (1.0 - alpha_3ch)
    return np.clip(result, 0, 255).astype(np.uint8)


def laplacian_blend_advanced(background: np.ndarray, overlay: np.ndarray,
                              levels: int = 4) -> np.ndarray:
    """
    Advanced multi-band Laplacian pyramid blending.
    Better quality but slower - use for final export.
    """
    alpha = overlay[:, :, 3].astype(np.float32) / 255.0
    alpha_3ch = np.stack([alpha] * 3, axis=-1)

    fg = overlay[:, :, :3].astype(np.float32)
    bg = background.astype(np.float32)

    # Build Gaussian pyramids for the mask
    gp_mask = [alpha_3ch]
    gp_fg = [fg]
    gp_bg = [bg]

    for i in range(levels):
        gp_mask.append(cv2.pyrDown(gp_mask[-1]))
        gp_fg.append(cv2.pyrDown(gp_fg[-1]))
        gp_bg.append(cv2.pyrDown(gp_bg[-1]))

    # Build Laplacian pyramids
    lp_fg = []
    lp_bg = []
    for i in range(levels):
        size = (gp_fg[i].shape[1], gp_fg[i].shape[0])
        fg_up = cv2.pyrUp(gp_fg[i + 1], dstsize=size)
        bg_up = cv2.pyrUp(gp_bg[i + 1], dstsize=size)
        lp_fg.append(gp_fg[i] - fg_up)
        lp_bg.append(gp_bg[i] - bg_up)

    # Add the smallest level
    lp_fg.append(gp_fg[levels])
    lp_bg.append(gp_bg[levels])

    # Blend Laplacian pyramids using mask
    lp_blended = []
    for i in range(levels + 1):
        mask = gp_mask[min(i, len(gp_mask) - 1)]
        blended = lp_fg[i] * mask + lp_bg[i] * (1.0 - mask)
        lp_blended.append(blended)

    # Reconstruct from pyramid
    result = lp_blended[levels]
    for i in range(levels - 1, -1, -1):
        size = (lp_blended[i].shape[1], lp_blended[i].shape[0])
        result = cv2.pyrUp(result, dstsize=size)
        result = result + lp_blended[i]

    return np.clip(result, 0, 255).astype(np.uint8)
