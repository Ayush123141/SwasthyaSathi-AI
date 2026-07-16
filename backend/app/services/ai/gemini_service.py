"""
SwasthyaSathi AI - Gemini LLM Service

Handles integration with Google Gemini for Explainable AI Clinical Assessment.
Strictly returns JSON formatted output based on a defined schema.
"""

import json
import httpx
from typing import Dict, Any, Optional
from app.core.config import get_settings

# Fixed JSON schema required by the application
RESPONSE_SCHEMA = """
{
  "risk_level": "Low | Medium | High | Critical",
  "confidence": <integer 0-100>,
  "clinical_summary": "<string>",
  "triggered_rules": ["<string>"],
  "risk_factors": ["<string>"],
  "recommended_action": "<string>",
  "follow_up_plan": ["<string>"],
  "guidelines": ["<string>"],
  "missing_information": ["<string>"]
}
"""

SYSTEM_INSTRUCTION = f"""
You are an expert Clinical Decision Support AI for ASHA workers in rural India.
Your job is to analyze patient vitals, symptoms, and medical history, and provide a structured clinical assessment.

CRITICAL RULES:
1. YOU MUST NEVER DIAGNOSE A DISEASE. Only identify risks and recommend next steps (e.g., PHC referral).
2. DO NOT hallucinate. Only rely on the provided patient data.
3. Your explanation MUST reference the structured data provided.
4. YOU MUST RETURN ONLY VALID JSON matching this exact schema:
{RESPONSE_SCHEMA}
Do not include Markdown formatting (like ```json), just return the raw JSON object.
"""

async def generate_clinical_assessment(patient_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Sends patient data to Gemini and returns structured JSON assessment.
    """
    settings = get_settings()
    api_key = settings.gemini_api_key
    
    if not api_key or api_key == "YOUR_GEMINI_API_KEY_HERE":
        print("WARNING: Gemini API Key is missing or invalid.")
        return None

    # Construct the prompt
    prompt = f"Patient Data:\n{json.dumps(patient_data, indent=2)}\n\nPlease provide the clinical assessment based on this data."

    payload = {
        "system_instruction": {
            "parts": [{"text": SYSTEM_INSTRUCTION}]
        },
        "contents": [
            {
                "parts": [{"text": prompt}]
            }
        ],
        "generationConfig": {
            "temperature": 0.1,  # Low temperature for highly deterministic/clinical responses
            "responseMimeType": "application/json"
        }
    }

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, json=payload)
            response.raise_for_status()
            
            data = response.json()
            # Parse the text from Gemini response
            text_content = data["candidates"][0]["content"]["parts"][0]["text"]
            
            # Clean up if Gemini accidentally includes markdown despite instructions
            text_content = text_content.strip()
            if text_content.startswith("```json"):
                text_content = text_content[7:]
            if text_content.startswith("```"):
                text_content = text_content[3:]
            if text_content.endswith("```"):
                text_content = text_content[:-3]
            
            return json.loads(text_content.strip())

    except httpx.HTTPError as e:
        print(f"HTTP Error calling Gemini: {e}")
        return None
    except (KeyError, IndexError, json.JSONDecodeError) as e:
        print(f"Error parsing Gemini response: {e}")
        return None
    except Exception as e:
        print(f"Unexpected error in Gemini service: {e}")
        return None
