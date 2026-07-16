"""
SwasthyaSathi AI - Recommendation Service

Maps AI findings to standardized clinical recommendations and 
attaches relevant guidelines.
"""

from typing import Dict, Any, List

def enhance_recommendations(assessment: Dict[str, Any], is_emergency: bool, immediate_actions: List[str]) -> Dict[str, Any]:
    """
    Enhances the raw AI assessment with hardcoded emergency actions
    and maps them to standard referral types.
    """
    
    # If it's a hard emergency from rule engine, override AI recommendations
    if is_emergency:
        assessment["risk_level"] = "Critical"
        assessment["confidence"] = 100
        assessment["recommended_action"] = " ".join(immediate_actions)
        assessment["triggered_rules"] = list(set(assessment.get("triggered_rules", []) + immediate_actions))
        
        # Ensure guidelines reference emergency protocols
        guidelines = assessment.get("guidelines", [])
        if "WHO Emergency Triage Assessment and Treatment (ETAT)" not in guidelines:
            guidelines.append("WHO Emergency Triage Assessment and Treatment (ETAT)")
        assessment["guidelines"] = guidelines
        
    # Map risk level to referral needs
    risk = assessment.get("risk_level", "").upper()
    
    if risk in ["CRITICAL", "EMERGENCY"]:
        assessment["referral_needed"] = True
        assessment["referral_type"] = "District Hospital / Emergency"
    elif risk == "HIGH":
        assessment["referral_needed"] = True
        assessment["referral_type"] = "CHC (Community Health Center)"
    elif risk == "MEDIUM":
        assessment["referral_needed"] = True
        assessment["referral_type"] = "PHC (Primary Health Center)"
    else:
        assessment["referral_needed"] = False
        assessment["referral_type"] = "None"
        
    return assessment
