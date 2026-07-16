"""
SwasthyaSathi AI - Assessment Orchestrator Service

Orchestrates the Rule Engine, Gemini LLM, and Recommendation Engine
to produce a final clinical assessment for a patient visit.
"""

from typing import Dict, Any, Optional
from datetime import datetime
from app.services.ai.rule_engine import evaluate_vitals
from app.services.ai.gemini_service import generate_clinical_assessment
from app.services.ai.recommendation_service import enhance_recommendations

async def orchestrate_assessment(visit_data: Dict[str, Any], patient_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Main entry point for generating an AI assessment.
    """
    start_time = datetime.now()
    
    vitals = visit_data.get("vitals") or {}
    symptoms = visit_data.get("symptoms") or []
    
    # 1. Run Emergency Rule Engine
    is_emergency, triggered_rules, immediate_actions = evaluate_vitals(vitals, symptoms)
    
    # Construct complete prompt data
    prompt_payload = {
        "patient": {
            "age": patient_data.get("age"),
            "gender": patient_data.get("gender"),
            "pregnancy_status": patient_data.get("pregnancy_status"),
            "pregnancy_week": patient_data.get("pregnancy_week"),
            "chronic_diseases": patient_data.get("chronic_diseases", []),
        },
        "current_visit": {
            "vitals": vitals,
            "symptoms": symptoms,
            "observations": visit_data.get("observations"),
        },
        "rule_engine_flags": {
            "is_emergency": is_emergency,
            "triggered_rules": triggered_rules
        }
    }
    
    # 2. Call Gemini
    assessment = await generate_clinical_assessment(prompt_payload)
    
    # Handle Graceful Fallback if Gemini fails
    if not assessment:
        assessment = {
            "risk_level": "Critical" if is_emergency else "Unknown",
            "confidence": 100 if is_emergency else 0,
            "clinical_summary": "AI processing temporarily unavailable. Please rely on standard clinical guidelines.",
            "triggered_rules": triggered_rules,
            "risk_factors": [],
            "recommended_action": " ".join(immediate_actions) if is_emergency else "Consult PHC Medical Officer for assessment.",
            "follow_up_plan": ["Monitor vitals closely"],
            "guidelines": ["National Health Mission Standard Protocols"],
            "missing_information": []
        }
    else:
        # Merge triggered rules from Rule Engine into Gemini's response
        assessment["triggered_rules"] = list(set(assessment.get("triggered_rules", []) + triggered_rules))
        
    # 3. Enhance Recommendations and Routing
    assessment = enhance_recommendations(assessment, is_emergency, immediate_actions)
    
    # Add metadata
    processing_time = (datetime.now() - start_time).total_seconds()
    assessment["metadata"] = {
        "assessment_time": datetime.now().isoformat(),
        "ai_version": "Gemini 2.5 Flash + Rule Engine v1.0",
        "processing_time_sec": round(processing_time, 2)
    }
    
    return assessment
