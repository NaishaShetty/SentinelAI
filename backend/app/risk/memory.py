# State Machine: OBSERVING, WARNING, ABSTAINED, COOLDOWN
# Tracks persistent risk memory with state-aware decay

memory = {}
SYSTEM_METRICS = {
    "total_abstentions": 0,
    "recovery_times": [],
    "avg_recovery_time": 0,
    "false_escalations": 0
}

def update_memory(pid, new_risk, current_decision="PROCEED"):
    global memory, SYSTEM_METRICS
    if pid not in memory:
        memory[pid] = {
            "score": 0.0, 
            "state": "OBSERVING", 
            "last_abstain_time": 0,
            "abstain_count": 0
        }
    
    m = memory[pid]
    prev_state = m["state"]
    
    # 1. State-Aware Decay Logic (Cooldown)
    # If in COOLDOWN or was ABSTAINED, we decay MUCH slower
    decay = 0.85
    if m["state"] == "ABSTAINED" or m["state"] == "COOLDOWN":
        decay = 0.98 # Refuse to downgrade risk quickly (Safety Persistence)
    
    m["score"] = (m["score"] * decay) + (new_risk * 0.4)
    
    # 2. State Machine Transitions
    if m["score"] > 0.8:
        m["state"] = "ABSTAINED"
        if prev_state != "ABSTAINED":
            SYSTEM_METRICS["total_abstentions"] += 1
            m["last_abstain_time"] = 0 # Reset timer
    elif m["score"] > 0.4:
        m["state"] = "WARNING"
    elif prev_state == "ABSTAINED" and m["score"] < 0.4:
        m["state"] = "COOLDOWN"
        # Track recovery metric
        SYSTEM_METRICS["recovery_times"].append(5.0) # Simulated recovery period
    else:
        m["state"] = "OBSERVING"

    return m["score"], m["state"]

def get_metrics():
    if SYSTEM_METRICS["recovery_times"]:
        SYSTEM_METRICS["avg_recovery_time"] = sum(SYSTEM_METRICS["recovery_times"]) / len(SYSTEM_METRICS["recovery_times"])
    return SYSTEM_METRICS
