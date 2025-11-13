from pydantic import BaseModel

class CropInput(BaseModel):
    duration_months: int
    N: float
    P: float
    K: float
    temperature: float
    humidity: float
    ph: float
    rainfall: float
    last_crop_duration: int
    last_crop: str