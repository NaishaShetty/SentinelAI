import math
import time
from datetime import datetime
from app.cv.spatial import get_zone, estimate_pose

# Tracks state for complex temporal analysis
# {pid: {"last_seen": t, "stationary_start": t, "hit_count": n, "risk_velocity": v, "state": S}}
BEHAVIOR_MEMORY = {}

def get_dynamic_threshold():
    """Varies system sensitivity based on time of day (Safety Protocol)."""
    hour = datetime.now().hour
    if hour >= 22 or hour <= 6:
        return 0.45
    return 0.60

def calculate_detailed_risk(pid, prev_box, current_box, posture="ACTIVE_WATCH"):
    global BEHAVIOR_MEMORY
    
    now = time.time()
    if pid not in BEHAVIOR_MEMORY:
        BEHAVIOR_MEMORY[pid] = {
            "hits": 0, 
            "start": now, 
            "last_pos": None, 
            "history": [],
            "state": "OBSERVING"
        }
    
    mem = BEHAVIOR_MEMORY[pid]
    
    # 1. Hypothesis Generation (Competing Hypotheses)
    hypotheses = {"STABLE_STAY": 0.5, "NORMAL_MOTION": 0.5}
    confidence = 0.9 # Base confidence
    
    # 2. Velocity Calculation
    velocity = 0.0
    cx = (current_box[0] + current_box[2]) / 2
    cy = (current_box[1] + current_box[3]) / 2
    
    if prev_box:
        px = (prev_box[0] + prev_box[2]) / 2
        py = (prev_box[1] + prev_box[3]) / 2
        velocity = math.hypot(cx - px, cy - py)
        
        # Update hypotheses
        if velocity > 25:
            hypotheses["ERRATIC_MOTION"] = min(velocity / 50.0, 1.0)
            hypotheses["SUDDEN_SPRINT"] = min(velocity / 80.0, 1.0)
            confidence -= 0.1 # High motion reduces sensor confidence
        elif velocity < 5:
            hypotheses["LOITERING"] = 0.8
            confidence += 0.05 # Static objects are easier to classify
    
    # 3. Spatial Context
    zone = get_zone(current_box)
    if zone == "RESTRICTED":
        hypotheses["ZONE_INTRUSION"] = 0.95
        confidence += 0.1 # Clear geofence violation
    
    # 4. Pose Analysis
    pose = estimate_pose(None, current_box)
    if pose == "FALLEN":
        hypotheses["ENTITY_FALL"] = 0.9
        confidence += 0.2 # High-signal feature
        
    # Pick top 2 hypotheses
    sorted_hypos = sorted(hypotheses.items(), key=lambda x: x[1], reverse=True)[:2]
    primary_sig = sorted_hypos[0][0]
    
    # Base risk from top hypothesis weight
    risk = sorted_hypos[0][1]
    
    # Posture Scaling
    if posture == "STANDBY": risk *= 0.5
    elif posture == "ZERO_TRUST": risk *= 1.5
    
    # 5. Temporal Pattern Analysis
    pattern = "TRANSIENT"
    if risk > 0.3:
        mem["hits"] += 1
        duration = now - mem["start"]
        if mem["hits"] > 15: pattern = "ESCALATING_PATTERN"
        elif mem["hits"] > 5: pattern = "RECURRING_BEHAVIOR"
    else:
        mem["hits"] = max(0, mem["hits"] - 0.5) # Gradual decay
        
    return {
        "risk": min(risk, 2.0),
        "confidence": min(confidence, 1.0),
        "primary": primary_sig,
        "hypotheses": sorted_hypos,
        "pattern": pattern
    }
