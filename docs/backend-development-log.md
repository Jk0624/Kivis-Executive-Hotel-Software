# Kiviz Executive Lodge System (KVS)

## Development Log

---

# Milestone 1 — Project Foundation

**Date:** 2026-07-03

## Completed

- Initialized the KVS monorepo.
- Created separate frontend and backend applications.
- Configured Git and GitHub repository.
- Connected NestJS backend to Neon PostgreSQL.
- Configured Prisma ORM.
- Created the initial database schema.
- Created Disaster Recovery strategy using OneDrive.
- Configured Postman for API testing.

## Lessons Learned

- Avoid nested Git repositories.
- Commit after every completed business capability.
- Always maintain a recovery point.

---

# Milestone 2 — OTP Authentication

**Date:** 2026-07-03

## Completed

### OTP Request

- Generated 6-digit OTP.
- Hashed OTP before storage.
- Stored OTP in PostgreSQL.
- Implemented mock SMS service.

### OTP Verification

- Verified latest unused OTP.
- Validated OTP expiration.
- Compared hashed OTP securely.
- Prevented OTP replay attacks.
- Marked OTP as used after successful verification.

### Guest Authentication

- Looked up guest by phone number.
- Automatically created guest if first login.
- Automatically verified guest after successful OTP verification.
- Returned a safe authentication response without exposing internal fields.

### Refactoring

- Extracted private helper methods.
- Improved AuthService readability.
- Replaced anonymous types with Prisma generated types.
- Refactored without changing application behaviour.

## Testing Completed

- OTP request
- OTP verification
- Invalid OTP rejection
- Expired OTP rejection
- Replay attack prevention
- Guest creation
- Returning guest login
- User verification
- Safe API response

## Current Authentication Flow

Phone Number

↓

Request OTP

↓

Generate OTP

↓

Hash OTP

↓

Store OTP

↓

Send SMS (Mock)

↓

Verify OTP

↓

Validate Expiration

↓

Validate Hash

↓

Prevent Replay

↓

Find Existing Guest

↓

Create Guest (if necessary)

↓

Verify Guest

↓

Return Safe Authentication Response

## Git Milestone

Authentication module successfully refactored and stabilized.

---

## KVS Development Principles

1. One Feature = One Commit
2. One Business Rule at a Time
3. Every Method Should Read Like English
4. Backend Defines the Business Rules
5. Protect Every Milestone with Git
6. Test Every Feature Before Moving On
7. Keep the Codebase Clean as It Grows
8. Every Coding Step Starts With the File Path
9. Use Clear Section Comments
10. Explain Why, Not Just What
11. Group Related Changes
12. Refactor Before Expanding
13. Reuse Generated Types

---

# Milestone 3 — JWT Authentication

**Date:** 2026-07-03

## Completed

### JWT Infrastructure

- Installed JWT and Passport packages.
- Configured JwtModule using ConfigService.
- Added JWT secret through environment variables.

### JWT Authentication

- Generated JWT access tokens after successful OTP verification.
- Included user ID, phone number and role as JWT claims.
- Configured one-hour token expiration.

### Refactoring

- Added helper methods for JWT generation.
- Added helper method for user authentication.
- Simplified verifyOtp() into an orchestration method.

## Testing Completed

- JWT successfully generated.
- Authentication response contains access token.
- Existing authentication flow remains unchanged after refactoring.

## Current Authentication Flow

Phone Number

↓

Request OTP

↓

Verify OTP

↓

Find or Create Guest

↓

Generate JWT

↓

Return Authenticated User + Access Token

### Route Protection

- Created JWT Strategy for validating access tokens.
- Implemented JwtAuthGuard for securing protected endpoints.
- Created reusable CurrentUser decorator.
- Successfully protected the first authenticated endpoint (`GET /auth/profile`).

### Testing Completed

- Protected endpoint rejects unauthenticated requests.
- Protected endpoint accepts valid JWTs.
- Authenticated user is successfully injected into controllers.

## Milestone 5 — Room & Booking Foundation

### Room Module
- Created the Room module.
- Implemented room creation endpoint.
- Implemented endpoint to retrieve all rooms.
- Successfully stored room data in PostgreSQL.

### Booking Module
- Implemented protected booking endpoint using JWT authentication.
- Added room existence validation.
- Added booking date validation.
- Added room availability status validation.
- Implemented overlapping booking detection.
- Created a reusable booking reference generator.
- Successfully created bookings in PostgreSQL.
- Prevented duplicate bookings for overlapping dates.

### Testing
- Successfully created room K101.
- Successfully created a booking.
- Successfully rejected duplicate bookings for the same room and dates.

## Milestone 7 — Payment Foundation

### Payment Module
- Created the Payment module.
- Implemented payment creation endpoint.
- Added booking existence validation.
- Added payment amount validation against room price.
- Created reusable payment reference generator.
- Successfully stored payments in PostgreSQL.
- Automatically updated booking status to PAID after payment creation.

### RFID Preparation
- Added accessToken to the Booking model.
- Created reusable access token generator.
- Prepared the system for RFID issuance during guest check-in.

### Refactoring
- Extracted booking validation helper.
- Extracted reusable room lookup method.
- Improved BookingService readability and maintainability.

### Testing
- Successfully created payment records.
- Successfully validated payment amount.
- Successfully updated booking status after payment.

## Milestone 8 — Paystack Integration

### Payment Gateway
- Integrated Paystack Test API.
- Implemented payment initialization.
- Implemented payment verification.
- Added secure payment reference generation.
- Added Paystack metadata for booking tracking.
- Created payment records only after successful verification.
- Updated booking status after successful payment.
- Added duplicate payment verification protection.

### Testing
- Successfully initialized real Paystack test transactions.
- Successfully completed real Paystack test payments.
- Successfully verified payments using the Paystack Verify API.

## Milestone 9 — Authentication Refactor

### Improvements

- Refactored authentication to a passwordless architecture.
- Added Complete Profile endpoint.
- Replaced Update Email with Update Profile.
- Added global validation.
- Added profile completion validation before booking.
- Removed password field from the User model.
- Added employeeId and isActive to User.
- Refactored bootstrap account to create the first Administrator.
- Improved authentication responses with isNewUser.

---

# Milestone 10 — Reception Module: Walk-in Booking & Cash Payments

**Status:** ✅ Completed

## Objective

Implement the receptionist workflow for walk-in guests while reusing existing booking and payment services to avoid code duplication.

## Features Implemented

### Reception Module

- Added receptionist walk-in booking endpoint.
- Added automatic guest lookup using phone number.
- Added automatic guest creation for new walk-in guests.
- Added room lookup using room number.
- Added shared booking validation for:
  - Booking dates
  - Room availability
  - Room status
- Added frontend-compatible walk-in booking request with payment amount.

### Booking Module

- Refactored booking creation into reusable methods.
- Reused booking reference generation.
- Eliminated duplicated booking creation logic.

### Payment Module

- Added manual cash payment support.
- Added shared payment amount validation.
- Added reusable cash payment recording method.
- Automatic booking status update after successful payment.

## Architectural Improvements

- Shared booking validation between online and reception bookings.
- Shared booking creation logic.
- Shared payment validation logic.
- Shared payment recording logic.
- Backend responses updated for frontend compatibility by returning the latest booking state.

## Business Rules Implemented

- Walk-in payment amount must exactly match the room price.
- Cash payments are recorded using:
  - Provider: MANUAL
  - Method: CASH
  - Status: SUCCESS
- Booking status automatically changes from PENDING to PAID after successful cash payment.
- Double bookings are prevented using shared availability validation.

## Testing

### Successfully Tested

- Walk-in booking creation
- Existing guest lookup
- New guest creation
- Room lookup
- Invalid room detection
- Invalid booking dates
- Double booking prevention
- Incorrect payment amount validation
- Cash payment recording
- Automatic booking status update
- Updated booking returned after payment

## Notes

This milestone establishes the complete receptionist booking workflow and prepares the backend for the next phase:

- Guest Check-in
- RFID Card Assignment
- Guest Check-out

# Milestone 11 – SMS Integration & Guest Check-in

## Completed

### SMS Module
- Created reusable SMS module
- Integrated Arkasel SMS API (Sandbox)
- Implemented generic `sendSms()` service
- Added business-specific SMS methods
  - `sendAccessPin()`
- Configured environment-based sandbox support

### Reception Check-in
- Automatic access PIN generation
- Access PIN stored in booking
- Automatic SMS sending after successful check-in
- Check-in date validation
- Booking status validation
- Room status updates during check-in

