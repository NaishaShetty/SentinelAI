from fastapi import APIRouter
import cv2
import time
from app.cv.detector import detect_people
from app.cv.tracker import assign_ids
from app.risk.scorer import calculate_detailed_risk
from app.risk.memory import update_memory, get_metrics
from app.risk.abstention import abstain
from app.infra.database import log_event, get_recent_logs, verify_log

router = APIRouter()
cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)

# State
SENSITIVITY = 1.0
IS_PAUSED = False
SECURITY_POSTURE = "ACTIVE_WATCH"
CURRENT_SCENARIO = "NORMAL"
REWIND_BUFFER = {}
LAST_FRAME_TIME = time.time()

@router.post("/control/scenario")
def set_scenario(slug: str):
    global CURRENT_SCENARIO
    CURRENT_SCENARIO = slug
    return {"scenario": CURRENT_SCENARIO}


@router.post("/control/posture")
def set_posture(value: str):
    global SECURITY_POSTURE
    SECURITY_POSTURE = value
    return {"posture": SECURITY_POSTURE}

@router.post("/control/sensitivity")
def set_sensitivity(value: float):
    global SENSITIVITY
    SENSITIVITY = value
    return {"sensitivity": SENSITIVITY}

@router.get("/audit")
def fetch_audit():
    return get_recent_logs()

@router.post("/control/verify")
def verify_decision(log_id: int, correct: bool):
    verify_log(log_id, correct)
    return {"status": "verified"}

@router.post("/control/pause")
def toggle_pause(paused: bool):
    global IS_PAUSED
    IS_PAUSED = paused
    return {"is_paused": IS_PAUSED}

@router.post("/control/reset")
def reset_system():
    from app.risk.memory import memory
    memory.clear()
    return {"status": "memory_reset"}

@router.get("/metrics")
def fetch_system_metrics():
    return get_metrics()

def get_rationale(total_risk, decision, signature):
    if decision == "PROCEED": return "Behavioral entropy within safe bounds."
    if signature == "UNAUTHORIZED_INTRUSION": return "Critical: Restricted zone violation detected."
    if signature == "ENTITY_FALL": return "Emergency: Potential incapacitated person."
    return f"Anomaly Signature detected: {signature.replace('_', ' ').title()}"

def get_synthetic_data():
    global CURRENT_SCENARIO
    if IS_PAUSED: return []
    
    scenarios = {
        "NORMAL": {
            "risk_score": 0.12, "confidence": 0.98, "decision": "PROCEED", "state": "OBSERVING",
            "signature": "STABLE_STAY", "hypotheses": [["NORMAL_MOTION", 0.95], ["STABLE_STAY", 0.05]],
            "rationale": "Behavioral entropy within safe bounds.", "prediction": None, "pattern": "TRANSIENT"
        },
        "PACING": {
            "risk_score": 0.58, "confidence": 0.85, "decision": "WARN", "state": "WARNING",
            "signature": "RECURRING_BEHAVIOR", "hypotheses": [["LOITERING", 0.72], ["PACING", 0.28]],
            "rationale": "Anomalous dwell time detected near entry point.", "prediction": "ABSTAIN_IN_~8s", "pattern": "RECURRING_BEHAVIOR"
        },
        "FALL": {
            "risk_score": 1.10, "confidence": 0.92, "decision": "ABSTAIN_ESCALATE", "state": "ABSTAINED",
            "signature": "ENTITY_FALL", "hypotheses": [["ENTITY_FALL", 0.98], ["INCAPACITATED", 0.02]],
            "rationale": "Critical: Abnormal body orientation detected. Potential fall.", "prediction": "SAFETY_LOCK_ACTIVE", "pattern": "ESCALATING_PATTERN"
        }
    }
    
    s = scenarios.get(CURRENT_SCENARIO, scenarios["NORMAL"])
    
    return [{
        "person_id": f"SIM_{CURRENT_SCENARIO}",
        "risk_score": s["risk_score"],
        "confidence": s["confidence"],
        "decision": s["decision"],
        "state": s["state"],
        "signature": s["signature"],
        "hypotheses": s["hypotheses"],
        "rationale": s["rationale"],
        "prediction": s["prediction"],
        "trail": [[100, 100, 200, 200], [105, 105, 205, 205]],
        "pattern": s["pattern"]
    }]


@router.get("/stream")
def process_frame():
    global cap, IS_PAUSED, SECURITY_POSTURE, LAST_FRAME_TIME
    if IS_PAUSED: return {"data": [], "health": {"fps": 0, "latency": 0}}
    
    start = time.time()
    ret, frame = (False, None)
    if cap.isOpened():
        ret, frame = cap.read()
    
    if not ret: 
        return {
            "data": get_synthetic_data(),
            "health": {"fps": 30, "latency": 25, "status": "DEGRADED_MODE (SYNTHETIC)"}
        }

    detections = detect_people(frame)
    tracked = assign_ids(detections)
    output = []
    
    for pid, box in tracked:
        prev_history = REWIND_BUFFER.get(pid, [])
        prev = prev_history[-1] if prev_history else None
        
        # New multi-factor risk engine
        analysis = calculate_detailed_risk(pid, prev, box, SECURITY_POSTURE)
        total, state = update_memory(pid, analysis["risk"] * SENSITIVITY)
        decision, prediction = abstain(total, analysis["confidence"])

        # Buffer update
        if pid not in REWIND_BUFFER: REWIND_BUFFER[pid] = []
        REWIND_BUFFER[pid].append(box)
        REWIND_BUFFER[pid] = REWIND_BUFFER[pid][-15:]

        if decision != "PROCEED":
            log_event(pid, analysis["primary"], total, decision, get_rationale(total, decision, analysis["primary"]))

        output.append({
            "person_id": pid,
            "risk_score": round(total, 3),
            "confidence": round(analysis["confidence"], 2),
            "decision": decision,
            "state": state,
            "signature": analysis["primary"],
            "hypotheses": analysis["hypotheses"],
            "rationale": get_rationale(total, decision, analysis["primary"]),
            "prediction": prediction,
            "pattern": analysis["pattern"],
            "trail": REWIND_BUFFER[pid]
        })

    end = time.time()
    latency = int((end - start) * 1000)
    fps = int(1 / (end - LAST_FRAME_TIME)) if (end - LAST_FRAME_TIME) > 0 else 0
    LAST_FRAME_TIME = end

    return {
        "data": output,
        "health": {"fps": fps, "latency": latency, "status": "ONLINE"}
    }
