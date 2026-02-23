# CampusVote-Pro

CampusVote-Pro is a **modern real-time voting and election platform** built with **React**, **TypeScript**, **Supabase**, and **Tailwind CSS**. It enables authenticated users to view and participate in elections, access results, manage profiles, and — if authorised — perform admin tasks like creating and running elections.

---

## 🚀 Live Preview
🔗 **https://campusvote-pro.vercel.app**  
(Visit the deployed app to explore the UI and features.)

---

## 💡 Features

### 🔐 Authentication
- User signup + login with session management.
- Redirects based on auth status. :contentReference[oaicite:2]{index=2}

### 🌐 Pages & Routes
| Page | Description |
|------|-------------|
| **Login / Auth Page** | User login or registration. :contentReference[oaicite:3]{index=3} |
| **Dashboard** | Overview of elections and user info. :contentReference[oaicite:4]{index=4} |
| **Elections List** | View all available elections. :contentReference[oaicite:5]{index=5} |
| **Election Details** | Specific election with candidates and voting UI. :contentReference[oaicite:6]{index=6} |
| **Results** | See election results and vote breakdowns. :contentReference[oaicite:7]{index=7} |
| **Profile** | Update user profile and settings. :contentReference[oaicite:8]{index=8} |
| **Admin Panel** | Manage elections, users, permissions. :contentReference[oaicite:9]{index=9} |
| **AI Insights** | (Optional) Insights from AI (analytics/dashboard). :contentReference[oaicite:10]{index=10} |
| **404 / Not Found** | Fallback for invalid URLs. :contentReference[oaicite:11]{index=11} |

---

## 🛠 Built With

- **React** (UI library)
- **TypeScript** (typed JavaScript)
- **Supabase** (auth + database + real-time)
- **Tailwind CSS** (utility-first styling)
- **React Router** (routing)
- **React-Query** (API/ server state management)  
- **Vite** (dev tooling)

---

## 📦 Getting Started

### Prerequisites
Make sure you have:
- Node.js v16+
- npm / bun
- Supabase project with API keys

### 🔧 Local Setup

1. **Clone the repository**
```bash
git clone https://github.com/yashpawar9274/campusvote-pro.git
cd campusvote-pro
