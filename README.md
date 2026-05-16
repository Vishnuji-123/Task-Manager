# Ethara Tasks

> The internal task management platform for **Ethara.ai** — built for teams that move fast and need structure.

Ethara Tasks is a full-stack web application that brings projects, teams, and tasks into a single, unified workspace. Access is restricted exclusively to `@ethara.ai` company accounts, with role-based permissions ensuring everyone sees exactly what they need.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Firebase Setup](#firebase-setup)
- [Authentication & Access Control](#authentication--access-control)
- [Roles & Permissions](#roles--permissions)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)

---

## Features

### Authentication
- **Google Sign-In** via Firebase Authentication with `signInWithPopup`
- **Domain enforcement** — only `@ethara.ai` accounts can log in; all others are signed out immediately with a clear error message
- **Onboarding flow** — first-time users pick their role (Admin or Member) before accessing the dashboard

### Role-Based Access
- Two top-level roles: **Admin** and **Member**, selected once during onboarding
- Five team-level roles assignable per member: **Tasker**, **Quality Reviewer (QR)**, **Quality Lead (QL)**, **Project Lead (PL)**, and **Admin**
- Admins see the full workspace; Members see only their assigned project and teams

### Admin Dashboard
- Overview stats: total active projects and total teams
- Create new projects with a title and description
- Navigate into any project to manage it in depth

### Project Management
- **Overview tab** — at-a-glance stats: total teams, assigned members, total tasks, and completed tasks
- **Teams tab** — list all teams in the project; create new teams with a name, description, and pre-selected members
- Member assignment is scoped — users already assigned to another project are excluded from the picker

### Team Management
- Edit team title and description inline
- **Members tab** — full member list with role management; add new members via a searchable picker; remove members from the team
- **Task Board tab** — a three-column Kanban board (To Do / In Progress / Done) with task count badges per column

### Task Management
- Create tasks with: title, description, priority level, due date, and assignee
- **Priority levels**: Low, Medium, High, Urgent — each with a distinct colour badge
- Edit or delete tasks inline directly from the Kanban board (Admin only)
- Members can update their own task status (To Do → In Progress → Done) from their personal dashboard

### Member Dashboard
- Personal stats: tasks to do, completed tasks, and upcoming deadlines
- View assigned project and all teams the member belongs to
- Full table of assigned tasks with status selector, priority badge, and due date
- Navigate directly into any assigned team

### Real-Time Updates
- All project, team, task, and member lists use **Firestore real-time subscriptions** (`onSnapshot`) — changes appear instantly without page refresh

### Animated UI
- Smooth entrance and scroll animations powered by **Motion (Framer Motion)**
- Responsive layout across mobile, tablet, and desktop

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite 6 |
| Routing | React Router v7 |
| Styling | Tailwind CSS v4 |
| Animation | Motion (Framer Motion) |
| Icons | Lucide React |
| Backend / DB | Firebase Firestore |
| Auth | Firebase Authentication (Google OAuth) |
| Date Formatting | date-fns |
| AI SDK | @google/genai |

---

## Project Structure

```
src/
├── contexts/
│   └── AuthContext.tsx       # Auth state, Google sign-in, domain enforcement, role management
├── lib/
│   ├── firebase.ts           # Firebase app initialisation
│   ├── db.ts                 # All Firestore read/write helpers and subscriptions
│   └── utils.ts              # Shared utility functions
├── pages/
│   ├── LandingPage.tsx       # Public marketing page with sign-in CTA
│   ├── Onboarding.tsx        # First-login role selection screen
│   ├── Dashboard.tsx         # Role-aware dashboard router
│   ├── AdminDashboard.tsx    # Admin home — projects overview and creation
│   ├── MemberDashboard.tsx   # Member home — personal tasks and team view
│   ├── ProjectDetails.tsx    # Project overview and team management
│   └── TeamDetails.tsx       # Team members, Kanban board, task CRUD
├── components/
│   └── layout/
│       ├── Navbar.tsx
│       └── Footer.tsx
├── App.tsx                   # Route definitions
└── main.tsx                  # Entry point
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Firebase project (see [Firebase Setup](#firebase-setup) below)

### Installation

```bash
# Clone the repo
git clone https://github.com/your-org/ethara-tasks.git
cd ethara-tasks

# Install dependencies
npm install
```

### Running Locally

```bash
npm run dev
```

The app runs on `http://localhost:3000` by default.

---

## Firebase Setup

### 1. Create a Firebase project

Go to [Firebase Console](https://console.firebase.google.com/), create a project, and enable:
- **Authentication** → Sign-in method → **Google**
- **Firestore Database** → Start in production mode

### 2. Add `localhost` to Authorized Domains

This is required for Google sign-in to work locally:

1. Firebase Console → **Authentication** → **Settings** → **Authorized domains**
2. Click **Add domain** → enter `localhost` → Save

> Without this step, the Google sign-in popup will open and immediately close with no error.

### 3. Add your Firebase config

The app reads Firebase config from `firebase-applet-config.json` in the project root:

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

---

## Authentication & Access Control

Sign-in is done via Google OAuth using `signInWithPopup`. After authentication, the app immediately checks the user's email domain:

```ts
if (!currentUser.email?.endsWith('@ethara.ai')) {
  await signOut(auth);
  alert("Access Restricted: Only @ethara.ai accounts are permitted.");
  return;
}
```

If the domain check fails, the user is signed out instantly. The Google account picker is also hinted with `hd: 'ethara.ai'` so only company accounts are shown by default.

---

## Roles & Permissions

### Top-Level Roles (selected at onboarding)

| Role | Capabilities |
|---|---|
| **Admin** | Create projects and teams, manage all members, create/edit/delete tasks, view all dashboards |
| **Member** | View assigned project and teams, update own task status, navigate to assigned team board |

### Team-Level Roles (assigned per team by Admin)

| Role | Description |
|---|---|
| **Tasker** | Default role; works on assigned tasks |
| **QR** | Quality Reviewer |
| **QL** | Quality Lead |
| **PL** | Project Lead |
| **Admin** | Full team-level permissions |

---

## Environment Variables

This project does not use a `.env` file for Firebase config — the config is loaded from `firebase-applet-config.json` at runtime. If you need to add environment-specific variables, create a `.env` file at the project root:

```env
VITE_SOME_KEY=your_value
```

Vite exposes `VITE_` prefixed variables to the client via `import.meta.env`.

---

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run TypeScript type checks |
| `npm run clean` | Remove `dist/` and `server.js` |

---

## License

Internal use only. This project is proprietary to **Ethara.ai** and not licensed for public distribution.