### Architecture Improvements
- Moved profile completion validation from Booking to Payment initialization
- Refactored SMS methods to accept option objects
- Centralized SMS logic inside `SmsService`

## Tested
- Sandbox SMS API integration
- Walk-in booking
- Cash payment recording
- Guest check-in
- Automatic access PIN generation
- Automatic SMS request after check-in

## Additional Improvements

### SMS Integration
- Verified end-to-end Arkasel SMS integration during guest check-in
- Confirmed automatic access PIN SMS request after successful check-in
- Removed dependency on temporary SMS testing workflow

### Check-in Architecture
- Wrapped booking status update, room status update, and access PIN persistence inside a Prisma transaction
- Separated critical database operations from SMS notifications
- Implemented graceful SMS failure handling using NestJS Logger
- Ensured guest check-in succeeds even if SMS delivery fails

### Reception Enhancements

#### Access PIN Management
- Implemented automatic access PIN generation during guest check-in
- Stored access PIN securely with the booking
- Integrated automatic SMS delivery using Arkasel

#### SMS Reliability
- Wrapped critical check-in database operations in a Prisma transaction
- Separated business operations from SMS notifications
- Implemented graceful SMS failure handling using NestJS Logger
- Improved receptionist feedback when SMS delivery fails

#### Access PIN Recovery
- Added "Resend Access PIN" endpoint
- Reused existing access PIN instead of generating a new one
- Restricted PIN resending to checked-in guests only
- Reused centralized SMS service for PIN delivery

#### Testing
- Verified automatic SMS after check-in
- Verified access PIN resend
- Verified booking and room state remain unchanged during PIN resend

# Milestone 12 – Access Device Infrastructure

## Completed

### Database Architecture
- Redesigned RFID architecture so RFID cards permanently belong to rooms
- Introduced `AccessDevice` model for ESP32 door controllers
- Linked each access device to a single room
- Linked each room to a single access device
- Removed RFID dependency from bookings
- Updated database relationships to support permanent room access hardware

### Access Device Module
- Created Access Device module
- Implemented API key generation utility
- Added reusable Access Device service
- Implemented room lookup helper
- Implemented access device validation helper
- Implemented access device registration
- Added endpoint to retrieve registered access devices

### Security
- Generated unique API keys for each registered ESP32
- Protected Access Device endpoints using JWT authentication
- Restricted Access Device management to ADMIN users only
- Prevented duplicate ESP32 registration
- Prevented multiple access devices from being assigned to the same room
- Removed API keys from access device listing responses

## Tested

- Access device registration
- Duplicate room validation
- Duplicate device validation
- ADMIN authorization
- Receptionist authorization restriction
- Retrieval of registered access devices

## Architectural Improvements

### Physical Access Architecture
- Established rooms as the permanent owners of RFID cards
- Established rooms as the permanent owners of ESP32 access devices
- Separated physical room infrastructure from temporary guest bookings
- Prepared backend architecture for ESP32 authentication using Device ID and API Key

### Future ESP32 Integration
- Finalized device authentication flow using:
  - Device ID
  - API Key
- Prepared backend for RFID validation through room ownership
- Prepared backend for upcoming RFID registration and access control implementation

# Milestone 13 – RFID Management

## Completed

### RFID Module
- Created dedicated RFID module
- Implemented RFID registration service
- Implemented RFID replacement service
- Added endpoint to retrieve all registered RFID cards
- Added reusable RFID helper methods
- Added centralized RFID registration workflow

### RFID Business Logic
- Registered RFID cards permanently to rooms
- Allowed only one active RFID card per room
- Preserved RFID replacement history
- Prevented duplicate RFID UID registration
- Prevented multiple active RFID cards for the same room
- Restricted RFID registration to rooms without an active RFID card
- Implemented RFID replacement by automatically deactivating the previous active RFID card

### Authorization
- Protected RFID endpoints using JWT authentication
- Allowed ADMIN and RECEPTIONIST roles to manage RFID cards
- Prevented GUEST access to RFID management endpoints

### Architecture Improvements
- Refactored duplicated RFID registration logic into a reusable private workflow
- Centralized room lookup and RFID validation
- Centralized RFID creation logic
- Added response mapping for RFID responses
- Improved separation between business logic and API responses

## Tested

- RFID registration
- Duplicate RFID prevention
- Duplicate room registration prevention
- RFID replacement
- RFID history preservation
- Active RFID switching
- Retrieval of registered RFID cards
- ADMIN authorization
- RECEPTIONIST authorization
- GUEST authorization restriction

## Architectural Decisions

### RFID Ownership
- RFID cards permanently belong to rooms
- Rooms maintain RFID replacement history
- Only one RFID card can be active for a room at any given time

### RFID Lifecycle
- Register RFID is used only for first-time room setup
- Replace RFID automatically deactivates the previous active card
- Lost RFID cards remain in the database for audit history while becoming inactive

# Milestone 14 – ESP32 Access Verification Pipeline

## Completed

### Access Module
- Created dedicated Access module
- Added `/access/verify` endpoint for ESP32 communication
- Implemented request DTO for RFID verification
- Integrated Access module with the application

### ESP32 Authentication
- Implemented API key authentication using the `X-Device-Key` request header
- Authenticated ESP32 devices against the `AccessDevice` table
- Restricted access to registered devices only
- Returned `401 Unauthorized` for invalid device credentials

### RFID Verification
- Verified that scanned RFID cards belong to the requesting room
- Restricted verification to active RFID cards only
- Rejected invalid or inactive RFID cards

### Booking Verification
- Verified that the room has an active checked-in booking
- Prevented access when no checked-in guest exists
- Validated booking check-in and check-out dates before granting access

### Access Decision
- Implemented centralized backend access verification pipeline
- Returned standardized access responses
  - `granted`
  - `code`
  - `message`
- Established the backend as the single source of truth for door access decisions

### Architecture Improvements
- Adopted API key authentication using the `X-Device-Key` header
- Eliminated the need to send device identifiers in every request
- Mapped authenticated ESP32 devices to their assigned rooms
- Simplified the ESP32 API contract to a single access verification endpoint

## Tested

- Valid device authentication
- Invalid device authentication
- Valid RFID verification
- Invalid RFID rejection
- Checked-in booking verification
- Booking date validation
- Successful access decision response

## Architectural Decisions

### ESP32 Authentication
- Each ESP32 permanently owns a unique API key
- Each Access Device is permanently assigned to a single room
- ESP32 devices authenticate using the `X-Device-Key` HTTP header

### Access Verification Flow
- Authenticate ESP32
- Verify room RFID
- Verify checked-in booking
- Validate booking dates
- Return final access decision

### API Contract

#### Request

Header:
- `X-Device-Key`

Body:
- RFID UID

#### Response
- `granted`
- `code`
- `message`

The ESP32 communicates with the backend through a single `/access/verify` endpoint.

# Milestone 15 – RFID Access Control & ESP32 Verification Pipeline

## Completed

### RFID Management
- Implemented RFID registration workflow
- Implemented RFID replacement workflow
- Redesigned RFID architecture to permanently belong to rooms instead of bookings
- Enforced one active RFID card per room
- Added RFID listing endpoint
- Refactored RFID service into reusable helper methods
- Introduced response mapping to prevent exposing internal database fields

### Access Device Management
- Implemented Access Device registration
- Generated unique API keys for each ESP32
- Permanently assigned ESP32 devices to rooms
- Restricted Access Device registration to authorized staff
- Adopted API key authentication for IoT devices

### Smart Access Verification
- Created dedicated Access module
- Implemented unified `/access/verify` endpoint
- Authenticated ESP32 devices using the `X-Device-Key` request header
- Verified active RFID assignment for the requesting room
- Verified active checked-in booking
- Validated booking check-in and check-out dates
- Returned standardized backend access decisions
- Established the backend as the single source of truth for door access

### Access Logging
- Implemented centralized Access Log creation
- Logged successful RFID access
- Logged failed RFID validation
- Logged failed booking validation
- Logged booking validity failures
- Linked access logs with Access Devices
- Recorded RFID UID used during each access attempt
- Added access failure reason tracking
- Refactored logging to use an options-object pattern

### Architecture Improvements
- Moved access control decisions into a centralized orchestration flow
- Simplified ESP32 communication to a single verification endpoint
- Adopted API key authentication instead of sending device identifiers in every request
- Made Access Log booking relationship optional for failed access attempts without an active booking
- Simplified logging architecture using a reusable access log helper

