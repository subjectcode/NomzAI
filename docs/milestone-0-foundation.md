# Milestone 0: Foundation Architecture & Specifications

## Overview
Nomz is an AI-powered mobile food assistant prototype built for hackathon demonstration.

## Milestone 0 Architecture
- **Frontend**: React Native + Expo (TypeScript).
  - Minimal screen with "Nomz" branding, backend status indicator, and "Check Connection" button.
  - Dynamically reads backend base URL from environment variable `EXPO_PUBLIC_API_URL`.
  - Dispatches `GET /api/health` and displays state: "Connecting...", "Backend Connected", or "Connection Failed".
- **Backend**: Python FastAPI with SQLite database via SQLAlchemy.
  - Lightweight and modular directory structure: `app/main.py`, `app/core/config.py`, `app/db/database.py`, `app/api/routes/health.py`.
  - Database initialization with `nomz.db`.
  - `GET /api/health` actively queries the SQLite database via `SELECT 1` before responding.
  - CORS middleware configured to allow Expo client access across web, emulators, and local devices.
