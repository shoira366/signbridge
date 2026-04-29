# from fastapi import FastAPI
# from pydantic import BaseModel
# from fastapi.middleware.cors import CORSMiddleware

# from predict import decode_base64_image, predict_from_frame

# app = FastAPI()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],  # for dev only
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# class PredictRequest(BaseModel):
#     image: str


# @app.get("/health")
# def health():
#     return {"ok": True}


# @app.post("/predict")
# def predict(req: PredictRequest):
#     frame_rgb = decode_base64_image(req.image)
#     result = predict_from_frame(frame_rgb)
#     return result

from fastapi import FastAPI, Request
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from predict import decode_base64_image, predict_from_frame
import uuid

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PredictRequest(BaseModel):
    image: str
    session_id: str = None  # Add session_id parameter


@app.get("/health")
def health():
    return {"ok": True}


@app.get("/models")
def get_models():
    """Return available models"""
    return {"models": ["custom_10", "full_alphabet"]}


@app.post("/predict")
async def predict(req: PredictRequest):
    try:
        # Generate or use existing session ID
        session_id = req.session_id or str(uuid.uuid4())
        
        # Decode image
        frame_rgb = decode_base64_image(req.image)
        
        # Get prediction with session management
        result = predict_from_frame(frame_rgb, session_id)
        
        # Add session_id to response
        result["session_id"] = session_id
        
        return result
    except Exception as e:
        print(f"Error in prediction: {e}")
        return {
            "label": "Error",
            "stable_label": "Error",
            "confidence": 0.0,
            "hand_detected": False,
            "error": str(e)
        }