import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { 
  ArrowLeft, 
  User, 
  Activity, 
  Stethoscope, 
  Mic, 
  FileText, 
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  UploadCloud,
  BrainCircuit,
  AlertTriangle
} from "lucide-react"

const steps = [
  { id: 1, name: "Patient Info", icon: User },
  { id: 2, name: "Vitals", icon: Activity },
  { id: 3, name: "Symptoms", icon: Stethoscope },
  { id: 4, name: "Scan Reports", icon: FileText },
  { id: 5, name: "AI Assessment", icon: BrainCircuit },
]

export default function PatientRegistrationPage() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleNext = () => setCurrentStep((p) => Math.min(p + 1, steps.length))
  const handlePrev = () => setCurrentStep((p) => Math.max(p - 1, 1))

  const handleSubmit = () => {
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      navigate("/patients")
    }, 1500)
  }

  return (
    <div className="max-w-4xl mx-auto pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/patients"
          className="p-2 -ml-2 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            New Patient Visit
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Record a new patient visit and run clinical decision support.
          </p>
        </div>
      </div>

      {/* Stepper Progress */}
      <div className="mb-8 bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center justify-between relative">
        <div className="absolute top-1/2 left-8 right-8 h-0.5 bg-slate-100 -z-10 -translate-y-1/2" />
        <div 
          className="absolute top-1/2 left-8 h-0.5 bg-blue-500 -z-10 -translate-y-1/2 transition-all duration-300" 
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`, right: '2rem' }} 
        />
        
        {steps.map((step) => {
          const isActive = step.id === currentStep
          const isCompleted = step.id < currentStep
          return (
            <div key={step.id} className="flex flex-col items-center gap-2 bg-white px-2">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                  isActive ? "border-blue-500 bg-blue-50 text-blue-600" :
                  isCompleted ? "border-blue-500 bg-blue-500 text-white" :
                  "border-slate-200 bg-white text-slate-400"
                }`}
              >
                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <step.icon className="w-4.5 h-4.5" />}
              </div>
              <span className={`text-[11px] font-semibold uppercase tracking-wide ${
                isActive ? "text-blue-700" : isCompleted ? "text-slate-700" : "text-slate-400"
              }`}>
                {step.name}
              </span>
            </div>
          )
        })}
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
        <div className="p-6 sm:p-8">
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-bold text-slate-900">Patient Demographics</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Full Name</label>
                  <input type="text" className="w-full px-4 py-2.5 rounded-md border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm outline-none transition-all" placeholder="Enter patient name" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Aadhaar / ID</label>
                  <input type="text" className="w-full px-4 py-2.5 rounded-md border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm outline-none transition-all" placeholder="Optional" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Age</label>
                  <input type="number" className="w-full px-4 py-2.5 rounded-md border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm outline-none transition-all" placeholder="Years" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Gender</label>
                  <select className="w-full px-4 py-2.5 rounded-md border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm outline-none transition-all">
                    <option>Select gender</option>
                    <option>Female</option>
                    <option>Male</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-sm font-semibold text-slate-700">Village / Address</label>
                  <input type="text" className="w-full px-4 py-2.5 rounded-md border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm outline-none transition-all" placeholder="Current location" />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-bold text-slate-900">Clinical Vitals</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Blood Pressure (Systolic)</label>
                  <div className="relative">
                    <input type="number" className="w-full px-4 py-2.5 rounded-md border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm outline-none transition-all pr-12" placeholder="120" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">mmHg</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Blood Pressure (Diastolic)</label>
                  <div className="relative">
                    <input type="number" className="w-full px-4 py-2.5 rounded-md border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm outline-none transition-all pr-12" placeholder="80" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">mmHg</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Heart Rate</label>
                  <div className="relative">
                    <input type="number" className="w-full px-4 py-2.5 rounded-md border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm outline-none transition-all pr-12" placeholder="72" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">bpm</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Temperature</label>
                  <div className="relative">
                    <input type="number" step="0.1" className="w-full px-4 py-2.5 rounded-md border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm outline-none transition-all pr-12" placeholder="98.6" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">°F</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">Symptoms & Chief Complaint</h2>
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold hover:bg-blue-100 transition-colors">
                  <Mic className="w-3.5 h-3.5" /> Start Voice Dictation
                </button>
              </div>
              <div className="space-y-1.5">
                <textarea 
                  rows={5}
                  className="w-full px-4 py-3 rounded-md border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm outline-none transition-all resize-none" 
                  placeholder="Describe the patient's symptoms, duration, and any other relevant observations..."
                />
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-bold text-slate-900">Upload Reports (OCR)</h2>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-blue-400 hover:bg-blue-50/50 transition-colors cursor-pointer group">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors mb-4">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-slate-900">Click to upload or drag & drop</h3>
                <p className="text-sm text-slate-500 mt-1">Prescriptions, lab reports, or past medical records.</p>
                <p className="text-xs text-slate-400 mt-2">Supports JPG, PNG, PDF</p>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-bold text-slate-900">AI Assessment Review</h2>
              <div className="p-5 rounded-xl border border-red-200 bg-red-50 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
                <div className="flex items-center gap-2 text-red-600 mb-3">
                  <AlertTriangle className="w-5 h-5" />
                  <h3 className="font-bold">High Risk Detected</h3>
                </div>
                <p className="text-sm text-slate-700 font-medium">
                  The inputted vitals and symptoms trigger protocols for Gestational Hypertension. 
                  Immediate referral to CHC is advised.
                </p>
              </div>
              
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Summary of Record</h3>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <div className="text-slate-500">Name:</div>
                  <div className="font-semibold text-slate-900">Aarti Devi</div>
                  <div className="text-slate-500">BP:</div>
                  <div className="font-semibold text-slate-900">140 / 90</div>
                  <div className="text-slate-500">Symptoms:</div>
                  <div className="font-semibold text-slate-900">Headache, blurred vision</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStep === 1}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
              currentStep === 1 ? "text-slate-300 cursor-not-allowed" : "text-slate-600 hover:bg-slate-200"
            }`}
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          
          {currentStep < steps.length ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2 rounded-md bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
            >
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2 rounded-md bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
            >
              {isSubmitting ? "Saving..." : "Save Record & Refer"}
              {!isSubmitting && <CheckCircle2 className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
