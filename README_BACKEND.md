# 🏨 Kiviz Executive Lodge System (KVS)

A modern IoT-enabled guest house management system developed for **Kiviz Executive Lodge** to improve revenue transparency, streamline guest management, and provide secure smart room access using RFID technology and ESP32.

> **Project Status:** 🚧 Active Development

---

# 📖 Overview

The Kiviz Executive Lodge System (KVS) is a full-stack web application that digitizes the complete guest house workflow, including:

- Guest registration and OTP authentication
- Guest profile management
- Room management
- Online room booking
- Walk-in guest booking
- Online and cash payment processing
- Receptionist operations
- Smart RFID room access
- Administrative management
- Access logging and auditing

The project is being developed as a final-year Computer Science and Engineering capstone project with a focus on **revenue transparency**, **secure access control**, and **IoT integration**.

---

# ✨ Current Features

## Authentication

- OTP-based passwordless authentication
- JWT authentication
- Complete profile workflow
- Profile update
- Role-based authorization
- Global request validation

---

## User Management

- Guest accounts
- Receptionist accounts
- Administrator accounts
- Employee IDs
- Active/Inactive staff support

---

## Room Management

- Create rooms
- View all rooms
- View individual rooms
- Update room information
- Change room status
- Permanent room lifecycle management

Room lifecycle:

AVAILABLE
↓
BOOKED
↓
RESERVED
↓
OCCUPIED
↓
AVAILABLE

Rooms may also be placed into MAINTENANCE at any time by an administrator.

---

## Booking

- Online room booking
- Walk-in guest booking
- Booking reference generation
- Booking date validation
- Room availability validation
- Automatic cleanup of unpaid bookings after 24 hours
- Shared booking validation
- Shared booking creation workflow
- Guest booking cancellation
- Receptionist booking cancellation
- Administrator booking cancellation
- Shared booking cancellation workflow

Booking lifecycle:

PENDING
↓
PAID
↓
CHECKED_IN
↓
CHECKED_OUT

or

PENDING
↓
CANCELLED

or

PAID
↓
CANCELLED

---

## Payments

- Paystack Test Mode integration
- Manual cash payment support
- Payment initialization
- Payment verification
- Shared payment amount validation
- Secure payment reference generation
- Duplicate payment verification protection
- Automatic booking status updates after successful payment

---

## Reception

- Walk-in guest booking
- Cash payment recording
- Guest check-in
- Guest check-out
- Booking extension
- Booking cancellation
- Automatic access PIN generation
- Automatic SMS notification after check-in (Arkasel Sandbox)
- Resend guest access PIN

---

## Administration

### Dashboard

- Dashboard statistics
- Room statistics
- Booking statistics

### Room Management

- Create rooms
- View rooms
- View room details
- Update room information
- Change room status

### Reception

- Reception dashboard statistics
- Walk-in guest booking
- Booking search by booking reference and guest phone number
- Booking details
- Guest check-in
- Guest check-out
- Booking extension preview
- Booking extension confirmation
- Automatic access PIN generation
- Automatic SMS notification after check-in (Arkasel Sandbox)
- Resend guest access PIN
- Reveal guest access PIN
- Receptionist booking cancellation

### Booking Management

- Booking statistics
- List bookings
- View booking details
- Cancel bookings

### Payment Management

- Revenue summary
- List payments
- Payment details

### Access Device Management

- List ESP32 access devices
- View access device details
- Register access devices
- Update access devices
- Enable access devices
- Disable access devices

### Reports & Logs

- Occupancy report
- Revenue report
- Access log report
- Security audit report

### Security Audit

- View security audit logs

---

## Smart Access Control

### Access Device Management

- ESP32 access device registration
- Permanent room-to-device assignment
- API key generation
- Device authentication using API keys

### Access Verification

- Unified `/access/verify` endpoint
- ESP32 authentication
- RFID validation
- Booking validation
- Booking date validation
- Centralized backend access decision
- Access logging and auditing

---

# 🚧 Features In Progress

- ESP32 firmware integration
- PIN authentication
- Receptionist Dashboard improvements
- Guest Check-out
- Booking Extension
- Admin Dashboard
- Reporting & Analytics
- Frontend Application

