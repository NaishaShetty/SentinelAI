import uuid
import math

tracks = {}

DIST_THRESHOLD = 50


def _center(box):
    x1, y1, x2, y2 = box
    return ((x1 + x2) / 2, (y1 + y2) / 2)


def assign_ids(detections):
    assigned = []
    used = set()

    for det in detections:
        cx, cy = _center(det)
        best_id = None
        best_dist = float("inf")

        for pid, prev_box in tracks.items():
            px, py = _center(prev_box)
            dist = math.hypot(cx - px, cy - py)

            if dist < best_dist and dist < DIST_THRESHOLD and pid not in used:
                best_id = pid
                best_dist = dist

        if best_id is None:
            best_id = str(uuid.uuid4())[:8]

        tracks[best_id] = det
        used.add(best_id)
        assigned.append((best_id, det))

    return assigned
