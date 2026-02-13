import numpy as np

# Zonal Definitions (Normalized 0.0 to 1.0)
# Top half is Safe, bottom left is Transition, bottom right is Restricted.
ZONES = {
    "SAFE": {"y_min": 0.0, "y_max": 0.5},
    "TRANSITION": {"x_min": 0.0, "x_max": 0.5, "y_min": 0.5, "y_max": 1.0},
    "RESTRICTED": {"x_min": 0.5, "x_max": 1.0, "y_min": 0.5, "y_max": 1.0}
}

def get_zone(box):
    """Determines which geofence zone the center of the bounding box falls into."""
    # box is [x1, y1, x2, y2] in pixels. Let's assume 640x480 for normalization or pass shape.
    # For now, let's normalize based on a fixed 640x480 since we are using fixed frames.
    cx = (box[0] + box[2]) / 2 / 640
    cy = (box[1] + box[3]) / 2 / 480
    
    if cy < 0.5:
        return "SAFE"
    if cx < 0.5:
        return "TRANSITION"
    return "RESTRICTED"

def estimate_pose(frame, box):
    """
    Very simplified pose extractor for demonstration.
    Detects 'Falling' if box aspect ratio becomes extremely wide.
    """
    width = box[2] - box[0]
    height = box[3] - box[1]
    
    if width > height * 1.5:
        return "FALLEN"
    if height > 200: # Simple proximity check
        return "PROXIMITY_ALERT"
    return "STABLE"