---

# 🛠 Technology Stack

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui

## Backend

- NestJS
- Prisma ORM
- PostgreSQL (Neon)
- REST API

## Authentication

- JWT
- OTP Authentication

## Payment Gateway

- Paystack (Test Mode)

## SMS

- Arkasel SMS API (Sandbox)

## IoT Components

- ESP32
- MFRC522 RFID Reader
- RFID Cards
- 4×4 Keypad
- OLED Display
- DS3231 RTC
- Electric Door Lock
- Magnetic Door Sensor

---

# 📂 Project Structure

```text
backend/
frontend/
docs/
```

---

# 📡 API Endpoints

## Authentication

| Method | Endpoint |
|---------|----------|
| POST | /auth/request-otp |
| POST | /auth/verify-otp |
| GET | /auth/profile |
| PATCH | /auth/email |

---

## Rooms

| Method | Endpoint |
|---------|----------|
| POST | /rooms |
| GET | /rooms |

---

## Bookings

| Method | Endpoint |
|---------|----------|
| POST | /bookings |

---

## Payments

| Method | Endpoint |
|---------|----------|
| POST | /payments |
| GET | /payments/verify/:reference |

---

## Reception

| Method | Endpoint |
|---------|----------|
| GET | /reception/dashboard |
| POST | /reception/walk-in |

---

## RFID

| Method | Endpoint |
|---------|----------|
| POST | /rfid/register |
| PUT | /rfid/replace |
| GET | /rfid |

---

## Access Devices

| Method | Endpoint |
|---------|----------|
| POST | /access-device/register |

---

## Smart Access

| Method | Endpoint |
|---------|----------|
| POST | /access/verify |

---

# 🔒 Security Features

- OTP-based guest authentication
- JWT authentication
- Role-based authorization
- Protected endpoints
- Secure payment verification
- Duplicate payment prevention
- API key authentication for ESP32 devices
- Device-to-room authentication
- RFID validation
- Centralized backend access decisions
- Access logging and auditing

---

# 🎯 Project Objectives

- Improve revenue transparency
- Eliminate manual booking records
- Secure guest authentication
- Automate payment verification
- Digitize receptionist operations
- Enable smart RFID room access
- Provide administrative reporting

---

| Module | Status |
|----------|--------|
| Authentication | ✅ Completed |
| Room Management | ✅ Completed |
| Booking | ✅ Completed |
| Payment (Paystack) | ✅ Completed |
| Reception Module | ✅ Completed |
| Admin Module | ✅ Completed |
| Access Device Management | ✅ Completed |
| Reports & Logs | ✅ Completed |
| Security Audit | ✅ Completed |
| Smart Access (PIN) | ✅ Completed |
| ESP32 Firmware Integration | ✅ Completed |
| Frontend | 🚧 In Progress |

---

# 🏗 Architecture Highlights

The backend follows a modular architecture where each module owns its business logic while higher-level modules orchestrate workflows.

## Shared Business Logic

- Shared booking validation
- Shared booking creation workflow
- Shared booking cancellation workflow
- Shared payment validation
- Shared payment processing
- Shared security audit logging
- Shared room lifecycle management
- Frontend-friendly API responses

## Room Lifecycle

AVAILABLE

↓

BOOKED

↓

RESERVED

↓

OCCUPIED

↓

AVAILABLE

Rooms can be placed into MAINTENANCE at any time by an administrator.

## Access Device Lifecycle

ACTIVE

↓

DISABLED

↓

ACTIVE

Installed ESP32 devices are never deleted from the database.

Disabled devices are prevented from authenticating with the backend until re-enabled.

## Modular Architecture

Authentication Module

↓

Booking Module

↓

Payment Module

↓

Reception Module

↓

Access Device Module

↓

Access Module (ESP32 Firmware)

↓

Admin Module (Frontend APIs)

Business logic remains inside its owning module while the Admin module exposes frontend-oriented endpoints.

---

# 👩‍💻 Developer

**Group 16**

Bachelor of Science in Computer Science and Engineering

University of Mines and Technology (UMaT)

---

# 📄 License

This project was developed for academic purposes as a final-year capstone project.