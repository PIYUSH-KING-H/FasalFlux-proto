# Mandi Official Prototype

The official view is intentionally separate from the farmer view.

## Flow
Officer View → Centre Overview → Live Queue → QR/Demo Check-in → Procurement → Digital Receipt + DBT Tracker.

## Prototype rules
- No real camera is required for QR check-in.
- Queue actions update mock in-memory state.
- Reschedule assigns the next available alternative slot.
- No-show marks the token cancelled.
- Procurement is recorded in mock data.
- Payment/DBT status is simulated.
- Capacity metrics are demo operational values.

The farmer UI and farmer routes are kept unchanged by the official feature work.
