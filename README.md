# Doctor Tracker — Client Application

> Modern Next.js (App Router) frontend interface for Doctor Tracker administrative web application.

---

## 1. Description (Elevator Pitch)

Doctor Tracker Client is an administrative web application built with Next.js App Router, TypeScript, and Tailwind CSS. It provides a secure dashboard for managing doctors, assigning patients, viewing real-time MongoDB clinical analytics via Recharts, receiving Socket.io notifications, and managing admin profile security.

---

## 2. Setup Guide

### Prerequisites
- **Node.js**: v18.x or higher
- **Package Manager**: npm

### Installation Steps

1. Navigate to the `client/` directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your `.env.local` environment file (copied from `.env.example`):
   ```bash
   cp .env.example .env.local
   ```
4. Configure environment variables in `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
   NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
   ```
5. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   The client application will run on `http://localhost:3000`.

---

## 3. System Architecture

```
[ Next.js Client App (App Router) ]
       │
       ├─► (TanStack Query / Fetch API) ────► [ Express REST API (5000) ]
       ├─► (Socket.io WebSockets)   ────► [ Socket.io Server (5000) ]
       └─► (httpOnly JWT Cookie)   ────► [ Auth Middleware Guard ]
```

---

## 4. Technical Decisions

1. **TanStack Query (React Query) for Server State**: Solves client-side caching, deduping, background refetching, and real-time query invalidation (`queryClient.invalidateQueries()`) upon mutations without manual page reloads.
2. **Next.js App Router with Client Boundaries**: Uses Server Components for read-only pages and Client Components for interactive modals and tables.
3. **httpOnly Cookie Authentication Guard**: Protected routes (`/dashboard/*`) are guarded by Next.js `middleware.ts` checking httpOnly JWT session cookies.

---

## 5. Visual Evidence (UI Screenshots)

| Feature | Desktop View | Mobile View |
|---|---|---|
| **Executive Analytics Dashboard** | Real-time KPI cards, trend line charts, department bar charts, peak hours, and condition breakdown. | Fully responsive stacked mobile layout. |
| **Doctors Directory** | Dual Card Grid View & Table List View switcher with search & filters. | Responsive single-column doctor cards. |
| **Doctor Profile Detail** | Doctor header, workload KPIs, and search/filtered assigned patients table. | Responsive doctor profile layout. |
| **Patients Directory** | Server-side paginated patient roster, condition & status filters. | Responsive mobile patient cards. |
| **Secret Admin Portal** | Frameless login screen with 5-attempt rate limiter & countdown timer. | Clean mobile login interface. |
| **Admin Profile & Audit Logs** | Credentials update, password change form, and 3-day auth activity log table. | Responsive security controls. |

---

## 6. Submission Credentials & Repository Links

- **Secret Login Route**: `/secretlogin`
- **Default Seed Admin Email**: `admin@doctracker.com`
- **Default Seed Admin Password**: `AdminSecretPassword123!`
- **Frontend Repository**: `https://github.com/...`
- **Backend Repository**: `https://github.com/...`

---
# doctracker-client
