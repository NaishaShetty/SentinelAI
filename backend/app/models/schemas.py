from pydantic import BaseModel

class DetectionResponse(BaseModel):
    person_id: str
    risk_score: float
    decision: str
