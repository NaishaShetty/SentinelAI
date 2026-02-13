from app.risk.scorer import get_dynamic_threshold

def abstain(risk, confidence=1.0):
    threshold = get_dynamic_threshold()
    
    # Uncertainty scaling: if confidence is low, we abstain MUCH earlier
    # Formula: effective_threshold = base_threshold * confidence
    effective_threshold = threshold * max(confidence, 0.5)
    
    low_bound = effective_threshold / 2
    
    if risk < low_bound:
        decision = "PROCEED"
    elif risk < effective_threshold:
        decision = "WARN"
    else:
        decision = "ABSTAIN_ESCALATE"
        
    # Predictive Logic: "What Would Happen Next?"
    # If risk is climbing and we are in WARN, predict ABSTAIN time
    prediction = None
    if decision == "WARN" and risk > 0.4:
        # Simple linear projection for demo
        seconds_to_abstain = max(2, int((threshold - risk) * 20))
        prediction = f"ABSTAIN_IN_~{seconds_to_abstain}s"
        
    return decision, prediction
