<div align="center">

<br />

```
███████╗████████╗██╗  ██╗ █████╗ ██████╗  █████╗
██╔════╝╚══██╔══╝██║  ██║██╔══██╗██╔══██╗██╔══██╗
█████╗     ██║   ███████║███████║██████╔╝███████║
██╔══╝     ██║   ██╔══██║██╔══██║██╔══██╗██╔══██║
███████╗   ██║   ██║  ██║██║  ██║██║  ██║██║  ██║
╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝
                T  A  S  K  S
```

**The internal task management platform for [Ethara.ai](https://ethara.ai)**
*Built for teams that move fast and need structure.*

<br />

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=flat-square&logo=firebase&logoColor=black)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-Internal%20Only-red?style=flat-square)

<br />

![Access](https://img.shields.io/badge/%40ethara.ai-restricted%20access-gold?style=flat-square&logo=google&logoColor=white)
![Status](https://img.shields.io/badge/status-active-brightgreen?style=flat-square)
![Auth](https://img.shields.io/badge/auth-Google%20OAuth-4285F4?style=flat-square&logo=google&logoColor=white)

</div>

---

## 📌 What is this?

Ethara Tasks is a **full-stack internal workspace** that brings projects, teams, and tasks into one unified platform.

> 🔒 Access is restricted exclusively to `@ethara.ai` company accounts.
> Role-based permissions ensure everyone sees exactly what they need — nothing more.

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🛠 Tech Stack](#-tech-stack)
- [📁 Project Structure](#-project-structure)
- [🚀 Getting Started](#-getting-started)
- [🔥 Firebase Setup](#-firebase-setup)
- [🔐 Authentication](#-authentication--access-control)
- [🎭 Roles & Permissions](#-roles--permissions)
- [⚙️ Environment Variables](#%EF%B8%8F-environment-variables)
- [📦 Scripts](#-scripts)

---

## ✨ Features

<details>
<summary><b>🔐 Authentication & Access Control</b></summary>
<br />

| Feature | Details |
|---|---|
| **Google Sign-In** | Firebase Auth via `signInWithPopup` |
| **Domain Gate** | Non `@ethara.ai` accounts are signed out instantly |
| **Onboarding Flow** | First-time users pick Admin or Member before entering |
| **Account Hint** | Google picker pre-filtered with `hd: 'ethara.ai'` |

</details>

<details>
<summary><b>🛡 Admin Dashboard</b></summary>
<br />

| Feature | Details |
|---|---|
| **Overview Stats** | Total active projects and teams at a glance |
| **Project Creation** | Create projects with title and description |
| **Team Management** | Create teams, assign members, manage team-level roles |
| **Inline Editing** | Edit team title and description without modals |
| **Member Scoping** | Members already in another project are excluded from pickers |

</details>

<details>
<summary><b>🧑‍💻 Member Dashboard</b></summary>
<br />

| Feature | Details |
|---|---|
| **Personal Stats** | Tasks to do, completed, and upcoming deadlines |
| **Task Table** | Full list of assigned tasks with status, priority, and due date |
| **Status Updates** | Move tasks: `To Do → In Progress → Done` |
| **Team Navigation** | Jump directly to any assigned team's board |

</details>

<details>
<summary><b>📌 Task Management</b></summary>
<br />

| Feature | Details |
|---|---|
| **Task Fields** | Title, description, priority, due date, assignee |
| **Priority Levels** | `Low` `Medium` `High` `Urgent` — each with a distinct colour badge |
| **Kanban Board** | Three-column board: **To Do / In Progress / Done** |
| **Admin Controls** | Edit and delete tasks inline (Admin only) |

</details>

<details>
<summary><b>⚡ Real-Time Updates</b></summary>
<br />

Everything uses **Firestore `onSnapshot` subscriptions** — changes appear instantly across all connected clients, with zero polling or page refresh required.

- ✅ Live project list
- ✅ Live task board
- ✅ Live member lists
- ✅ Live team updates

</details>

---

## 🛠 Tech Stack

| Layer | Technology | Version |
|---|---|---|
| **Frontend** | React + TypeScript | `19` |
| **Bundler** | Vite | `6` |
| **Routing** | React Router | `v7` |
| **Styling** | Tailwind CSS | `v4` |
| **Animation** | Motion (Framer Motion) | latest |
| **Icons** | Lucide React | latest |
| **Database** | Firebase Firestore | realtime |
| **Auth** | Firebase Auth — Google OAuth | — |
| **Dates** | date-fns | — |
| **AI SDK** | @google/genai | — |

---

## 📁 Project Structure

```
src/
├── contexts/
│   └── AuthContext.tsx        # Auth state, domain enforcement, role management
│
├── lib/
│   ├── firebase.ts            # Firebase app initialisation
│   ├── db.ts                  # All Firestore read/write helpers + subscriptions
│   └── utils.ts               # Shared utilities
│
├── pages/
│   ├── LandingPage.tsx        # Public marketing page with sign-in CTA
│   ├── Onboarding.tsx         # First-login role selection screen
│   ├── Dashboard.tsx          # Role-aware dashboard router
│   ├── AdminDashboard.tsx     # Admin home — projects overview and creation
│   ├── MemberDashboard.tsx    # Member home — personal tasks and teams
│   ├── ProjectDetails.tsx     # Project overview + team management tabs
│   └── TeamDetails.tsx        # Team members + Kanban board + task CRUD
│
├── components/
│   └── layout/
│       ├── Navbar.tsx
│       └── Footer.tsx
│
├── App.tsx                    # Route definitions
└── main.tsx                   # Entry point
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** `18+`
- A configured **Firebase project** *(see [Firebase Setup](#-firebase-setup) below)*

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-org/ethara-tasks.git
cd ethara-tasks

# 2. Install dependencies
npm install

# 3. Add your Firebase config (see below)

# 4. Start the dev server
npm run dev
# → http://localhost:3000
```

---

## 🔥 Firebase Setup

### Step 1 — Create a Firebase project

Go to [console.firebase.google.com](https://console.firebase.google.com/) and enable:

- ☑️ **Authentication** → Sign-in method → **Google**
- ☑️ **Firestore Database** → Start in **production mode**

### Step 2 — Add `localhost` to Authorized Domains

> **Authentication → Settings → Authorized domains → Add domain → `localhost`**

> [!WARNING]
> Without this step, the Google sign-in popup opens and **immediately closes with no error**. This is the most common setup issue.

### Step 3 — Create the config file

Create `firebase-applet-config.json` in the project root:

```json
{
  "projectId": "your-project-id",
  "appId": "your-app-id",
  "apiKey": "your-api-key",
  "authDomain": "your-project-id.firebaseapp.com",
  "firestoreDatabaseId": "(default)",
  "storageBucket": "your-project-id.firebasestorage.app",
  "messagingSenderId": "your-sender-id",
  "measurementId": ""
}
```

> [!CAUTION]
> Add `firebase-applet-config.json` to `.gitignore`. Never commit API keys to version control.

---

## 🔐 Authentication & Access Control

Sign-in uses Google OAuth via `signInWithPopup`. After auth resolves, the domain is checked immediately:

```ts
// Domain gate — enforced on every sign-in
if (!currentUser.email?.endsWith('@ethara.ai')) {
  await signOut(auth);
  alert("Access Restricted: Only @ethara.ai accounts are permitted.");
  return;
}

// Pre-filter the Google account picker
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ hd: 'ethara.ai' });
```

> [!NOTE]
> The `hd` parameter is a **hint**, not a hard filter. The domain check in the callback is the actual security boundary.

---

## 🎭 Roles & Permissions

### Top-Level Roles *(chosen once at onboarding)*

| Role | Capabilities |
|---|---|
| 🛡 **Admin** | Create projects and teams · Manage all members · Create / edit / delete tasks · View all data |
| 🧑‍💻 **Member** | View assigned project and teams · Update own task status · Navigate team board |

### Team-Level Roles *(assigned per team by Admin)*

| Role | Description |
|---|---|
| **Tasker** | Default role — works on assigned tasks |
| **QR** | Quality Reviewer |
| **QL** | Quality Lead |
| **PL** | Project Lead |
| **Admin** | Full team-level permissions |

---

## ⚙️ Environment Variables

Firebase config is read from `firebase-applet-config.json` at runtime — no `.env` required for Firebase.

For any additional variables, create a `.env` file at the project root:

```env
# Vite exposes VITE_-prefixed vars via import.meta.env
VITE_SOME_KEY=your_value
```

---

## 📦 Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server on port `3000` |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run TypeScript type checks |
| `npm run clean` | Remove `dist/` and `server.js` |

---
