# AuraBrain - Personal Psychological Profile & Trajectory Analysis

A full-stack, production-ready web application that computes deterministic astrological ephemeris chart positions, Pythagorean numerology numbers, and empirical behavioral tendencies, then synthesizes a deep, personalized psychological profile and trajectory report using Google Gemini AI.

Designed with a calm, high-contrast, polished interface inspired by Notion, Linear, and ChatGPT.

---

## Architecture Overview

```
Browser (React + Vite + Tailwind CSS on Vercel)
       │
       ▼ (HTTPS REST API / JSON)
Express Server (Node.js + TypeScript on Render / Port 3000)
       │
       ├── Deterministic Astrology Engine (Julian Day & Keplerian Ephemeris Math)
       ├── Deterministic Numerology Engine (Pythagorean Core Numbers & Masters 11/22/33)
       ├── Geocoding & Timezone Service (Nominatim API / OpenCage / Fallback Matrix)
       ├── Session Telemetry & Consent Parser
       │
       ├── Google Gemini API (@google/genai SDK - Server Side Only)
       ▼
Supabase PostgreSQL Database (Cloud Persistence with Local In-Memory Fallback)
```

---

## Core Principles

1. **Calculations are done in code, not guessed by AI**: Planetary positions, zodiac signs, degree values, and numerological sums are computed mathematically. Gemini only interprets the calculated facts.
2. **Strict Server-Side Key Security**: The `GEMINI_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` reside exclusively on the server backend and are never sent to or exposed in the browser bundle.
3. **Graceful Fallbacks**: If Supabase or Gemini keys are omitted during local preview, the app automatically runs with high-craft deterministic fallbacks and local session memory.

---

## Local Development Setup

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your `GEMINI_API_KEY` (and optionally `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`).

### Step 3: Start Development Server
```bash
npm run dev
```
The server will start on `http://localhost:3000` (Express + Vite HMR).

---

## Deployment Instructions

### Frontend Deployment (Vercel)
1. Push the repository or `/client` directory to GitHub.
2. Import the repository into [Vercel](https://vercel.com).
3. Set Environment Variable:
   - `VITE_API_URL`: Your deployed Render backend URL (e.g., `https://personal-insights-api.onrender.com`).
4. Build Command: `npm run build`
5. Output Directory: `dist`

### Backend Deployment (Render)
1. Import the repository into [Render](https://render.com) as a **Web Service**.
2. Environment: `Node`
3. Build Command: `npm run build`
4. Start Command: `npm start` (Runs `node dist/server.cjs`)
5. Set Environment Variables on Render:
   - `GEMINI_API_KEY`: Your Google Gemini API Key
   - `GEMINI_MODEL`: `gemini-3.6-flash`
   - `CLIENT_URL`: Your Vercel frontend URL (for CORS protection)
   - `SUPABASE_URL`: Your Supabase Project URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase Service Role Key
   - `PORT`: `3000`

---

## Supabase Database Setup

1. Open your [Supabase Dashboard](https://supabase.com).
2. Go to **SQL Editor** -> **New Query**.
3. Copy the contents of `supabase_migration.sql` (or click **Supabase SQL** in the web app header) and paste into the editor.
4. Click **Run**.

---

## Scripts Reference

- `npm run dev`: Starts local development server (`tsx server.ts` + Vite middleware on port 3000).
- `npm run build`: Bundles frontend into `dist/` and compiles backend into `dist/server.cjs` via `esbuild`.
- `npm run start`: Launches production compiled server (`node dist/server.cjs`).
- `npm run lint`: Performs TypeScript compilation check (`tsc --noEmit`).

---

## Privacy & Security

- **No Third-Party Tracking**: No ad network pixels or cross-site cookies.
- **Data Deletion**: Users can delete their analysis and chat record instantly from the UI.
