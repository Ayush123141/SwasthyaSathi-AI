import { useState, useRef } from "react"
import { useNavigate, Link } from "react-router-dom"
import apiClient from "../lib/api"
import { 
  ArrowLeft, 
  User, 
  Activity, 
  Stethoscope, 
  Mic, 
  MicOff,
  FileText, 
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  UploadCloud,
  BrainCircuit,
  Info,
  Clock,
  ShieldAlert,
  Loader2,
  ActivitySquare
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
  const [isAssessing, setIsAssessing] = useState(false)
  
  // Voice State
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  
  // OCR State
  const [isUploadingOCR, setIsUploadingOCR] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // State for form data
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    village: "",
    sysBP: "",
    diaBP: "",
    heartRate: "",
    temperature: "",
    spo2: "",
    symptoms: ""
  })

  const [assessment, setAssessment] = useState<any>(null)

  const handleNext = async () => {
    if (currentStep === 4) {
      setIsAssessing(true)
      try {
        const patientRes = await apiClient.post('/patients/', {
          full_name: formData.name || "Unknown Patient",
          age: parseInt(formData.age) || 30,
          gender: (formData.gender || "female").toLowerCase(),
          village: formData.village || "Unknown Village",
          phone: "0000000000",
          pregnancy_status: "not_pregnant"
        })
        const patientData = patientRes.data
        if (!patientData.success) throw new Error("Failed to create patient")
        const patientId = patientData.data.id

        const visitRes = await apiClient.post('/visits/', {
          patient_id: patientId,
          visit_type: "routine",
          vitals: {
            systolic_bp: parseInt(formData.sysBP) || null,
            diastolic_bp: parseInt(formData.diaBP) || null,
            pulse_rate: parseInt(formData.heartRate) || null,
            temperature: parseFloat(formData.temperature) || null,
            spo2: parseInt(formData.spo2) || null
          },
          symptoms: [formData.symptoms]
        })
        const visitData = visitRes.data
        if (!visitData.success) throw new Error("Failed to create visit")
        const visitId = visitData.data.id

        const assessRes = await apiClient.post(`/visits/${visitId}/assess`)
        const assessData = assessRes.data
        if (!assessData.success) throw new Error("Failed to generate assessment")
        
        setAssessment(assessData.data)

      } catch (err) {
        console.error("Assessment pipeline failed:", err)
        alert("Failed to process the assessment through the backend API. Please ensure the backend is running and the Gemini API key is valid.")
      } finally {
        setIsAssessing(false)
        setCurrentStep(5)
      }
    } else {
      setCurrentStep((p) => Math.min(p + 1, steps.length))
    }
  }

  const handlePrev = () => setCurrentStep((p) => Math.max(p - 1, 1))

  const handleSubmit = () => {
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      navigate("/patients")
    }, 1500)
  }

  const startVoiceDictation = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop()
      setIsRecording(false)
      return
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      
      const audioChunks: BlobPart[] = []
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data)
      }
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
        setIsTranscribing(true)
        
        const fd = new FormData()
        fd.append('file', audioBlob, 'dictation.webm')
        
        try {
          const res = await apiClient.post('/upload/voice', fd, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })
          const data = res.data
          if (data.success && data.data.transcription) {
            setFormData(prev => ({
              ...prev,
              symptoms: prev.symptoms ? prev.symptoms + ' ' + data.data.transcription : data.data.transcription
            }))
          }
        } catch (err) {
          console.error("Transcription failed", err)
        } finally {
          setIsTranscribing(false)
          stream.getTracks().forEach(track => track.stop())
        }
      }
      
      mediaRecorder.start()
      setIsRecording(true)
    } catch (err) {
      console.error("Microphone access denied", err)
      alert("Microphone access is required for dictation.")
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setIsUploadingOCR(true)
    const fd = new FormData()
    fd.append('file', file)
    
    try {
      const res = await apiClient.post('/upload/ocr', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      const data = res.data
      if (data.success && data.data) {
        const d = data.data
        setFormData(prev => ({
          ...prev,
          sysBP: d.vitals?.blood_pressure?.split('/')[0] || prev.sysBP,
          diaBP: d.vitals?.blood_pressure?.split('/')[1] || prev.diaBP,
          temperature: d.vitals?.temperature || prev.temperature,
          heartRate: d.vitals?.heart_rate || prev.heartRate,
          spo2: d.vitals?.spo2 || prev.spo2,
          symptoms: prev.symptoms + (d.extracted_text ? `\n\n[OCR Data]: ${d.extracted_text}` : '') + (d.medications ? `\n[Medications]: ${d.medications.join(', ')}` : '')
        }))
        alert("OCR Extracted successfully! Check vitals and symptoms.")
      }
    } catch (err) {
      console.error("OCR upload failed", err)
      alert("Failed to process document.")
    } finally {
      setIsUploadingOCR(false)
    }
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
            Record a new patient visit and run AI clinical decision support.
          </p>
        </div>
      </div>

      {/* Stepper Progress */}
      <div className="mb-8 bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center justify-between relative overflow-x-auto">
        <div className="absolute top-1/2 left-8 right-8 h-0.5 bg-slate-100 -z-10 -translate-y-1/2" />
        <div 
          className="absolute top-1/2 left-8 h-0.5 bg-blue-500 -z-10 -translate-y-1/2 transition-all duration-300" 
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`, right: '2rem' }} 
        />
        
        {steps.map((step) => {
          const isActive = step.id === currentStep
          const isCompleted = step.id < currentStep
          return (
            <div key={step.id} className="flex flex-col items-center gap-2 bg-white px-2 z-10 shrink-0">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                  isActive ? "border-blue-500 bg-blue-50 text-blue-600" :
                  isCompleted ? "border-blue-500 bg-blue-500 text-white" :
                  "border-slate-200 bg-white text-slate-400"
                }`}
              >
                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <step.icon className="w-4.5 h-4.5" />}
              </div>
              <span className={`text-[11px] font-semibold uppercase tracking-wide hidden sm:block ${
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
          
          {/* STEP 1: PATIENT INFO */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-bold text-slate-900">Patient Demographics</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Full Name</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 rounded-md border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm outline-none transition-all" placeholder="Enter patient name" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Aadhaar / ID</label>
                  <input type="text" className="w-full px-4 py-2.5 rounded-md border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm outline-none transition-all" placeholder="Optional" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Age</label>
                  <input type="number" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} className="w-full px-4 py-2.5 rounded-md border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm outline-none transition-all" placeholder="Years" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Gender</label>
                  <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full px-4 py-2.5 rounded-md border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm outline-none transition-all">
                    <option value="">Select gender</option>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-sm font-semibold text-slate-700">Village / Address</label>
                  <input type="text" value={formData.village} onChange={e => setFormData({...formData, village: e.target.value})} className="w-full px-4 py-2.5 rounded-md border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm outline-none transition-all" placeholder="Current location" />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: VITALS */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-bold text-slate-900">Clinical Vitals</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Blood Pressure (Systolic)</label>
                  <div className="relative">
                    <input type="number" value={formData.sysBP} onChange={e => setFormData({...formData, sysBP: e.target.value})} className="w-full px-4 py-2.5 rounded-md border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm outline-none transition-all pr-12" placeholder="120" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">mmHg</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Blood Pressure (Diastolic)</label>
                  <div className="relative">
                    <input type="number" value={formData.diaBP} onChange={e => setFormData({...formData, diaBP: e.target.value})} className="w-full px-4 py-2.5 rounded-md border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm outline-none transition-all pr-12" placeholder="80" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">mmHg</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Heart Rate</label>
                  <div className="relative">
                    <input type="number" value={formData.heartRate} onChange={e => setFormData({...formData, heartRate: e.target.value})} className="w-full px-4 py-2.5 rounded-md border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm outline-none transition-all pr-12" placeholder="72" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">bpm</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">SpO2 (Oxygen)</label>
                  <div className="relative">
                    <input type="number" value={formData.spo2} onChange={e => setFormData({...formData, spo2: e.target.value})} className="w-full px-4 py-2.5 rounded-md border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm outline-none transition-all pr-12" placeholder="98" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">%</span>
                  </div>
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-sm font-semibold text-slate-700">Temperature</label>
                  <div className="relative">
                    <input type="number" step="0.1" value={formData.temperature} onChange={e => setFormData({...formData, temperature: e.target.value})} className="w-full px-4 py-2.5 rounded-md border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm outline-none transition-all pr-12" placeholder="98.6" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">°F</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: SYMPTOMS */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-lg font-bold text-slate-900">Symptoms & Chief Complaint</h2>
                <button 
                  onClick={startVoiceDictation}
                  disabled={isTranscribing}
                  className={`flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all w-full sm:w-auto border
                    ${isRecording ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : 
                      isTranscribing ? 'bg-slate-100 text-slate-400 border-slate-200' :
                      'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100'}`}
                >
                  {isTranscribing ? <Loader2 className="w-4 h-4 animate-spin" /> : 
                   isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  {isTranscribing ? "Transcribing..." : isRecording ? "Stop Recording" : "Start Voice Dictation"}
                </button>
              </div>
              <div className="space-y-1.5">
                <textarea 
                  rows={5}
                  value={formData.symptoms}
                  onChange={e => setFormData({...formData, symptoms: e.target.value})}
                  className="w-full px-4 py-3 rounded-md border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm outline-none transition-all resize-none" 
                  placeholder="Describe the patient's symptoms, duration, and any other relevant observations (e.g., 'Severe headache and blurred vision for 2 days')..."
                />
              </div>
            </div>
          )}

          {/* STEP 4: SCAN REPORTS */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-bold text-slate-900">Upload Reports (OCR)</h2>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept="image/*" 
                className="hidden" 
              />
              <div 
                onClick={() => !isUploadingOCR && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer group
                  ${isUploadingOCR ? 'border-slate-200 bg-slate-50' : 'border-slate-200 hover:border-blue-400 hover:bg-blue-50/50'}`}
              >
                {isUploadingOCR ? (
                   <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-4">
                     <Loader2 className="w-6 h-6 animate-spin" />
                   </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors mb-4">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                )}
                <h3 className="font-semibold text-slate-900">{isUploadingOCR ? "Extracting text..." : "Click to upload prescription or report"}</h3>
                <p className="text-sm text-slate-500 mt-1">Our Vision AI will extract vitals and medications automatically.</p>
                <p className="text-xs text-slate-400 mt-2">Supports JPG, PNG</p>
              </div>
            </div>
          )}

          {/* STEP 5: AI ASSESSMENT */}
          {currentStep === 5 && (
            <div className="space-y-8 animate-fade-in">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <BrainCircuit className="w-6 h-6 text-blue-600" /> AI Clinical Assessment
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">Generated by {assessment?.metadata?.ai_version} in {assessment?.metadata?.processing_time_sec}s</p>
                </div>
              </div>

              {/* Patient & Visit Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex gap-4">
                  <User className="w-5 h-5 text-slate-400 shrink-0" />
                  <div>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Patient Details</h3>
                    <p className="text-sm font-semibold text-slate-900">{formData.name || "Unknown"} • {formData.age || "-"}y • {formData.gender || "-"}</p>
                    <p className="text-sm text-slate-600 mt-0.5">{formData.village || "No location provided"}</p>
                  </div>
                </div>
                
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex gap-4">
                  <ActivitySquare className="w-5 h-5 text-slate-400 shrink-0" />
                  <div>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Current Vitals</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm font-medium text-slate-700">
                      <span>BP: <b className="text-slate-900">{formData.sysBP || "-"}/{formData.diaBP || "-"}</b></span>
                      <span>HR: <b className="text-slate-900">{formData.heartRate || "-"}</b></span>
                      <span>SpO2: <b className="text-slate-900">{formData.spo2 || "-"}%</b></span>
                      <span>Temp: <b className="text-slate-900">{formData.temperature || "-"}°F</b></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Risk Badge & Confidence */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className={`flex-1 p-6 rounded-xl border flex flex-col items-center justify-center text-center relative overflow-hidden shadow-sm ${
                  assessment?.risk_level === 'Critical' ? 'bg-red-50 border-red-200' :
                  assessment?.risk_level === 'High' ? 'bg-amber-50 border-amber-200' :
                  assessment?.risk_level === 'Medium' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-emerald-50 border-emerald-200'
                }`}>
                  <h3 className="text-sm font-bold uppercase tracking-widest mb-2 opacity-80">Risk Level</h3>
                  <h2 className={`text-4xl font-black tracking-tight ${
                    assessment?.risk_level === 'Critical' ? 'text-red-700' :
                    assessment?.risk_level === 'High' ? 'text-amber-700' :
                    assessment?.risk_level === 'Medium' ? 'text-yellow-700' :
                    'text-emerald-700'
                  }`}>
                    {assessment?.risk_level}
                  </h2>
                </div>

                <div className="flex-1 p-6 rounded-xl border border-blue-100 bg-blue-50 flex flex-col items-center justify-center text-center shadow-sm">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-blue-800 opacity-80 mb-2">AI Confidence</h3>
                  <div className="flex items-baseline gap-1 text-blue-700">
                    <h2 className="text-4xl font-black tracking-tight">{assessment?.confidence}</h2>
                    <span className="text-xl font-bold">%</span>
                  </div>
                </div>
              </div>

              {/* Emergency Detection Panel */}
              {assessment?.triggered_rules?.length > 0 && (
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
                  {assessment?.clinical_summary}
                </p>
                
                {assessment?.risk_factors?.length > 0 && (
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
              </div>

              {/* Recommended Actions */}
              <div className="p-6 rounded-xl border border-slate-200 bg-slate-900 text-white shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-3">
                  Recommended Action
                </h3>
                <p className="text-lg font-medium leading-snug">
                  {assessment?.recommended_action}
                </p>
              </div>

              {/* Follow up & Guidelines */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-sm">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-3">
                    <Clock className="w-4 h-4 text-emerald-600" /> Follow-up Plan
                  </h3>
                  <ul className="space-y-2">
                    {assessment?.follow_up_plan?.map((plan: string, i: number) => (
                      <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        {plan}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-sm">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-3">
                    <FileText className="w-4 h-4 text-purple-600" /> Reference Guidelines
                  </h3>
                  <ul className="space-y-2">
                    {assessment?.guidelines?.map((guide: string, i: number) => (
                      <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0 mt-1.5" />
                        {guide}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStep === 1 || isAssessing}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
              (currentStep === 1 || isAssessing) ? "text-slate-300 cursor-not-allowed" : "text-slate-600 hover:bg-slate-200"
            }`}
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          
          {currentStep < steps.length ? (
            <button
              onClick={handleNext}
              disabled={isAssessing}
              className="flex items-center gap-2 px-6 py-2 rounded-md bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
            >
              {isAssessing ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing AI Engine...</>
              ) : (
                <>Continue <ChevronRight className="w-4 h-4" /></>
              )}
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2 rounded-md bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Record & Finalize"}
              {!isSubmitting && <CheckCircle2 className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
