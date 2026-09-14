# FasalFlux Prototype Architecture

## Scope
Farmer-first SIH demo prototype. UI is the source of truth; mock API uses in-memory data.

## Frontend
- `src/App.tsx`: current UI composition and routes (kept stable for prototype fidelity)
- `src/components/`: reusable UI and future farmer/official components
- `src/pages/farmer/`: future farmer page extraction boundary
- `src/services/`: future API/service layer boundary
- `src/types/`: future shared domain types
- `src/lib/i18n.tsx`: English, Hindi, Tamil, Punjabi

## Mock backend
- `mock-api/server.mjs`: lightweight HTTP API
- `mock-api/routes/`: future route modules
- `mock-api/services/`: future business-logic modules
- `mock-api/data/`: future seed/mock data modules

## Farmer flow
Dashboard -> Crop -> Mandi -> Date -> Dynamic Slot -> Confirmation -> Digital Pass/QR -> Live Queue -> Delayed/Reschedule -> Payments.

## Important business rules
- Never allow a past slot on the current date.
- Perishable slots are 04:00-08:00.
- Grain and perishable booking selection is separate.
- Slot capacity is checked server-side.
- Queue position and ETA are recalculated after booking/status changes.
- Rescheduling releases the old logical capacity and assigns an alternative slot in the mock flow.

## Future production boundary
Do not add PostgreSQL/Prisma/Redis/Socket.IO/JWT/Bhashini/SMS/DBT to this prototype. Those belong to the production implementation phase.
