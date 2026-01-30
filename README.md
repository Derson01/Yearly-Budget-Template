# Yearly Budget App 💰

A modern web application that replicates the Excel "Yearly Budget Template" with 100% functional parity. Built with Next.js, FastAPI, and PostgreSQL.

## 🚀 Live Demo

- **Backend API**: https://winn-yearly-budget.onrender.com
- **Frontend**: Coming soon!

## 🏗️ Architecture

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend**: Python FastAPI with async PostgreSQL
- **Database**: PostgreSQL
- **Deployment**: Render (Backend), Vercel (Frontend - recommended)

## 📦 Local Development

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for frontend)
- Python 3.11+ (optional, for local backend dev)

### Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/Derson01/Yearly-Budget-Template.git
cd Yearly-Budget-Template
```

2. **Start the backend (Docker)**
```bash
docker-compose up -d
```

3. **Seed the database** (optional)
```bash
docker exec budget_backend python seed_data.py
```

4. **Start the frontend**
```bash
cd frontend
npm install
npm run dev
```

Visit: http://localhost:3000

## 🌐 Cloud Deployment

### Backend (Render)

1. Create a PostgreSQL database on Render
2. Create a new Web Service from GitHub repo
3. Set environment variable: `DATABASE_URL` = (your database URL)
4. Deploy!

### Frontend (Vercel - Recommended)

1. Push frontend to GitHub
2. Import project to Vercel
3. **IMPORTANT SETTINGS**:
   - Set **Root Directory** to `frontend`
   - **Ensure all Overrides are OFF** in Build & Development settings (Vercel will auto-detect Next.js)
4. Set environment variable: `NEXT_PUBLIC_API_URL` = https://winn-yearly-budget.onrender.com
5. Deploy!

## 📚 API Documentation

Interactive API docs: https://winn-yearly-budget.onrender.com/docs

## 🎯 Features

- ✅ Full Excel template logic parity
- ✅ Income, Expenses, Savings, Debt tracking
- ✅ Monthly budget planning
- ✅ Transaction ledger
- ✅ Financial ratios & analytics
- ✅ Variance tracking (Budget vs Actual)
- ✅ Premium fintech-inspired UI

## 📄 License

MIT
