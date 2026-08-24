import io
import os
import math
import numpy as np
import cv2
from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import List, Optional

# Attempt to load deepface, with a fallback for demonstration robustness
USE_MOCK = False
try:
    os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'  # suppress TF warnings
    from deepface import DeepFace
except Exception as e:
    print(f"Warning: DeepFace failed to load. Using robust OpenCV fallback for demo. Error: {e}")
    USE_MOCK = True

app = FastAPI(title="ResQTrace AI Service", version="1.0.0")

class FaceEmbeddingResponse(BaseModel):
    embedding: List[float]
    face_found: bool
    message: str

class CompareRequest(BaseModel):
    embedding1: List[float]
    embedding2: List[float]

class Candidate(BaseModel):
    case_id: str
    embedding: List[float]

class FindMatchesRequest(BaseModel):
    target_embedding: List[float]
    candidates: List[Candidate]

class MatchResult(BaseModel):
    case_id: str
    similarity_score: float
    confidence: str

def generate_mock_embedding(image_bytes: bytes) -> List[float]:
    """Generates a pseudo-embedding based on color histogram (for fallback)."""
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Invalid image")
    
    # Check for basic face using OpenCV Haar Cascades
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.1, 4)
    
    if len(faces) == 0:
        raise ValueError("No face detected")
        
    (x, y, w, h) = faces[0]
    face_roi = img[y:y+h, x:x+w]
    
    # Calculate a simplified 128D histogram-based embedding
    hist = cv2.calcHist([face_roi], [0, 1, 2], None, [8, 4, 4], [0, 256, 0, 256, 0, 256])
    cv2.normalize(hist, hist)
    embedding = hist.flatten().tolist()
    return embedding

def generate_deepface_embedding(img_path: str) -> List[float]:
    # Use Facenet model (128D embedding, relatively lightweight)
    try:
        objs = DeepFace.represent(img_path=img_path, model_name="Facenet", detector_backend="opencv", enforce_detection=True)
        if not objs or len(objs) == 0:
            raise ValueError("No face detected")
        return objs[0]["embedding"]
    except Exception as e:
        if "Face could not be detected" in str(e):
            raise ValueError("No face detected")
        raise e

def cosine_similarity(v1: List[float], v2: List[float]) -> float:
    dot_product = sum(a * b for a, b in zip(v1, v2))
    norm_a = math.sqrt(sum(a * a for a in v1))
    norm_b = math.sqrt(sum(b * b for b in v2))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot_product / (norm_a * norm_b)

def get_confidence_category(score: float) -> str:
    # Thresholds typically used for Facenet cosine similarity
    if score >= 0.85:
        return "HIGH"
    elif score >= 0.70:
        return "MEDIUM"
    elif score >= 0.55:
        return "LOW"
    else:
        return "NONE"

@app.post("/ai/face-embedding", response_model=FaceEmbeddingResponse)
async def get_face_embedding(file: UploadFile = File(...)):
    contents = await file.read()
    
    # Save temp file for deepface
    temp_path = f"temp_{file.filename}"
    with open(temp_path, "wb") as f:
        f.write(contents)
        
    try:
        if USE_MOCK:
            embedding = generate_mock_embedding(contents)
        else:
            embedding = generate_deepface_embedding(temp_path)
            
        return FaceEmbeddingResponse(
            embedding=embedding,
            face_found=True,
            message="Face detected and embedded successfully"
        )
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI processing error: {str(e)}")
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.post("/ai/compare")
async def compare_embeddings(req: CompareRequest):
    score = cosine_similarity(req.embedding1, req.embedding2)
    confidence = get_confidence_category(score)
    return {
        "similarity_score": score,
        "confidence": confidence,
        "threshold_config": "Cosine-v1"
    }

@app.post("/ai/find-matches")
async def find_matches(req: FindMatchesRequest):
    results = []
    for candidate in req.candidates:
        score = cosine_similarity(req.target_embedding, candidate.embedding)
        confidence = get_confidence_category(score)
        
        if confidence != "NONE":
            results.append(MatchResult(
                case_id=candidate.case_id,
                similarity_score=score,
                confidence=confidence
            ))
            
    # Sort by highest score first
    results.sort(key=lambda x: x.similarity_score, reverse=True)
    return {"matches": results, "threshold_config": "Cosine-v1"}

@app.post("/ai/priority")
async def assess_priority(file: UploadFile = File(...)):
    # Mock priority heuristic endpoint (e.g. assessing image clarity, brightness)
    return {"priority": "STANDARD", "notes": "Image suitable for matching"}

@app.get("/health")
async def health_check():
    return {"status": "UP", "service": "ResQTrace AI"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