## Tested

- Access Device registration
- API key generation
- Device authentication
- RFID registration
- RFID replacement
- Valid RFID verification
- Invalid RFID rejection
- Checked-in booking verification
- Booking date validation
- Successful access decision
- Failed access logging
- Successful access logging

## Architectural Decisions

### RFID Architecture
- RFID cards are permanently assigned to rooms
- Rooms may have multiple historical RFID records
- Only one RFID card may be active for a room at any time

### ESP32 Architecture
- Each ESP32 is permanently assigned to a room
- Each ESP32 authenticates using a unique API key
- API keys are transmitted through the `X-Device-Key` request header

### Access Verification Pipeline
- Authenticate ESP32
- Verify RFID assignment
- Verify active booking
- Validate booking dates
- Create access log
- Return final access decision

### Access Logging
- Every authenticated access attempt is recorded
- Invalid device authentication is not logged as an access event
- Access logs capture:
  - Booking (when applicable)
  - Access Device
  - RFID UID
  - Access Method
  - Access Status
  - Failure Reason
  - Timestamp

  ## Date: 2026-07-09

### Feature: Unified Access Verification & Booking Lifecycle Improvements

#### Access Control
- Replaced multiple ESP32 endpoints with a unified `POST /access/verify` endpoint.
- Added support for method-based access verification (`RFID` and `PIN`).
- Implemented API key authentication using the `X-Device-Key` header.
- Removed the need for operational requests to send the device ID.
- Added standardized success and failure responses for access verification.
- Implemented guest PIN verification.
- Added comprehensive access logging for both RFID and PIN access attempts.
- Recorded successful and failed access events with failure reasons.

#### Guest Check-out
- Implemented receptionist guest check-out workflow.
- Booking status now changes from `CHECKED_IN` to `CHECKED_OUT`.
- Room status automatically returns to `AVAILABLE` after checkout.
- Checked-out guests immediately lose access to the room.

#### Booking Workflow
- Simplified the booking model to allow only one active booking per room.
- Removed overlapping booking validation.
- Added validation to prevent bookings with check-in dates in the past.
- Removed the obsolete `CONFIRMED` booking status.
- Standardized booking lifecycle:
  - `PENDING`
  - `PAID`
  - `CHECKED_IN`
  - `CHECKED_OUT`
  - `CANCELLED`

#### Expired Booking Cleanup
- Implemented automatic cleanup of unpaid bookings older than 24 hours.
- Expired bookings are automatically marked as `CANCELLED`.
- Added cleanup before:
  - Online booking creation
  - Walk-in booking creation
  - Payment initialization
- Renamed the helper from `releaseExpiredBookings()` to `cleanupExpiredBookings()` for clarity.

#### Room Lifecycle Redesign
- Updated the room lifecycle architecture:
  - `AVAILABLE`
  - `RESERVED`
  - `OCCUPIED`
  - `MAINTENANCE`
- Successful payment now reserves the room.
- Check-in changes the room to `OCCUPIED`.
- Check-out changes the room back to `AVAILABLE`.
- Removed the unnecessary `CLEANING` state from the architecture.

#### Architecture Improvements
- Continued refactoring toward a production-ready access control workflow.
- Improved consistency between booking status, room status, and physical access control.


## 2026-07-10

### Milestone 15

### PIN Verification ✅

- Completed unified `/access/verify` endpoint.
- Implemented guest access PIN verification.
- Implemented successful PIN access logging.
- Implemented failed PIN access logging.
- Standardized PIN verification responses.
- Designed the endpoint to remain compatible with the final ESP32 firmware.

---

### Guest Check-out ✅

- Implemented receptionist guest check-out endpoint.
- Booking lifecycle now supports:
  - `CHECKED_IN → CHECKED_OUT`
- Room status automatically changes to `AVAILABLE` after successful check-out.
- Access is immediately denied after guest check-out.
- RFID cards remain assigned to their rooms after guest departure.

---

### Booking Lifecycle Improvements ✅

- Prevented bookings with check-in dates in the past.
- Simplified booking workflow by removing the `CONFIRMED` booking status.
- Booking lifecycle is now:

```
PENDING
   ↓
PAID
   ↓
CHECKED_IN
   ↓
CHECKED_OUT
```

or

```
PENDING
   ↓
CANCELLED
```

- Restricted rooms to one active booking at a time.
- Implemented automatic cleanup of unpaid bookings after 24 hours.
- Renamed helper to `cleanupExpiredBookings()`.
- Automatic cleanup now executes before:
  - Online booking creation.
  - Walk-in booking creation.
  - Payment initialization.

---

### Booking Pricing & Extension ✅

#### Booking Pricing

- Implemented pricing calculation based on the number of nights.
- Booking responses now include:
  - `nightlyRate`
  - `nights`
  - `totalAmount`
- Payment validation now validates the total booking cost instead of only the nightly room rate.

#### Booking Extension

- Implemented receptionist booking extension preview.
- Added booking extension confirmation workflow.
- Added validation that only `CHECKED_IN` bookings can be extended.
- Added validation that the new checkout date must be later than the current checkout date.
- Recalculated extension charges on the server for security.
- Recorded dedicated booking extension payments.
- Preserved guest RFID assignment during extension.
- Preserved guest access PIN during extension.
- Preserved room occupancy status during extension.
- Updated only the booking checkout date after successful payment.

---

### Payment Module Improvements ✅

- Refactored payment relationship from one payment per booking to multiple payments per booking.
- Added `PaymentPurpose` enum.
- Replaced free-text payment descriptions with strongly typed payment purposes.
- Supported payment purposes:
  - `INITIAL_BOOKING`
  - `BOOKING_EXTENSION`
- Implemented dedicated `recordExtensionPayment()` service.
- Preserved the existing payment architecture while supporting multiple payments for a single booking.

---

### Database Improvements

- Removed experimental `playing_with_neon` table from the Neon database.
- Applied Prisma migrations for:
  - Multiple payments per booking.
  - Payment purpose support.
- Regenerated Prisma Client.
- Verified successful operation after migration.

---

### Overall Progress

The backend now supports:

- Guest authentication.
- Room management.
- Online bookings.
- Walk-in bookings.
- Online payments.
- Cash payments.
- Guest check-in.
- Guest check-out.
- Booking extension.
- Multiple payments per booking.
- Automatic cleanup of stale bookings.
- RFID-ready access control architecture.
- PIN-based smart room access.

The booking and payment architecture is now considered stable and ready for the remaining administrative hardware management features and frontend integration.

Milestone 17 – Access Device Management

- Created the Admin module foundation with dashboard summary endpoint protected by JWT authentication and role-based authorization.
- Enhanced the Access Device module instead of duplicating functionality in the Admin module.
- Implemented Get Access Device endpoint to retrieve a single registered access device.
- Implemented Update Access Device endpoint with validation for duplicate device IDs and room assignments.
- Refactored the access device update logic to use a clean updateData object instead of mutating entity properties.
- Improved validation messages for clearer administrative feedback.
- Implemented Delete Access Device endpoint to support removal of faulty or replaced ESP32 devices.
- Implemented Access Device Test endpoint to verify device registration, room assignment and backend connectivity before firmware integration.
- Verified all Access Device endpoints using Postman.

## Milestone 18 - Security Audit & Sensitive Action Tracking

- Created SecurityAuditLog model for recording sensitive system actions.
- Added SecurityAction enum to categorize security events.
- Implemented reusable SecurityAuditService for centralized audit logging.
- Added RFID deactivation endpoint.
- Logged RFID deactivation actions for both Receptionists and Admins.
- Allowed audit logs without an active booking by making bookingId optional.
- Added Security Audit endpoint restricted to Admin users.
- Flattened Security Audit API response for easier frontend consumption.
- Integrated audit logging into the RFID replacement workflow.
- Added Reveal Access PIN endpoint for checked-in guests.
- Logged every PIN reveal action with employee, booking, room and timestamp.
- Updated Resend Access PIN validation to require a guest phone number instead of a completed guest profile.
- Added fallback guest name ("Guest") when resending access PIN SMS for guests without a recorded name.
- Restricted security-sensitive endpoints using existing JWT and role-based authorization.
- Established frontend confirmation workflow for PIN reveal while keeping backend responsible for validation and auditing.

---

# Milestone 19 – Admin Management & Booking Lifecycle Redesign

**Date:** 2026-07-14

