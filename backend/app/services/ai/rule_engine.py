"""
SwasthyaSathi AI - Emergency Rule Engine

Evaluates patient vitals and symptoms against hardcoded critical thresholds.
If critical conditions are met, it instantly flags an emergency to bypass
or supplement the Gemini LLM.
"""

from typing import Dict, Any, List, Tuple

# Thresholds based on standard clinical guidelines (e.g., WHO, IMNCI)
CRITICAL_THRESHOLDS = {
    "bp_systolic_high": 160,
    "bp_diastolic_high": 110,
    "bp_systolic_low": 90,
    "hr_high": 120,
    "hr_low": 50,
    "spo2_low": 90,
    "temp_high_f": 104.0,  # 40 C
    "temp_low_f": 95.0,    # 35 C
}

EMERGENCY_SYMPTOMS = [
    "chest pain",
    "difficulty breathing",
    "unconscious",
    "seizures",
    "convulsions",
    "severe bleeding",
    "heavy bleeding",
    "blurred vision",  # pre-eclampsia flag
]

def evaluate_vitals(vitals: Dict[str, Any], symptoms: List[str]) -> Tuple[bool, List[str], List[str]]:
    """
    Evaluates vitals and symptoms against critical thresholds.
    Returns:
        is_emergency (bool): True if any critical rule is triggered.
        triggered_rules (List[str]): Explanations of which rules fired.
        immediate_actions (List[str]): Clinical actions to take immediately.
    """
    is_emergency = False
    triggered_rules = []
    immediate_actions = []

    # Check Blood Pressure
    if vitals.get("blood_pressure"):
        try:
            sys_str, dia_str = vitals["blood_pressure"].split("/")
            sys, dia = int(sys_str.strip()), int(dia_str.strip())
            
            if sys >= CRITICAL_THRESHOLDS["bp_systolic_high"] or dia >= CRITICAL_THRESHOLDS["bp_diastolic_high"]:
                is_emergency = True
                triggered_rules.append(f"Hypertensive Crisis: BP is {sys}/{dia} mmHg (Threshold: 160/110).")
                immediate_actions.append("Refer immediately to CHC or District Hospital.")
                immediate_actions.append("Ensure patient rests in lateral position.")
            
            if sys <= CRITICAL_THRESHOLDS["bp_systolic_low"]:
                is_emergency = True
                triggered_rules.append(f"Hypotension/Shock: Systolic BP is {sys} mmHg (Threshold: <90).")
                immediate_actions.append("Refer immediately for emergency care. Keep patient warm.")
                
        except Exception:
            pass # Ignore parsing errors for now

    # Check Heart Rate
    hr = vitals.get("heart_rate")
    if hr:
        try:
            hr_val = int(hr)
            if hr_val >= CRITICAL_THRESHOLDS["hr_high"]:
                is_emergency = True
                triggered_rules.append(f"Severe Tachycardia: Heart rate is {hr_val} bpm (Threshold: >=120).")
                immediate_actions.append("Urgent clinical evaluation required.")
            if hr_val <= CRITICAL_THRESHOLDS["hr_low"]:
                is_emergency = True
                triggered_rules.append(f"Severe Bradycardia: Heart rate is {hr_val} bpm (Threshold: <=50).")
                immediate_actions.append("Urgent clinical evaluation required.")
        except Exception:
            pass

    # Check SpO2
    spo2 = vitals.get("spo2")
    if spo2:
        try:
            spo2_val = float(spo2)
            if spo2_val <= CRITICAL_THRESHOLDS["spo2_low"]:
                is_emergency = True
                triggered_rules.append(f"Severe Hypoxia: SpO2 is {spo2_val}% (Threshold: <=90%).")
                immediate_actions.append("Administer oxygen immediately if available. Urgent referral.")
        except Exception:
            pass

    # Check Temperature
    temp = vitals.get("temperature")
    if temp:
        try:
            temp_val = float(temp)
            if temp_val >= CRITICAL_THRESHOLDS["temp_high_f"]:
                is_emergency = True
                triggered_rules.append(f"Hyperpyrexia: Temperature is {temp_val}°F (Threshold: >=104°F).")
                immediate_actions.append("Apply tepid sponging. Urgent referral to rule out severe infection/malaria.")
            if temp_val <= CRITICAL_THRESHOLDS["temp_low_f"]:
                is_emergency = True
                triggered_rules.append(f"Hypothermia: Temperature is {temp_val}°F (Threshold: <=95°F).")
                immediate_actions.append("Keep patient warm using blankets/skin-to-skin contact. Urgent referral.")
        except Exception:
            pass

    # Check Symptoms
    if symptoms:
        symptoms_lower = [s.lower() for s in symptoms]
        for critical_symp in EMERGENCY_SYMPTOMS:
            for s in symptoms_lower:
                if critical_symp in s:
                    is_emergency = True
                    triggered_rules.append(f"Critical Symptom Present: {critical_symp.title()}")
                    immediate_actions.append(f"Immediate emergency referral required for {critical_symp}.")
                    break

    return is_emergency, list(set(triggered_rules)), list(set(immediate_actions))
