# 🏥 SwasthyaSathi AI

**AI-powered Clinical Decision Support System for ASHA Workers**

An offline-first, intelligent healthcare assistant that combines Machine Learning, OCR, Voice AI, and Large Language Models to support frontline health workers in rural India.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.10+-green.svg)
![React](https://img.shields.io/badge/react-18+-61DAFB.svg)
![FastAPI](https://img.shields.io/badge/fastapi-0.115+-009688.svg)

---

## 🎯 Problem Statement

ASHA (Accredited Social Health Activist) workers serve as the critical link between rural communities and the healthcare system in India. They handle patient screening, referrals, and follow-ups — often with limited training, no internet connectivity, and paper-based records. SwasthyaSathi AI empowers them with an intelligent, offline-first clinical decision support system.

## 🧠 What Makes This Different

This is **not a chatbot**. It's a hybrid AI architecture where:

- **🚨 Rules** ensure patient safety (emergency detection in milliseconds)
- **📊 Machine Learning** predicts risk before symptoms worsen
- **📚 Retrieval** provides trusted government health guidelines
- **🤖 LLM** delivers explainable reasoning in local languages

## ✨ Key Features

### Core Clinical Features
- 📋 **Patient Registration** — Demographics, family details, pregnancy status, chronic diseases, allergies, vaccination history
- 🩺 **Visit Recording** — Structured vitals entry (BP, pulse, SpO₂, temperature, blood sugar, weight, BMI)
- 🎤 **Multilingual Voice Input** — Hindi, Marathi, English speech-to-text using Whisper
- 📄 **Medical Document OCR** — Extract text from prescriptions, lab reports, discharge summaries using PaddleOCR
- 🚨 **Emergency Rule Engine** — Instant red-flag detection (critical SpO₂, hypertensive crisis, seizures, severe bleeding)
- 📈 **ML Risk Prediction** — XGBoost model classifying patients as Low/Medium/High risk with confidence scores
- 📉 **Trend Analysis** — Track vital sign trends across visits to detect gradual deterioration
- 🧠 **AI Clinical Reasoning** — Gemini 2.5 Flash explains why a patient is at risk, suggests referrals, and generates follow-up plans
- 📚 **Guideline Retrieval** — FAISS-powered search across WHO, IMNCI, NHM protocols
- 📑 **PDF Referral Reports** — Professional reports with demographics, vitals, AI assessment, and recommendations

### Platform Features
- 🔒 **Role-based Auth** — ASHA worker and Supervisor roles via Supabase
- 📱 **Offline-First** — Works without internet, syncs when connectivity returns
- 🌐 **Multilingual** — Hindi, Marathi, English support throughout
- 📊 **Supervisor Dashboard** — Referral analytics, high-risk populations, village health trends
- 💊 **Medication & Vaccination Tracking** — Schedules, reminders, adherence monitoring
- 🤰 **Maternal Health Monitoring** — ANC visit tracking, pregnancy risk assessment
- 👶 **Child Growth Tracking** — WHO z-score based growth charts, malnutrition screening

## 🏗️ Architecture

```
                                ┌─────────────────────┐
                                │  React + Vite + TS   │
                                │  Tailwind + shadcn   │
                                └──────────┬──────────┘
                                           │
                                    REST API / WS
                                           │
                                ┌──────────┴──────────┐
                                │   FastAPI Backend     │
                                └──────────┬──────────┘
                                           │
          ┌────────────┬───────────┬───────┴───────┬──────────┐
          │            │           │               │          │
     Patient DB    AI Engine   OCR Engine     Voice AI    PDF Gen
          │            │           │               │          │
       Supabase    Gemini     PaddleOCR       Whisper   ReportLab
          │            │
          └────────────┤
                       │
             Clinical Decision Engine
                       │
          ┌────────────┼────────────┐
          │            │            │
     Rule Engine   ML Risk     Guideline
                   Model       Retrieval
          │            │            │
          └────────────┴────────────┘
                       │
               Recommendation
                       │
             Referral Report (PDF)
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| State Management | Zustand |
| Offline Storage | Dexie.js (IndexedDB) |
| Backend | FastAPI, Python 3.10+ |
| Database | Supabase (PostgreSQL + Auth) |
| ML Model | XGBoost with SHAP explainability |
| OCR | PaddleOCR |
| Voice AI | faster-whisper (local Whisper) |
| LLM | Google Gemini 2.5 Flash |
| Vector Search | FAISS + sentence-transformers |
| PDF Generation | ReportLab |
| Deployment | Vercel (frontend), Render/Railway (backend) |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- Git

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/SwasthyaSathi-AI.git
cd SwasthyaSathi-AI
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt

# Copy environment file and add your keys
cp .env.example .env

# Run the server
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Copy environment file and add your keys
cp .env.example .env

# Run the dev server
npm run dev
```

### 4. Open in browser
Navigate to `http://localhost:5173`

## 📁 Project Structure

```
SwasthyaSathi-AI/
├── frontend/          # React + TypeScript + Tailwind
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom hooks
│   │   ├── stores/       # Zustand state
│   │   ├── services/     # API clients
│   │   ├── db/           # Offline database
│   │   └── types/        # TypeScript types
│   └── ...
├── backend/           # FastAPI + Python
│   ├── app/
│   │   ├── api/          # Route handlers
│   │   ├── core/         # Config, security, DB
│   │   ├── models/       # Database models
│   │   ├── schemas/      # Pydantic schemas
│   │   ├── services/     # Business logic
│   │   └── ai/           # AI/ML engines
│   ├── ml/               # ML training pipeline
│   └── guidelines/       # Health guideline docs
├── database/          # SQL migrations
└── docs/              # Documentation
```

## 🔒 Environment Variables

### Backend (`backend/.env`)
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_api_key
```

### Frontend (`frontend/.env`)
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:8000
```

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

## 👥 Team

Built with ❤️ for NxtWave Hackathon 2026
