"""
接触阴影生成：在主体底部生成椭圆暗影，营造"落地感"
"""
import cv2
import numpy as np


def add_contact_shadow(background: np.ndarray, overlay: np.ndarray,
                       blur_radius: int = 30, opacity: float = 0.35) -> np.ndarray:
    """
    Add a contact shadow under the overlay subject.
    Shadow is an ellipse at the bottom of the subject's bounding box.
    """
    alpha = overlay[:, :, 3]
    if np.sum(alpha > 128) < 100:
        return background

    # Find bounding box of the subject
    coords = np.column_stack(np.where(alpha > 128))
    if len(coords) < 10:
        return background

    y_min, x_min = coords.min(axis=0)
    y_max, x_max = coords.max(axis=0)

    subject_width = x_max - x_min
    subject_height = y_max - y_min

    if subject_width < 10 or subject_height < 10:
        return background

    # Create shadow ellipse at the bottom of the subject
    shadow_layer = np.zeros_like(background, dtype=np.float32)

    # Ellipse parameters
    center_x = (x_min + x_max) // 2
    center_y = y_max + int(subject_height * 0.02)  # Slightly below subject
    axes_w = int(subject_width * 0.45)  # Width slightly less than subject
    axes_h = int(subject_height * 0.06)  # Very flat ellipse

    # Draw filled ellipse
    cv2.ellipse(shadow_layer, (center_x, center_y), (axes_w, axes_h),
                0, 0, 360, (1, 1, 1), -1)

    # Blur the shadow
    blur_size = max(blur_radius // 2 * 2 + 1, 3)  # Ensure odd
    shadow_layer = cv2.GaussianBlur(shadow_layer, (blur_size, blur_size), 0)

    # Apply shadow with multiply blending
    result = background.astype(np.float32) / 255.0
    shadow_factor = 1.0 - shadow_layer * opacity
    result = result * shadow_factor
    result = np.clip(result * 255, 0, 255).astype(np.uint8)

    return result
