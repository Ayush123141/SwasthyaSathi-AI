import { Link } from "react-router-dom"
import {
  ArrowLeft,
  Download,
  BrainCircuit,
  CheckCircle2,
  FileText,
  Clock,
  ArrowRight,
  ShieldAlert,
  Info
} from "lucide-react"

export default function AIAssessmentPage() {
  // Mock Data matching the new AI Engine JSON Schema
  const assessment = {
    patientName: "Aarti Devi",
    metadata: {
      assessment_time: "2026-04-05T10:30:00Z",
      ai_version: "Gemini 2.5 Flash + Rule Engine v1.0",
      processing_time_sec: 2.34
    },
    risk_level: "High",
    confidence: 92,
    clinical_summary: "Patient presents with elevated blood pressure (145/92 mmHg) and symptoms of severe headache and blurred vision during the 24th week of pregnancy. These clinical indicators strongly suggest Gestational Hypertension with potential progression to Pre-eclampsia.",
    triggered_rules: [
      "Systolic BP > 140 mmHg during pregnancy",
      "Diastolic BP > 90 mmHg during pregnancy",
      "Presence of severe headache and visual disturbances"
    ],
    risk_factors: [
      "Elevated Blood Pressure",
      "Neurological symptoms",
      "24 weeks pregnant"
    ],
    recommended_action: "Immediate referral for further clinical evaluation, including proteinuria testing and fetal monitoring.",
    referralLevel: "CHC (Community Health Center) or District Hospital",
    follow_up_plan: [
      "Monitor BP daily if not admitted.", 
      "Ensure patient rests in lateral position.", 
      "Do not administer antihypertensives without a physician's prescription."
    ],
    guidelines: [
      "WHO Emergency Triage Assessment and Treatment (ETAT)",
      "National Health Mission Standard Protocols"
    ],
    missing_information: [
      "Urine protein results",
      "Fetal heart rate"
    ]
  }

  return (
    <div className="max-w-4xl mx-auto pb-12 animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div className="flex items-start gap-4">
          <Link
            to="/dashboard"
            className="p-2 -ml-2 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <BrainCircuit className="w-6 h-6 text-blue-600" /> AI Clinical Assessment
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Generated for {assessment.patientName} • {assessment.metadata.ai_version} • {assessment.metadata.processing_time_sec}s
            </p>
          </div>
        </div>

        <a
          href={`http://localhost:8000/api/v1/reports/pdf/test-visit-123`}
          download
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm w-full sm:w-auto"
        >
          <Download className="w-4 h-4" />
          Download PDF
        </a>
      </div>

      {/* Primary Risk & Confidence Card */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Risk Badge */}
        <div className={`flex-1 p-6 rounded-xl border flex flex-col items-center justify-center text-center relative overflow-hidden shadow-sm ${
          assessment.risk_level === 'Critical' ? 'bg-red-50 border-red-200' :
          assessment.risk_level === 'High' ? 'bg-amber-50 border-amber-200' :
          assessment.risk_level === 'Medium' ? 'bg-yellow-50 border-yellow-200' :
          'bg-emerald-50 border-emerald-200'
        }`}>
          <h3 className="text-sm font-bold uppercase tracking-widest mb-2 opacity-80">Risk Level</h3>
          <h2 className={`text-4xl font-black tracking-tight ${
            assessment.risk_level === 'Critical' ? 'text-red-700' :
            assessment.risk_level === 'High' ? 'text-amber-700' :
            assessment.risk_level === 'Medium' ? 'text-yellow-700' :
            'text-emerald-700'
          }`}>
            {assessment.risk_level}
          </h2>
        </div>

        {/* Confidence Score */}
        <div className="flex-1 p-6 rounded-xl border border-blue-100 bg-blue-50 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden">
          <h3 className="text-sm font-bold uppercase tracking-widest text-blue-800 opacity-80 mb-2">AI Confidence</h3>
          <div className="flex items-baseline gap-1 text-blue-700">
            <h2 className="text-4xl font-black tracking-tight">{assessment.confidence}</h2>
            <span className="text-xl font-bold">%</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Emergency Detection Panel */}
          {assessment.triggered_rules.length > 0 && (
            <div className="p-5 rounded-xl border border-rose-200 bg-rose-50 shadow-sm">
              <div className="flex items-center gap-2 text-rose-800 mb-3">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="font-bold text-sm uppercase tracking-wide">Triggered Rules / Flags</h3>
              </div>
              <ul className="space-y-2">
                {assessment.triggered_rules.map((rule: string, i: number) => (
                  <li key={i} className="text-sm text-rose-700 font-medium flex items-start gap-2">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Explainability Panel */}
          <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-sm space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              <Info className="w-4 h-4 text-blue-600" /> Clinical Summary & Reasoning
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed">
              {assessment.clinical_summary}
            </p>
            
            {assessment.risk_factors.length > 0 && (
              <div className="mt-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Identified Risk Factors:</h4>
                <div className="flex flex-wrap gap-2">
                  {assessment.risk_factors.map((factor: string, i: number) => (
                    <span key={i} className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
                      {factor}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {assessment.missing_information.length > 0 && (
              <div className="mt-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Missing Information:</h4>
                <div className="flex flex-wrap gap-2">
                  {assessment.missing_information.map((info: string, i: number) => (
                    <span key={i} className="px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-700">
                      {info}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action & Referral (Crucial) */}
          <div className="bg-slate-900 text-white rounded-xl border border-slate-800 p-6 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">
              <ArrowRight className="w-4 h-4" />
              Recommended Clinical Action
            </h3>
            <p className="text-lg font-medium leading-snug mb-6">
              {assessment.recommended_action}
            </p>
            
            <div className="bg-slate-800 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Refer To</p>
                <p className="text-white font-bold mt-0.5">{assessment.referralLevel}</p>
              </div>
              <Link
                to="/reports"
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap text-center shadow-sm"
              >
                Generate Referral Document
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column (1/3) */}
        <div className="space-y-6">
          {/* Follow Up Plan */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-4">
              <Clock className="w-4 h-4 text-emerald-500" />
              Follow-up Protocol
            </h3>
            <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4">
              <ul className="space-y-2">
                {assessment.follow_up_plan.map((plan: string, i: number) => (
                  <li key={i} className="text-sm text-emerald-800 font-medium flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    {plan}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Guidelines */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-4">
              <FileText className="w-4 h-4 text-purple-500" />
              Reference Guidelines
            </h3>
            <ul className="space-y-2">
              {assessment.guidelines.map((guide: string, i: number) => (
                <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0 mt-1.5" />
                  {guide}
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>
    </div>
  )
}