## Admin Module

### Dashboard Foundation

- Created Admin module foundation.
- Implemented administrator dashboard statistics.
- Established dedicated Admin API structure for frontend integration.

### Room Management

- Moved all room management responsibilities from the Room module into the Admin module.
- Implemented room creation.
- Implemented room listing.
- Implemented room details retrieval.
- Implemented room updates.
- Implemented room status management.
- Removed the standalone Room module.

### Receptionist Management

- Implemented receptionist creation.
- Implemented receptionist listing.
- Implemented receptionist details endpoint.
- Implemented receptionist update endpoint.
- Implemented receptionist activation.
- Implemented receptionist deactivation.

### Booking Management

- Implemented booking statistics endpoint.
- Implemented booking listing endpoint.
- Implemented booking details endpoint.
- Implemented administrator booking cancellation.

---

## Booking Cancellation Architecture

### Shared Business Logic

Refactored booking cancellation into reusable helper methods.

Implemented shared methods:

- `findBooking()`
- `validateBookingCanBeCancelled()`
- `cancelBookingRecord()`
- `cancelBookingAsStaff()`

The shared workflow is now reused by:

- Guest booking cancellation
- Receptionist booking cancellation
- Administrator booking cancellation

This eliminated duplicated business logic while keeping authorization and audit logging specific to each role.

---

## Room Lifecycle Redesign

Redesigned the room lifecycle to distinguish unpaid online bookings from fully reserved rooms.

Previous lifecycle:

AVAILABLE
↓

RESERVED
↓

OCCUPIED

Current lifecycle:

AVAILABLE
↓

BOOKED
↓

RESERVED
↓

OCCUPIED
↓

AVAILABLE

Added new RoomStatus:

- BOOKED

Business rules:

- Online booking:
  - Booking → PENDING
  - Room → BOOKED

- Successful online payment:
  - Booking → PAID
  - Room → RESERVED

- Walk-in booking:
  - Booking → PAID
  - Room → RESERVED

- Guest check-in:
  - Booking → CHECKED_IN
  - Room → OCCUPIED

- Guest check-out:
  - Booking → CHECKED_OUT
  - Room → AVAILABLE

- Booking cancellation:
  - PENDING → CANCELLED
  - BOOKED → AVAILABLE

- Paid booking cancellation:
  - PAID → CANCELLED
  - RESERVED → AVAILABLE

---

## Architecture Improvements

- Simplified booking lifecycle.
- Simplified room lifecycle.
- Removed ambiguity between booked and reserved rooms.
- Centralized booking cancellation workflow.
- Reduced duplicated service logic.
- Improved transaction consistency between bookings and rooms.
- Improved frontend readiness through dedicated Admin endpoints.

---

## Testing Completed

Successfully verified:

- Online booking workflow.
- Walk-in booking workflow.
- Online payment verification.
- Guest cancellation.
- Receptionist cancellation.
- Administrator cancellation.
- Automatic room state transitions.
- Shared cancellation workflow.
- Security audit logging.
- Admin room management.
- Receptionist management.
- Booking management endpoints.

---

## Overall Progress

The backend now supports:

- Guest authentication
- Room management
- Online bookings
- Walk-in bookings
- Online payments
- Cash payments
- Guest check-in
- Guest check-out
- Booking cancellation
- Booking extension
- Receptionist management
- Administrative room management
- Administrative booking management
- Security audit logging
- PIN-based smart access
- ESP32-ready backend architecture

The booking, room, payment, receptionist and administrative architecture is now considered stable and ready for frontend development and ESP32 firmware integration.

---

# Milestone 20 – Admin Payment & Access Device Management

**Date:** 2026-07-14

## Admin Payment Management

Completed the payment management APIs for the administrator dashboard.

### Revenue Summary

Implemented dashboard revenue summary cards.

Metrics include:

- Total Revenue
- Today's Revenue
- This Month's Revenue
- Online Payments
- Cash Payments
- Total Successful Transactions

Only successful payments are included in all revenue calculations.

---

### Payment Listing

Implemented payment listing endpoint.

The response includes:

- Payment Reference
- Booking ID
- Guest Name
- Guest Phone
- Room Number
- Payment Purpose
- Payment Method
- Payment Provider
- Amount
- Payment Status
- Payment Date

Responses were flattened to produce frontend-friendly APIs.

---

### Payment Details

Implemented payment details endpoint.

The endpoint returns:

- Payment information
- Guest information
- Booking information
- Room information

without exposing unnecessary internal database structures.

---

## Admin Access Device Management

Integrated Access Device management into the Admin module without duplicating business logic.

The Admin module now delegates all device operations to the AccessDeviceService.

Implemented:

- List Access Devices
- Access Device Details
- Register Access Device
- Update Access Device

---

## Access Device Lifecycle Redesign

Redesigned the lifecycle of installed ESP32 access devices.

Added:

- `isActive` field to AccessDevice

Previous design:

- Delete Access Device

Current design:

- Disable Access Device
- Enable Access Device

This preserves installed device history while allowing devices to be temporarily disabled.

---

## Access Authentication Improvements

Updated device authentication to reject disabled access devices.

Every ESP32 request now passes through a centralized authentication check before PIN verification.

Authentication flow:

Authenticate Device

↓

Verify Device Status

↓

Verify PIN

↓

Grant / Deny Access

Disabled devices are now prevented from authenticating with the backend.

---

## Frontend Improvements

The Access Device APIs now expose:

- isActive

allowing the frontend to display:

- Active
- Disabled

and implement a simple enable/disable toggle.

---

## Architecture Improvements

Maintained separation of responsibilities.

Admin Module:

- Role-based API endpoints
- Frontend orchestration

Access Device Module:

- Business logic
- Device management
- Device authentication

Access Module:

- ESP32 firmware authentication
- PIN verification
- Access logging

This keeps each module responsible for its own domain while avoiding duplicated business logic.

---

## Testing Completed

Successfully tested:

- Revenue summary
- Payment listing
- Payment details
- Device listing
- Device details
- Device registration
- Device updates
- Device disabling
- Device enabling
- Firmware authentication for active devices
- Firmware rejection for disabled devices

---

## Overall Progress

The Admin backend now provides complete support for:

- Dashboard
- Room Management
- Receptionist Management
- Guest Management
- Booking Management
- Payment Management
- Access Device Management

The remaining administrator functionality consists primarily of reporting and log visualization.

---

# Milestone 21 – Complete Admin Backend

**Date:** 2026-07-15

## Reports & Logs

Completed the administrator reporting module.

Implemented:

- Occupancy Report
- Revenue Report
- Access Log Report
- Security Audit Report

The reporting module was designed to match the Admin frontend layout while maximizing reuse of existing business logic.

---

## Payment Improvements

Implemented Revenue Summary dashboard cards.

Added:

- Total Revenue
- Today's Revenue
- This Month's Revenue
- Online Payments
- Cash Payments
- Total Transactions

Implemented:

- Payment Listing
- Payment Details

The Revenue Report reuses the Payment Listing service to avoid duplicated queries.

---

## Access Device Improvements

Completed administrator management for ESP32 access devices.

Implemented:

- List Access Devices
- Device Details
- Register Device
- Update Device
- Disable Device
- Enable Device

---

## Access Device Lifecycle

Redesigned installed access devices.

Previous design:

Delete Device

Current lifecycle:

ACTIVE

↓

DISABLED

↓

ACTIVE

Historical records are preserved while preventing disabled devices from authenticating.

---

## Security Improvements

Added centralized device status verification.

ESP32 firmware authentication now verifies:

- Device credentials
- Device active status

before PIN verification begins.

---

## Reports & Logs

Implemented dedicated reporting endpoints for:

- Occupancy
- Revenue
- Access Logs
- Security Audit Logs

Operational reports and audit logs are now separated into distinct APIs.

---

## Architecture Improvements

Continued enforcing modular architecture.

Business logic remains inside:

- Booking Module
- Payment Module
- Access Device Module
- Security Audit Module

The Admin module acts as an orchestration layer for frontend APIs without duplicating business logic.

---

## Testing Completed

Successfully verified:

- Occupancy Report
- Revenue Report
- Access Log Report
- Security Audit Report
- Revenue Summary
- Payment Listing
- Payment Details
- Access Device Lifecycle
- Device Authentication
- Device Enable/Disable

---

## Overall Progress

The Administrator backend is now feature complete.

All administrator pages required by the frontend have corresponding backend endpoints.

