import { Link } from "react-router-dom"
import {
  ArrowLeft,
  AlertTriangle,
  Download,
  BrainCircuit,
  Activity,
  CheckCircle2,
  FileText,
  Clock,
  ArrowRight
} from "lucide-react"

export default function AIAssessmentPage() {
  // Mock Data for the AI Assessment
  const assessment = {
    patientName: "Aarti Devi",
    riskLevel: "HIGH",
    confidenceScore: 92,
    clinicalSummary: "Patient presents with elevated blood pressure (145/92 mmHg) and symptoms of severe headache and blurred vision during the 24th week of pregnancy. These clinical indicators strongly suggest Gestational Hypertension with potential progression to Pre-eclampsia.",
    triggeredRules: [
      { id: 1, rule: "Systolic BP > 140 mmHg during pregnancy" },
      { id: 2, rule: "Diastolic BP > 90 mmHg during pregnancy" },
      { id: 3, rule: "Presence of severe headache and visual disturbances" }
    ],
    explanation: "The AI model correlates the specific combination of elevated vitals and neurological symptoms in the second trimester as a high-risk pattern for hypertensive disorders of pregnancy.",
    recommendedAction: "Immediate referral for further clinical evaluation, including proteinuria testing and fetal monitoring.",
    referralLevel: "CHC (Community Health Center) or District Hospital",
    followUpPlan: "Monitor BP daily if not admitted. Ensure patient rests in lateral position. Do not administer antihypertensives without a physician's prescription.",
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
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              AI Clinical Assessment
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Generated for {assessment.patientName} on April 5, 2026.
            </p>
          </div>
        </div>

        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm w-full sm:w-auto">
          <Download className="w-4 h-4" />
          Download PDF
        </button>
      </div>

      {/* Primary Risk & Confidence Card */}
      <div className="flex flex-col sm:flex-row gap-6">
        {/* Risk Badge */}
        <div className="flex-1 bg-red-50 border border-red-200 rounded-xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-sm">
          <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-4 shadow-sm border border-red-200">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-black text-red-700 tracking-tight mb-1">
            {assessment.riskLevel} RISK
          </h2>
          <p className="text-sm font-semibold text-red-600 uppercase tracking-widest">
            Immediate Action Required
          </p>
        </div>

        {/* Confidence Score */}
        <div className="flex-1 bg-white border border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-blue-500" />
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-4 border border-blue-100">
            <BrainCircuit className="w-8 h-8" />
          </div>
          <div className="flex items-baseline gap-1 mb-1">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">
              {assessment.confidenceScore}
            </h2>
            <span className="text-xl font-bold text-slate-400">%</span>
          </div>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">
            AI Confidence Score
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Clinical Summary */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-4">
              <FileText className="w-4 h-4 text-blue-600" />
              Clinical Summary
            </h3>
            <p className="text-slate-700 leading-relaxed text-sm">
              {assessment.clinicalSummary}
            </p>
          </div>

          {/* Explanation */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-4">
              <BrainCircuit className="w-4 h-4 text-purple-600" />
              AI Reasoning & Explanation
            </h3>
            <p className="text-slate-700 leading-relaxed text-sm">
              {assessment.explanation}
            </p>
          </div>

          {/* Action & Referral (Crucial) */}
          <div className="bg-red-50 rounded-xl border border-red-200 p-6 shadow-sm relative">
            <h3 className="flex items-center gap-2 text-sm font-bold text-red-800 mb-4">
              <ArrowRight className="w-4 h-4" />
              Recommended Clinical Action
            </h3>
            <p className="text-red-700 font-semibold mb-6">
              {assessment.recommendedAction}
            </p>
            
            <div className="bg-white rounded-lg p-4 border border-red-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Refer To</p>
                <p className="text-slate-900 font-bold mt-0.5">{assessment.referralLevel}</p>
              </div>
              <Link
                to="/referral"
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-semibold hover:bg-red-700 transition-colors whitespace-nowrap text-center shadow-sm"
              >
                Generate Referral Document
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column (1/3) */}
        <div className="space-y-6">
          {/* Triggered Rules */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-4">
              <Activity className="w-4 h-4 text-amber-500" />
              Triggered Clinical Rules
            </h3>
            <ul className="space-y-3">
              {assessment.triggeredRules.map((item) => (
                <li key={item.id} className="flex items-start gap-3">
                  <div className="mt-0.5 bg-amber-100 text-amber-700 p-1 rounded-md flex-shrink-0">
                    <AlertTriangle className="w-3 h-3" />
                  </div>
                  <span className="text-sm text-slate-700 leading-snug">
                    {item.rule}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Follow Up Plan */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-4">
              <Clock className="w-4 h-4 text-emerald-500" />
              Follow-up Protocol
            </h3>
            <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4">
              <div className="flex items-start gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5" />
                <p className="text-sm text-emerald-800 font-medium">
                  {assessment.followUpPlan}
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
