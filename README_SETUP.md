# Kiviz Executive Lodge System (KVS) - Development Setup Guide

This guide explains how to set up the Kiviz Executive Lodge System (KVS) for local development.

---

# Prerequisites

Before starting, ensure the following software is installed:

* Git
* Node.js (LTS Version)
* npm
* Visual Studio Code
* PostgreSQL (Neon Database Account)
* GitHub Account

---

# Clone the Repository

```bash
git clone <repository-url>
cd kiviz-system
```

---

# Install Dependencies

## Backend

```bash
cd backend
npm install
```

## Frontend

Open a new terminal.

```bash
cd frontend
npm install
```

---

# Environment Variables

This project uses environment variables to keep sensitive information out of GitHub.

## Backend

Copy:

```text
backend/.env.example
```

Create:

```text
backend/.env
```

Fill in the required values:

* DATABASE_URL
* JWT_SECRET
* PORT
* OTP_EXPIRY_MINUTES
* ARKASEL_API_KEY (when available)
* ARKASEL_SENDER_ID (when available)

---

## Frontend

Copy:

```text
frontend/.env.example
```

Create:

```text
frontend/.env.local
```

Set:

```text
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

# Generate Prisma Client

Inside the backend folder:

```bash
npx prisma generate
```

---

# Run Database Migrations

If setting up the project for the first time:

```bash
npx prisma migrate dev
```

If migrations already exist:

```bash
npx prisma migrate deploy
```

---

# Start the Backend

```bash
cd backend
npm run start:dev
```

The backend should start on:

```text
http://localhost:3001
```

---

# Start the Frontend

In another terminal:

```bash
cd frontend
npm run dev
```

The frontend should start on:

```text
http://localhost:3000
```

---

# Development Workflow

For every feature:

1. Pull the latest changes.
2. Create or switch to the appropriate branch.
3. Implement the feature.
4. Test the feature.
5. Commit with a meaningful commit message.
6. Push to GitHub.

---

# Git Commit Message Convention

Use descriptive commit messages.

Examples:

```text
feat(auth): implement OTP request endpoint

feat(database): finalize Prisma schema

fix(prisma): configure Prisma 7 PostgreSQL adapter

feat(payment): integrate Paystack webhook

refactor(auth): extract SMS service
```

---

# Technology Stack

## Frontend

* Next.js
* React
* TypeScript

## Backend

* NestJS
* Prisma ORM
* PostgreSQL (Neon)

## Authentication

* OTP Authentication (Guests)
* JWT Authentication (Receptionists)
* Role-Based Access Control (RBAC)

## Payment

* Paystack

## SMS

* Arkasel SMS API (planned)

---

# Project Status

This project is under active development. Features will be implemented incrementally following a feature-by-feature development workflow with testing and Git commits after each completed milestone.