The next development milestone is Receptionist backend alignment, where the existing Reception module will be reviewed page-by-page against the frontend design to identify missing APIs and extend the module where necessary.

# Milestone 22— Reception Backend (Part 1)

### Completed

#### Dashboard
- Implemented receptionist dashboard statistics.
- Added hotel information and receptionist profile summary.
- Designed dashboard responses specifically for the frontend dashboard cards.

#### Bookings
- Refactored booking queries into the shared BookingService.
- Added endpoints to list bookings, search bookings and retrieve booking details.
- Created separate booking detail responses for the Admin and Reception portals.
- Designed receptionist booking responses to expose only UI-required fields.

#### Walk-In Booking
- Redesigned the response to return only booking reference, booking status and payment summary after successful creation.

#### Check-In
- Added search by phone number workflow.
- Restricted search results to paid bookings.
- Simplified check-in response to a success message suitable for toast notifications.

#### Check-Out
- Added search by phone number workflow.
- Restricted search results to checked-in bookings.
- Automatically clears the stored access PIN during checkout.
- Simplified checkout response to a success message.

#### Booking Extension
- Added search by phone number endpoint.
- Redesigned preview response to return only nightly rate, additional nights and additional amount.
- Simplified confirmation response to a success message.

### Architectural Improvements
- Shared booking logic centralized in BookingService.
- Reception endpoints delegate business logic instead of duplicating queries.
- Adopted UI-driven API design, where every endpoint returns only the data displayed by the corresponding frontend page.
- Standardized the use of booking references (`booking.bookingId`) for receptionist-facing operations.
- Verified all implemented endpoints through Postman testing.

## Milestone 22 – Reception Backend (Part 2)

### Authentication Improvements

#### OTP Request Redesign

- Redesigned the OTP request workflow to support separate `SIGN_UP` and `SIGN_IN` authentication modes.
- Introduced the `AuthMode` enum to make authentication flows explicit.
- Replaced primitive controller parameters with the `RequestOtpDto`.
- Added backend validation for authentication mode.
- Prevented duplicate phone number registration during sign-up.
- Prevented duplicate email registration during sign-up.
- Prevented OTP requests for phone numbers that are not registered during sign-in.
- Updated the User model to enforce unique email addresses.

#### OTP Verification Redesign

- Refactored the OTP verification endpoint to use the `VerifyOtpDto`.
- Preserved the existing `/verify-otp` endpoint to avoid breaking frontend integration.
- Added mode-aware verification for both sign-up and sign-in.
- Implemented dedicated authentication workflows:
  - `completeSignUp()`
  - `completeSignIn()`
- Removed the previous "find or create guest" authentication approach.
- New guest accounts are now created only after successful OTP verification.
- Existing users are authenticated without creating duplicate records.

#### Validation Improvements

- Added DTO validation for:
  - Ghanaian phone numbers
  - Six-digit OTP codes
  - Authentication mode
- Kept email optional to support both authentication flows while applying business-rule validation inside the service.

#### Refactoring

- Refactored AuthService to separate request validation from authentication logic.
- Improved readability by delegating responsibilities to dedicated helper methods.
- Simplified the authentication flow while preserving existing JWT generation.
- Maintained compatibility with the existing frontend API contract.

### Security Improvements

- Eliminated accidental user creation during sign-in.
- Enforced uniqueness of both phone numbers and email addresses.
- Preserved OTP expiration validation.
- Preserved OTP replay attack protection.
- Continued hashing OTP codes before verification.

### Testing Completed

Successfully verified:

- SIGN_UP OTP request
- SIGN_IN OTP request
- Duplicate phone rejection
- Duplicate email rejection
- Unknown user rejection during sign-in
- Successful SIGN_UP verification
- Successful SIGN_IN verification
- Invalid OTP rejection
- Expired OTP rejection
- OTP replay prevention
- JWT generation after successful authentication
- Existing `/verify-otp` endpoint compatibility

### Architecture Improvements

- Authentication now follows two clearly separated business workflows:
  - Guest Registration (SIGN_UP)
  - Guest Login (SIGN_IN)
- User creation occurs only after successful OTP verification.
- DTO-based request handling is now used consistently throughout the authentication module.
- The authentication layer is now easier to extend for future features such as password reset, email verification and multi-factor authentication.

# Milestone 23 – Room Management Notifications 



### Objective

Implemented real-time admin notifications for room management events to improve operational awareness and maintain consistency across the notification system.



### Changes Made



#### 1. Room Creation Notification

- Injected `NotificationService` into `RoomService`.

- Imported `NotificationModule` into `RoomModule` to resolve dependency injection.

- Added notification immediately after successful room creation.



**Notification**

- **Title:** `Room Created`

- **Message:** `Room <room number> has been created and is now available.`



---



#### 2. Room Update Notification

- Added notification after a room is successfully updated.



**Notification**

- **Title:** `Room Updated`

- **Message:** `Room <room number> has been updated.`



---



#### 3. Room Under Maintenance Notification

- Added notification after successfully changing a room's status to `MAINTENANCE`.



**Notification**

- **Title:** `Room Under Maintenance`

- **Message:** `Room <room number> has been marked under maintenance.`



---



#### 4. Maintenance Completion Notification

- Added notification after successfully changing a room's status back to `AVAILABLE`.



**Notification**

- **Title:** `Maintenance Completed`

- **Message:** `Room <room number> is now available for booking.`



---



### Architecture

Notifications continue to follow the project's event-driven approach:



- Business logic creates the notification immediately after the successful business event.

- `NotificationService.createNotification()` creates the notification record.

- `NotificationService.notifyAdmins()` distributes the notification to all administrators.

- Existing room management logic and API contracts remain unchanged.



---



### Modules Updated

- `RoomModule`

  - Imported `NotificationModule`.



- `RoomService`

  - Injected `NotificationService`.

  - Added notifications for:

    - Room creation

    - Room update



- `AdminService`

  - Added notifications for:

    - Room marked under maintenance

    - Maintenance completed



---



### Testing Performed


✅ Room creation successfully creates an admin notification.


✅ Room update successfully creates an admin notification.


✅ Marking a room under maintenance successfully creates an admin notification.


✅ Completing room maintenance successfully creates an admin notification.


✅ Verified that all notifications appear correctly in the notification list.



---


