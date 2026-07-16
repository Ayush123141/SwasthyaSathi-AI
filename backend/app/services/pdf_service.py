"""
SwasthyaSathi AI - PDF Generation Service

Uses ReportLab to generate structured clinical referral documents.
"""
from io import BytesIO
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRule
from typing import Dict, Any

def generate_referral_pdf(visit_data: Dict[str, Any], patient_data: Dict[str, Any]) -> BytesIO:
    """
    Generates a PDF referral document based on patient and visit data.
    """
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter,
                            rightMargin=40, leftMargin=40,
                            topMargin=40, bottomMargin=40)
    
    styles = getSampleStyleSheet()
    
    # Custom Styles
    title_style = ParagraphStyle(
        "TitleStyle",
        parent=styles['Heading1'],
        fontSize=20,
        textColor=colors.HexColor("#0f172a"),
        spaceAfter=12,
        alignment=1 # Center
    )
    
    heading_style = ParagraphStyle(
        "HeadingStyle",
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor("#1e40af"),
        spaceBefore=12,
        spaceAfter=6
    )
    
    normal_style = styles['Normal']
    normal_style.fontSize = 11
    normal_style.textColor = colors.HexColor("#334155")

    elements = []

    # --- Header ---
    elements.append(Paragraph("<b>SwasthyaSathi AI - Clinical Referral Report</b>", title_style))
    date_str = datetime.now().strftime("%Y-%m-%d %H:%M")
    elements.append(Paragraph(f"Date of Assessment: {date_str}", normal_style))
    elements.append(HRule(width="100%", color=colors.lightgrey, spaceBefore=10, spaceAfter=20))

    # --- Patient Details ---
    elements.append(Paragraph("Patient Demographics", heading_style))
    
    patient_table_data = [
        ["Name:", patient_data.get("full_name", "Unknown"), "Age/Gender:", f"{patient_data.get('age', '-')} / {patient_data.get('gender', '-')}"]
    ]
    
    t_patient = Table(patient_table_data, colWidths=[60, 200, 70, 200])
    t_patient.setStyle(TableStyle([
        ('FONTNAME', (0,0), (-1,-1), 'Helvetica'),
        ('FONTSIZE', (0,0), (-1,-1), 10),
        ('TEXTCOLOR', (0,0), (-1,-1), colors.HexColor("#334155")),
        ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'),
        ('FONTNAME', (2,0), (2,-1), 'Helvetica-Bold'),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
    ]))
    elements.append(t_patient)
    elements.append(Spacer(1, 15))

    # --- Vitals ---
    elements.append(Paragraph("Clinical Vitals", heading_style))
    
    vitals = visit_data.get("vitals", {})
    if not vitals:
        vitals = {}
        
    vitals_data = [
        ["Blood Pressure:", str(vitals.get("blood_pressure", "-")), "Heart Rate:", str(vitals.get("heart_rate", "-"))],
        ["SpO2 (%):", str(vitals.get("spo2", "-")), "Temperature (°F):", str(vitals.get("temperature", "-"))]
    ]
    
    t_vitals = Table(vitals_data, colWidths=[100, 160, 100, 160])
    t_vitals.setStyle(TableStyle([
        ('FONTNAME', (0,0), (-1,-1), 'Helvetica'),
        ('FONTSIZE', (0,0), (-1,-1), 10),
        ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'),
        ('FONTNAME', (2,0), (2,-1), 'Helvetica-Bold'),
        ('BOX', (0,0), (-1,-1), 1, colors.lightgrey),
        ('GRID', (0,0), (-1,-1), 0.5, colors.lightgrey),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    elements.append(t_vitals)
    elements.append(Spacer(1, 15))

    # --- AI Assessment ---
    elements.append(Paragraph("AI Clinical Assessment", heading_style))
    
    risk_level = str(visit_data.get("ai_risk_level", "Unknown")).title()
    
    risk_color = colors.emerald
    if risk_level == "High":
        risk_color = colors.orange
    elif risk_level == "Critical":
        risk_color = colors.red
    elif risk_level == "Medium":
        risk_color = colors.goldenrod
        
    risk_data = [
        ["Risk Level:", risk_level],
    ]
    
    t_risk = Table(risk_data, colWidths=[100, 420])
    t_risk.setStyle(TableStyle([
        ('FONTNAME', (0,0), (-1,-1), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 12),
        ('TEXTCOLOR', (1,0), (1,0), risk_color),
        ('BOX', (0,0), (-1,-1), 1, risk_color),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    elements.append(t_risk)
    elements.append(Spacer(1, 10))
    
    # Explanation
    explanation = visit_data.get("ai_explanation", "No AI explanation available.")
    elements.append(Paragraph("<b>Clinical Summary:</b>", normal_style))
    elements.append(Paragraph(explanation, normal_style))
    elements.append(Spacer(1, 10))
    
    # Recommendation
    recommendation = visit_data.get("ai_recommendation", "None")
    elements.append(Paragraph("<b>Recommended Action:</b>", normal_style))
    
    rec_style = ParagraphStyle(
        "RecStyle",
        parent=normal_style,
        textColor=colors.HexColor("#0f172a"),
        backColor=colors.HexColor("#f1f5f9"),
        borderPadding=8,
        spaceBefore=4
    )
    elements.append(Paragraph(recommendation, rec_style))
    elements.append(Spacer(1, 15))

    # --- Footer ---
    elements.append(HRule(width="100%", color=colors.lightgrey, spaceBefore=20, spaceAfter=10))
    footer_style = ParagraphStyle("Footer", parent=normal_style, fontSize=8, textColor=colors.gray, alignment=1)
    elements.append(Paragraph("Disclaimer: This is an AI-assisted clinical report. It does not replace a doctor's diagnosis.", footer_style))
    elements.append(Paragraph("SwasthyaSathi AI • Generated securely by ASHA Worker", footer_style))

    doc.build(elements)
    buffer.seek(0)
    return buffer
