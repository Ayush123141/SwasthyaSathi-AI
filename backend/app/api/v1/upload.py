"""
SwasthyaSathi AI - Upload API (Voice & OCR)

Handles multipart file uploads for Voice Dictation and Medical Documents.
Processes files using Gemini 2.5 Flash multimodal capabilities.
"""
import base64
import json
import httpx
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from app.core.config import get_settings
from app.schemas.common import ApiResponse

router = APIRouter(prefix="/upload", tags=["Uploads"])

@router.post("/voice", response_model=ApiResponse)
async def upload_voice(file: UploadFile = File(...)):
    """
    Accepts an audio file (webm, mp3, wav, etc.) from the frontend dictation.
    Returns the transcribed clinical symptoms.
    """
    settings = get_settings()
    api_key = settings.gemini_api_key
    
    if not api_key:
        raise HTTPException(status_code=500, detail="Gemini API Key is missing in .env file")

    try:
        audio_bytes = await file.read()
        b64_audio = base64.b64encode(audio_bytes).decode("utf-8")
        
        prompt = "You are a clinical transcription AI for an ASHA worker. Transcribe the following audio exactly, translating to English if it is in Hindi or Marathi. Only output the final clinical text."
        
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": prompt},
                        {
                            "inlineData": {
                                "mimeType": file.content_type or "audio/webm",
                                "data": b64_audio
                            }
                        }
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.1
            }
        }
        
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, json=payload)
            response.raise_for_status()
            
            data = response.json()
            text_content = data["candidates"][0]["content"]["parts"][0]["text"].strip()
            
            return ApiResponse(
                success=True,
                message="Voice transcribed successfully",
                data={"transcription": text_content}
            )

    except Exception as e:
        print(f"Error processing voice: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process voice: {str(e)}")

@router.post("/ocr", response_model=ApiResponse)
async def upload_ocr(file: UploadFile = File(...)):
    """
    Accepts an image file (prescription, lab report).
    Returns extracted structured clinical data (vitals, meds).
    """
    settings = get_settings()
    api_key = settings.gemini_api_key
    
    if not api_key:
        raise HTTPException(status_code=500, detail="Gemini API Key is missing in .env file")

    try:
        img_bytes = await file.read()
        b64_image = base64.b64encode(img_bytes).decode("utf-8")
        
        prompt = """
        You are a Medical OCR Engine. Extract text from this document.
        Return ONLY a JSON object with this exact schema:
        {
          "extracted_text": "raw text found in document",
          "vitals": { "blood_pressure": "", "temperature": "", "heart_rate": "", "spo2": "" },
          "medications": ["medication 1", "medication 2"]
        }
        Do not include Markdown formatting (like ```json), just return the raw JSON object.
        """
        
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": prompt},
                        {
                            "inlineData": {
                                "mimeType": file.content_type or "image/jpeg",
                                "data": b64_image
                            }
                        }
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.1,
                "responseMimeType": "application/json"
            }
        }
        
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, json=payload)
            response.raise_for_status()
            
            data = response.json()
            text_content = data["candidates"][0]["content"]["parts"][0]["text"].strip()
            
            # Clean up JSON
            if text_content.startswith("```json"): text_content = text_content[7:]
            if text_content.startswith("```"): text_content = text_content[3:]
            if text_content.endswith("```"): text_content = text_content[:-3]
            
            parsed = json.loads(text_content.strip())
            
            return ApiResponse(
                success=True,
                message="OCR processed successfully",
                data=parsed
            )

    except Exception as e:
        print(f"Error processing OCR: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process OCR: {str(e)}")