```

### Status

✅ Feature completed
✅ All endpoints tested successfully
✅ Changes committed

### ✅ Completed: Admin Notification System Expansion

Expanded the admin notification system to provide real-time notifications for key administrative operations across multiple modules.

#### Booking Management
- Walk-in booking created
- Online payment verified
- Booking extended
- Guest check-in
- Guest check-out
- Booking cancelled by an administrator (includes cancellation reason when provided)

#### Room Management
- Room created
- Room updated
- Room marked under maintenance
- Room maintenance completed

#### Receptionist Management
- Receptionist created
- Receptionist updated
- Receptionist enabled
- Receptionist disabled

#### Access Device Management
- Access device registered
- Access device updated
- Access device enabled
- Access device disabled
- Access device deleted

#### Technical Improvements
- Integrated the notification service into the Access Device module.
- Notifications are generated within the service where each business event occurs, ensuring a clean and maintainable architecture.
- All notifications are automatically delivered to administrators through the centralized notification system.
- Notification messages include meaningful contextual information, such as booking cancellation reasons when available.

**Status:** ✅ Completed and fully tested.

### ✅ Added Logout Security Audit

Implemented audit logging for authenticated user logout events.

#### Changes
- Added `LOGOUT` to the `SecurityAction` enum.
- Created and applied a Prisma migration for the new audit action.
- Recorded logout events through the `SecurityAuditService`.
- Linked logout audit records to the authenticated employee.
- Kept logout free of admin notifications, since it is a routine user action and is more appropriately tracked through the security audit log.

#### Result
Every successful logout performed by an authenticated administrator or receptionist is now recorded in the security audit trail with:
- Employee ID
- Action (`LOGOUT`)
- Details containing the user's role and phone number

**Status:** ✅ Implemented and tested successfully.

# Milestone 24 — Reception Dashboard Enhancements & Booking Timeline Tracking

**Date:** 20 July 2026

## Objective

Improve the receptionist dashboard by making daily statistics more accurate and replacing the notification panel with a task-oriented workflow for pending guest check-ins.

---

## Completed

### 1. Booking Timeline Tracking

Added two new nullable fields to the `Booking` model to record the actual guest arrival and departure times.

```prisma
checkedInAt  DateTime?
checkedOutAt DateTime?
```

**Reason**

Previously, dashboard statistics relied on the `updatedAt` timestamp, which changed whenever any booking field was modified. This could produce inaccurate counts for daily check-ins and check-outs.

The new fields permanently record:

- Actual check-in time
- Actual check-out time

while preserving the scheduled booking dates (`checkIn` and `checkOut`).

---

### 2. Database Migration

Created and successfully applied a new Prisma migration.

```
add_booking_checkin_checkout_timestamps
```

The Prisma Client was regenerated after the migration.

---

### 3. Reception Check-In Process

Updated the receptionist check-in workflow.

When a guest is checked in, the system now automatically stores:

- Booking Status → `CHECKED_IN`
- `checkedInAt = new Date()`

---

### 4. Reception Check-Out Process

Updated the receptionist check-out workflow.

When a guest is checked out, the system now automatically stores:

- Booking Status → `CHECKED_OUT`
- `checkedOutAt = new Date()`
- Access PIN cleared

---

### 5. Dashboard Statistics Accuracy

Updated the receptionist dashboard statistics.

Previously:

- Today's Check-ins used `updatedAt`
- Today's Check-outs used `updatedAt`

Now:

- Today's Check-ins use `checkedInAt`
- Today's Check-outs use `checkedOutAt`

This ensures daily statistics reflect the actual operational events rather than general database updates.

---

### 6. Reception Dashboard Redesign

Replaced the **Recent Notifications** dashboard section with a new operational endpoint for pending guest check-ins.

New endpoint:

```
GET /reception/dashboard/pending-checkins
```

Returns only bookings that satisfy:

- Booking Status = `PAID`
- Check-in Date = Today

Response includes:

- Internal Booking ID
- Booking Reference
- Guest Name
- Room Number
- Booking Status

This endpoint is designed to power a receptionist quick-action table.

---

## Frontend Workflow

The receptionist dashboard now supports a streamlined check-in process.

Dashboard Table

| Booking ID | Guest Name | Room Number | Status | Action |
|------------|------------|------------|--------|--------|
| BK-10245 | John Mensah | 101 | PAID | Check In |

Workflow:

1. Receptionist opens dashboard.
2. Pending check-ins for the current day are displayed.
3. Receptionist clicks **Check In**.
4. Confirmation dialog appears.
5. Existing Check-In API is called using the booking reference.
6. Guest status changes to `CHECKED_IN`.
7. The booking automatically disappears from the pending list after refresh.

---

## Benefits

- Accurate operational reporting.
- Cleaner dashboard focused on receptionist tasks.
- Faster guest processing.
- Reuse of existing Check-In API without introducing duplicate business logic.
- Better separation between scheduled booking dates and actual guest activity.

---

## Current Project Status

The backend now supports:

- Guest bookings
- Walk-in bookings
- Booking cancellation
- Guest check-in
- Guest check-out
- Booking extension
- Reception dashboard statistics
- Pending check-in dashboard
- Accurate booking activity timestamps

The backend is now ready for integration with the ESP32 smart door access system.

# Milestone 25 — Contact Form Email Service

**Date:** 21 July 2026

## Objective

Implement a backend contact service that allows visitors to submit enquiries from the guest house landing page and automatically deliver them to the guest house email address.

---

## Completed

### 1. Contact Module

Created a dedicated Contact module following the existing modular backend architecture.

New components:

- Contact Module
- Contact Controller
- Contact Service
- Contact DTO

This separates contact form functionality from the booking and authentication modules.

---

### 2. Request Validation

Implemented request validation using a Data Transfer Object (DTO).

Validated fields:

- Full Name
- Email Address
- Subject
- Message

Input validation ensures only properly formatted requests are processed.

---

### 3. Gmail SMTP Integration

Integrated Gmail SMTP using Nodemailer.

Configured environment variables:

- SMTP Host
- SMTP Port
- SMTP Username
- SMTP App Password

Email credentials are stored securely in the backend environment configuration.

---

### 4. Contact API

Implemented a public endpoint:

```
POST /contact
```

Request body:

```json
{
  "fullName": "John Mensah",
  "email": "john@gmail.com",
  "subject": "Booking Inquiry",
  "message": "Hello..."
}
```

Successful response:

```json
{
  "message": "Your message has been sent successfully."
}
```

---

### 5. Email Delivery

The Contact Service now sends submitted enquiries directly to:

```
ce.groupwork.5@gmail.com
```

Each email contains:

- Sender's Full Name
- Sender's Email Address
- Subject
- Message

The sender's email is also configured as the **Reply-To** address, allowing the guest house administrator to reply directly from Gmail.

---

### 6. Improved Email Subject

Enhanced the generated email subject format for easier inbox management.

Previous:

```
New Contact Form Submission: Booking Inquiry
```

Updated:

```
New Contact Form: John Mensah - Booking Inquiry
```

This allows enquiries to be identified immediately without opening each email.

---

### 7. Endpoint Verification

Verified the Contact API using Postman.

Confirmed:

- Request validation
- Successful email delivery
- Gmail SMTP configuration
- Proper API response

---

## Benefits

- Enables direct communication from website visitors.
- Secure server-side email delivery.
- Modular implementation aligned with the project's backend architecture.
- Validated user input before processing.
- Professional email formatting with direct reply capability.
- Ready for frontend integration.

---

## Current Project Status

The backend now supports:

- Guest authentication (OTP)
- Booking management
- Walk-in bookings
- Booking cancellation
- Guest check-in
- Guest check-out
- Booking extension
- Reception dashboard statistics
- Pending check-in dashboard
- Contact form email service
- Gmail SMTP integration

The backend APIs are now ready for frontend integration and subsequent ESP32 smart door access system integration.

---

# Milestone 26 – Guest Booking Lifecycle & Notification System

**Date:** 2026-07-22

## Booking Lifecycle Improvements

Completed the end-to-end guest booking lifecycle.

Implemented:

- Payment Required notification after successful booking creation.
- Payment Successful notification after successful Paystack verification.
- Guest Check-In workflow with automatic access PIN generation.
- Guest Check-Out workflow with automatic access PIN removal.
- Booking Extension confirmation notifications.
- Automatic cancellation of expired unpaid bookings.
- Automatic room release after expired booking cancellation.

---

## Notification System

Completed role-based dashboard notifications.

### Guest Notifications

Implemented:

- Payment Required
- Payment Successful
- Room Access PIN
- Booking Extension Confirmed
- Booking Cancelled
- Check-Out Complete

Added guest notification endpoints:

- Get Notifications
- Get Recent Notifications
- Hide Notification

Implemented automatic hiding of the Room Access PIN notification after guest checkout.

---

### Staff Notifications

Implemented receptionist and administrator notifications for:

- Payment Successful
- Guest Check-In
- Guest Check-Out
- Booking Extension
- Guest Booking Cancellation
- Automatic Expired Booking Cancellation
- Walk-In Booking Creation

Guest-facing and staff-facing cancellation notifications now use separate messages tailored to each audience.

---

## Housekeeping Improvements

Refactored expired booking cleanup into a dedicated `BookingHousekeepingService`.

Responsibilities include:

- Detect expired unpaid bookings.
- Cancel expired bookings automatically.
- Release booked rooms.
- Notify Guests.
- Notify Receptionists.
- Notify Administrators.

This removes housekeeping responsibilities from validation helpers while improving service organization and reuse.

---

## Architecture Improvements

Continued strengthening the modular architecture.

- Introduced `BookingHousekeepingService` for reusable booking maintenance operations.
- Standardized notification creation using `booking.id`.
- Preserved separation of business logic across Booking, Payment, Reception and Notification modules.
- Maintained backend ownership of all booking lifecycle rules.

---

## Testing Completed

Successfully verified:

- Guest Booking Creation
- Payment Required Notification
- Payment Initialization
- Paystack Webhook Processing
- Payment Verification
- Payment Successful Notification
- Guest Check-In
- Access PIN Generation
- SMS Delivery
- Room Access PIN Notification
- Guest Check-Out
- Automatic Access PIN Removal
- Check-Out Notification
- Booking Extension
- Automatic Expired Booking Cleanup
- Automatic Expired Booking Notifications
- Guest Notification Retrieval
- Recent Guest Notifications
- Guest Notification Hiding

---

## Overall Progress

The backend now provides a complete and fully tested guest booking lifecycle, from booking creation through payment, check-in, stay management, checkout and automatic cleanup.

Role-specific notifications have been fully integrated across Guest, Receptionist and Administrator workflows, providing a consistent communication experience throughout the system.

The next development milestone will focus on the Guest Profile experience, allowing guests to manage their personal information directly from the dashboard while improving personalization across the frontend.

# Milestone 27 – Account Module & Profile Refactor

## Date

July 2026

---

# Objective

Refactor profile management out of the Auth module into a dedicated Account module while preserving existing functionality and improving the backend architecture.

---

# Completed Tasks

## 1. Created Account Module

Created the new Account domain to own authenticated user account management.

```
src/account/
├── account.module.ts
├── interfaces/
├── profile/
├── password/
├── security/
└── preferences/
```

---

## 2. Created Profile Feature

Generated:

- ProfileController
- ProfileService

Moved profile DTOs into:

```
src/account/profile/dto/
```

---

## 3. Added Authenticated User Interface

Created:

```
src/account/interfaces/authenticated-user.interface.ts
```

All Account services now receive an authenticated user object instead of individual IDs.

---

## 4. Implemented ProfileService

Implemented:

- getProfile()
- updateProfile()
- completeProfile()

Business rules include:

- Always retrieve the latest profile from the database.
- Reject empty PATCH requests.
- Prevent duplicate email addresses.
- Prevent profile completion more than once.
- Return only safe profile fields.

---

## 5. Added Private Helper Methods

Extracted reusable helper methods:

- findCurrentUser()
- validateEmailUniqueness()
- buildProfileResponse()

This eliminated duplicated business logic and standardized profile responses.

---

## 6. Migrated Profile Endpoints

Moved profile endpoints from AuthController into ProfileController.

New endpoints:

GET /profile

PATCH /profile

POST /profile/complete

---

## 7. Removed Legacy Profile Logic

Removed:

- Profile endpoints from AuthController
- Profile methods from AuthService

Auth module now focuses solely on authentication.

---

# Architecture Improvements

Before:

Auth Module

- Authentication
- Profile Management

After:

Auth Module

- OTP Authentication
- JWT
- Logout
- Bootstrap Admin

Account Module

- Profile Management

This establishes a clear separation of concerns and aligns the project with a modular architecture.

---

# Backend Standards Established

- Thin controllers.
- Business logic resides in services.
- Prisma accessed only through services.
- Use explicit DTO-to-entity mapping.
- Use `import type` for interfaces.
- Extract duplicated business logic into private helper methods.
- Return sanitized response objects instead of raw Prisma models.

---

# Outcome

Milestone 27 successfully completed.

The Account module is now responsible for authenticated profile management while the Auth module focuses exclusively on authentication and authorization.

This refactor improves maintainability, scalability, and prepares the codebase for future Account features such as Password, Security, and Preferences.

# Milestone 28: Date-Based Room Availability Refactor ✅

## Summary

Successfully refactored the booking engine from a room-status-based reservation model to a date-based availability model.

This aligns the system with how modern hotel reservation systems operate, allowing multiple future bookings for the same room while preventing overlapping reservations.

---

## Major Changes

### Booking Engine

- Replaced room-status availability with date-overlap detection.
- Added centralized `validateRoomAvailability()` helper.
- Added booking overlap validation for:
  - Guest bookings
  - Walk-in bookings
  - Booking extensions

---

### Room Status Refactor

Room status is now used **only for operational purposes**.

Supported operational states:

- AVAILABLE
- OCCUPIED
- MAINTENANCE

Room status is **no longer** modified during:

- Booking creation
- Payment confirmation
- Booking cancellation

Room status is now changed only during:

- Guest check-in
- Guest check-out
- Maintenance operations

---

### Booking Lifecycle

Booking lifecycle remains:

PENDING
→ PAID
→ CHECKED_IN
→ CHECKED_OUT
→ CANCELLED

---

### Payment Improvements

- Removed room reservation updates from payment processing.
- Verified payment idempotency.
- Confirmed duplicate verification does not create duplicate payment records.

---

### Booking Extension

Added overlap validation during booking extension while excluding the current booking from conflict detection.

---

### Validation Improvements

Added:

- Booking date normalization
- Booking date validation
- Date overlap detection
- Maintenance room validation

---

## Regression Testing

Completed full backend regression testing.

### Results

- ✅ Guest booking creation
- ✅ Prevent overlapping bookings
- ✅ Guest payment
- ✅ Duplicate payment verification
- ✅ Receptionist check-in
- ✅ Valid booking extension
- ✅ Reject overlapping booking extension
- ✅ Receptionist check-out
- ✅ Booking cancellation
- ✅ Room maintenance validation

**Result:** **10 / 10 Tests Passed**

---

## Architecture Achieved

Availability is now determined by:

Room
+
Booking Dates
+
Booking Status

instead of

Room.status

This architecture supports:

- Future reservations
- Consecutive bookings
- Booking extensions
- Operational room management

while preventing double-booking.

---

## Next Milestone

### Phase 6

- Update room search/filter endpoints to use date-based availability
- Update receptionist room selection
- Refactor Admin Reports into:
  - Operational Reports
  - Booking Reports

# Milestone 29: Guest Date-Based Room Search Refactor

**Status:** ✅ Completed  
**Date:** July 24, 2026

---

## Objective

Refactor the guest room search from an **operational status-based** approach to a **date-based availability** system, allowing guests to search for rooms that are genuinely available within a selected date range.

---

## Problem Statement

Previously, the guest room search relied primarily on the `Room.status` field to determine room availability. This approach was inaccurate because a room marked as `AVAILABLE` could already have future bookings, resulting in guests attempting to reserve unavailable rooms.

The system needed to distinguish between:

- **Operational Status** (Maintenance, Available, Occupied)
- **Booking Availability** (Whether the room is free for a specific date range)

---

## Solution Implemented

### 1. Introduced Date-Based Availability Engine

Implemented a reusable private helper inside `RoomService`:

- `findAvailableRooms()`

Responsibilities:

- Exclude rooms under maintenance.
- Exclude rooms with overlapping bookings.
- Support optional room type filtering.
- Support optional maximum price filtering.
- Execute filtering directly in PostgreSQL using Prisma relational queries.

---

### 2. PostgreSQL-Based Availability Filtering

Availability is now determined using a relational query:

```ts
bookings: {
  none: {
    status: {
      in: [
        BookingStatus.PENDING,
        BookingStatus.PAID,
        BookingStatus.CHECKED_IN,
      ],
    },
    checkIn: {
      lt: requestedCheckOut,
    },
    checkOut: {
      gt: requestedCheckIn,
    },
  },
}
```

This allows PostgreSQL to filter unavailable rooms efficiently without performing application-level loops.

---

### 3. Separated Guest Endpoints

The guest API was redesigned into two distinct endpoints.

#### Browse Rooms

```http
GET /guest/rooms
```

Purpose:

- Display all rooms available for browsing.
- Excludes maintenance rooms.
- Does not require dates.

---

#### Filter Available Rooms

```http
GET /guest/rooms/filter
```

Query Parameters:

- `checkIn`
- `checkOut`
- `roomType` *(optional)*
- `maxPrice` *(optional)*

Purpose:

- Return only rooms available within the requested date range.

---

### 4. Introduced Dedicated DTO

Created:

```text
FilterGuestRoomsDto
```

This DTO validates:

- check-in date
- check-out date
- optional room type
- optional maximum price

The original room browsing endpoint no longer requires these fields.

---

### 5. Refactored Guest Service

Guest service responsibilities were separated.

#### Browse Rooms

```text
GuestController
        │
        ▼
