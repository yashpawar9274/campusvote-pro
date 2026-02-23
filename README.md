# 🗳️ CampusVote-Pro

<p align="center">
  <img src="https://img.shields.io/badge/React-18-blue?logo=react" />
  <img src="https://img.shields.io/badge/TypeScript-Strict-blue?logo=typescript" />
  <img src="https://img.shields.io/badge/Vite-Fast-purple?logo=vite" />
  <img src="https://img.shields.io/badge/TailwindCSS-Modern-38B2AC?logo=tailwind-css" />
  <img src="https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase" />
  <img src="https://img.shields.io/badge/Status-Production Ready-success" />
</p>

<p align="center">
  <b>Secure Digital Campus Voting System</b><br/>
  Real-Time • Authenticated • Scalable • Modern UI
</p>

---

## 🚀 Live Demo

🔗 https://campusvote-pro.vercel.app  

---

## 📌 Overview

CampusVote-Pro is a full-stack digital voting system designed for colleges and universities.  
It enables secure student authentication, candidate listing, real-time voting, and instant result calculation.

The platform demonstrates real-world election logic with secure backend integration using Supabase.

---

## 🎯 Problem Statement

Traditional campus voting systems suffer from:

- Manual ballot errors
- Vote tampering risks
- Delayed result counting
- Lack of transparency
- No centralized dashboard

CampusVote-Pro solves these issues with a modern digital solution.

---

## ✨ Core Features

### 🔐 Authentication System
- Secure login/signup using Supabase Auth
- Role-based access (Admin / Student)
- Protected routes

### 🗳 Voting System
- One vote per user
- Real-time vote count updates
- Vote locking after submission
- Duplicate prevention logic

### 📊 Results Dashboard
- Live vote counting
- Candidate ranking
- Percentage calculation
- Clean UI analytics display

### 🛠 Admin Controls
- Create election
- Add candidates
- Start/End voting session
- View total participation stats

### 📱 UI/UX
- Fully responsive (Mobile + Desktop)
- Modern glassmorphism design
- Smooth transitions
- Accessible components

---

## 🛠 Tech Stack

| Layer | Technology |
|--------|------------|
| Frontend | React 18 + TypeScript |
| Styling | Tailwind CSS + shadcn-ui |
| Backend | Supabase |
| Database | PostgreSQL (via Supabase) |
| Deployment | Vercel |
| Routing | React Router |
| State | React Hooks |

---

## 📂 Folder Structure

campusvote-pro/
│
├── public/
├── src/
│ ├── components/
│ ├── pages/
│ ├── hooks/
│ ├── services/
│ ├── utils/
│ └── App.tsx
│
├── supabase/
├── package.json
├── vite.config.ts
└── README.md



---

## ⚙️ Installation Guide

### 1️⃣ Clone Repository

```bash
git clone https://github.com/yashpawar9274/campusvote-pro.git

cd campusvote-pro



npm install

VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key


npm run dev