GuestService.getRooms()
        │
        ▼
RoomService.getAllRooms()
```

---

#### Filter Rooms

```text
GuestController
        │
        ▼
GuestService.filterRooms()
        │
        ▼
RoomService.filterRoomsForGuest()
        │
        ▼
findAvailableRooms()
```

---

## Architectural Improvements

### Before

```text
Room.status
        │
        ▼
Guest Search
```

---

### After

```text
Guest Search
        │
        ▼
Date Range
        │
        ▼
Booking Status
        │
        ▼
Room Operational Status
        │
        ▼
Available Rooms
```

Availability is now determined using booking history rather than relying solely on the room's operational state.

---

## Performance Improvements

Instead of:

- Loading rooms
- Loading bookings
- Filtering in JavaScript

the application now:

- Executes a single optimized PostgreSQL query.
- Eliminates unnecessary memory usage.
- Avoids N+1 query patterns.
- Returns only eligible rooms from the database.

---

## Validation & Testing

The following scenarios were successfully tested.

### Room Browsing

- ✅ Returns all rooms.
- ✅ Excludes maintenance rooms.

---

### Guest Availability Search

- ✅ Returns available rooms.
- ✅ Excludes overlapping bookings.
- ✅ Allows adjacent bookings.
- ✅ Excludes maintenance rooms.
- ✅ Supports room type filtering.
- ✅ Supports maximum price filtering.

---

### Infrastructure Validation

- Verified successful operation after Neon database resumed from auto-suspend.
- Confirmed no logic issues after database reconnection.

---

## Outcome

The guest booking module now uses a production-style, date-based availability engine similar to modern hotel reservation systems.

This implementation provides:

- Accurate availability searches.
- Better scalability.
- Cleaner separation of concerns.
- Reusable availability logic for future receptionist and admin booking workflows.

---

## Next Milestone

**Milestone 30 — Receptionist Date-Based Booking Refactor**

Planned objectives:

- Reuse `findAvailableRooms()` within receptionist booking workflows.
- Replace receptionist room status checks with date-based availability.
- Ensure guests and receptionists share the same booking rules.
- Perform full regression testing across the booking lifecycle.

# Milestone 29 PART(2): Guest Date-Based Availability & Reporting Refactor

**Status:** ✅ Completed  
**Date:** July 24, 2026

---

# Objective

Continue the migration from a room status-based booking system to a production-style date-based reservation engine while improving the reporting architecture.

---

# Features Completed

## 1. Guest Room Search Refactor

The guest room search was redesigned to support date-based availability instead of relying on `Room.status`.

### New Guest Endpoints

#### Browse Rooms

```http
GET /guest/rooms
```

Purpose:

- Returns all rooms available for browsing.
- Excludes rooms under maintenance.
- Does not require booking dates.

---

#### Filter Available Rooms

```http
GET /guest/rooms/filter
```

Supports:

- checkIn
- checkOut
- roomType (optional)
- maxPrice (optional)

Returns only rooms available within the requested date range.

---

## 2. Dedicated Filter DTO

Introduced:

```text
FilterGuestRoomsDto
```

Responsibilities:

- Validate check-in date.
- Validate check-out date.
- Validate optional room type.
- Validate optional maximum price.

This separates room browsing from room availability searching.

---

## 3. Date-Based Availability Engine

Implemented a reusable availability helper inside `RoomService`.

```text
findAvailableRooms()
```

Responsibilities:

- Exclude maintenance rooms.
- Exclude overlapping bookings.
- Apply optional room type filter.
- Apply optional maximum price filter.

Availability is now determined using PostgreSQL relational filtering instead of JavaScript loops.

---

## 4. PostgreSQL Availability Query

Room availability is now calculated using Prisma relational filtering.

Blocking booking statuses:

- PENDING
- PAID
- CHECKED_IN

Ignored booking statuses:

- CHECKED_OUT
- CANCELLED

Overlap logic:

```text
existing.checkIn < requested.checkOut
AND
existing.checkOut > requested.checkIn
```

This allows adjacent bookings while preventing overlapping reservations.

---

## 5. Guest Service Refactor

The guest module now separates browsing rooms from searching available rooms.

### Browse Rooms

```text
GuestController
        │
        ▼
GuestService.getRooms()
        │
        ▼
RoomService.getAllRooms()
```

---

### Filter Available Rooms

```text
GuestController
        │
        ▼
GuestService.filterRooms()
        │
        ▼
RoomService.filterRoomsForGuest()
        │
        ▼
findAvailableRooms()
```

---

## 6. Reporting Architecture Refactor

The previous occupancy report mixed two independent concepts:

- Room operational states
- Booking reservation states

This has been redesigned into two dedicated reporting endpoints.

---

### Operational Report

```http
GET /admin/reports/operational
```

Source:

```text
Room.status
```

Example response:

```json
{
    "totalRooms": 5,
    "available": 4,
    "occupied": 1,
    "maintenance": 0
}
```

Purpose:

- Current operational state of rooms.
- Used by housekeeping and management.

---

### Booking Report

```http
GET /admin/reports/bookings
```

Source:

```text
Booking.status
```

Example response:

```json
{
    "pendingBookings": 4,
    "paidBookings": 3,
    "checkedInBookings": 1,
    "checkedOutBookings": 5,
    "cancelledBookings": 2
}
```

Purpose:

- Reservation pipeline reporting.
- Booking lifecycle monitoring.

---

# Architectural Improvements

## Before

```text
Room.status
        │
        ▼
Guest Availability
        │
        ▼
Occupancy Report
```

The same field attempted to represent both room operations and booking availability.

---

## After

```text
Room.status
        │
        ├────────► Operational Report

Booking.status
        │
        ├────────► Booking Report

Booking Dates
        │
        ├────────► Guest Availability Search
```

Each responsibility is now clearly separated.

---

# Performance Improvements

The guest availability search now:

- Uses a single PostgreSQL query.
- Eliminates application-level filtering.
- Avoids N+1 query patterns.
- Returns only eligible rooms directly from the database.

---

# Validation & Testing

Completed successfully:

## Guest Room Browsing

- ✅ Returns all rooms.
- ✅ Excludes maintenance rooms.

---

## Guest Availability Search

- ✅ Available rooms returned correctly.
- ✅ Overlapping bookings excluded.
- ✅ Adjacent bookings allowed.
- ✅ Maintenance rooms excluded.
- ✅ Room type filtering works.
- ✅ Maximum price filtering works.

---

## Infrastructure

- ✅ Verified successful recovery after Neon auto-suspend.
- ✅ Confirmed availability engine functions correctly after database reconnect.

---

# Outcome

The backend now uses a production-style reservation engine where:

- Operational room state is managed independently.
- Booking lifecycle is managed independently.
- Availability is determined using booking dates rather than room status.
- Administrative reporting follows clear separation of concerns.

This architecture provides a cleaner foundation for receptionist workflows, occupancy analytics, and future reporting features.

---

# Milestone 30 – SMS Module & OTP Authentication

**Date:** July 25, 2026

## Objective

Complete SMS integration for OTP authentication and verify end-to-end OTP delivery using the actual authentication flow.

---

## Completed Tasks

### SMS Module Refactoring

- Refactored the SMS module to support multiple SMS providers.
- Introduced a common `SmsProvider` interface.
- Implemented:
  - `ArkeselProvider`
  - `SmsOnlineGhProvider`
- Configured runtime provider switching using:

```env
SMS_PROVIDER=ARKASEL
```

or

```env
SMS_PROVIDER=SMSONLINEGH
```

---

### SMSOnlineGH Integration

Successfully integrated SMSOnlineGH API.

#### Issue encountered

The API rejected requests with:

```json
{
  "handshake": {
    "label": "MV_ERR_MESSAGE"
  }
}
```

#### Root cause

The API expects the form field:

```text
text
```

instead of

```text
message
```

Updating the request payload resolved the issue.

---

### Arkesel Integration

Successfully integrated Arkesel.

#### Issue encountered

API returned:

```
The sender field is required.
```

#### Root cause

Environment variable names did not match the configuration keys used by `ConfigService`.

Incorrect lookup:

```
ARKESEL_API_KEY
ARKESEL_SENDER
```

Actual environment variables:

```
ARKASEL_API_KEY
ARKASEL_SENDER
```

Updating the configuration keys resolved the issue.

---

### OTP Authentication Flow

Verified the complete authentication workflow.

Flow:

1. Validate authentication mode.
2. Invalidate previous OTPs.
3. Generate OTP.
4. Hash OTP.
5. Store OTP in database.
6. Send OTP through the configured SMS provider.
7. Return success response.

---

### End-to-End Testing

Successfully tested:

- SMSOnlineGH
- Arkesel
- `POST /auth/request-otp`

Verified:

- OTP generation
- OTP hashing
- Database persistence
- SMS delivery
- Runtime SMS provider switching

---

## Current SMS Architecture

```
AuthService
      │
      ▼
SmsService
      │
      ├── ArkeselProvider
      └── SmsOnlineGhProvider
```

---

## Current Status

✅ SMS provider abstraction completed.

✅ SMSOnlineGH working.

✅ Arkesel working.

✅ OTP authentication flow working.

✅ Runtime provider switching working.

---

## Next Session

- Remove the temporary `SmsController`.
- Remove the `/sms/test` endpoint.
- Use `POST /auth/request-otp` as the permanent SMS testing endpoint.
- Continue with the next backend module.