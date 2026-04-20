# Resort Paradise — Cabana Booking System

An interactive resort map webapp where guests can browse real-time cabana availability and book a poolside spot in just two clicks.

---

## Quick Start

```bash
# 1. Install all dependencies (run once)
npm run install-all

# 2. Start backend + frontend together (uses default map.ascii and bookings.json)
npm start

# 3. Or specify custom files
npm start -- --map=./map.ascii --bookings=./bookings.json
```

Frontend: http://localhost:5173  
Backend API: http://localhost:3001

---

## Running Tests

```bash
#running all tests
npm run test

# Backend — unit tests (mapParser, bookingService) + integration tests (API routes)
npm test --prefix backend

# Frontend — component and UI tests (App, BookingModal)
npm test --prefix frontend
```

---

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── app.ts              # Express app factory (routes, no listen)
│   │   ├── server.ts           # CLI args + server startup
│   │   ├── mapParser.ts        # ASCII map → typed tile grid
│   │   ├── bookingService.ts   # In-memory booking state + validation
│   │   ├── types.ts            # Shared TypeScript interfaces
│   │   └── __tests__/          # Unit + integration tests
│   └── vitest.config.ts
├── frontend/
│   ├── src/
│   │   ├── assets/                     # Tile image assets
│   │   ├── App.tsx             # Root component, state, fetch
│   │   ├── MapTile.tsx         # Single tile with neighbor-aware path images
│   │   ├── BookingModal.tsx    # Booking form + API integration
│   │   ├── GuestListModal.tsx  # Dev helper — guest reference list
│   │   ├── types.ts            # Frontend-side type mirror of backend
│   │   └── __tests__/          # Component tests
│   └── vitest.config.ts
├── map.ascii                   # Default resort map layout
├── bookings.json               # Default guest list
└── scripts/start.js            # Monorepo launcher (passes CLI args through)
```

---

## API Reference

| Method | Endpoint        | Description                                        |
| ------ | --------------- | -------------------------------------------------- |
| `GET`  | `/api/map`      | Full tile grid with live availability              |
| `POST` | `/api/bookings` | Book a cabin `{ cabanaId, guestName, roomNumber }` |
| `GET`  | `/api/guests`   | List all registered guests (dev reference)         |
| `GET`  | `/api/health`   | Server health + booking count                      |

---

## Design Decisions & Trade-offs

**Separation of concerns over minimal code.** The backend is split into four focused files: `server.ts` handles CLI arguments and calls `app.listen()` — it is the entry point and nothing else. `app.ts` exports a `createApp()` factory that receives the guest list and map path, configures all Express routes, and returns the app _without_ binding to a port. This separation is what makes integration tests possible: tests import `createApp()` directly and use `supertest` against it without ever starting a real server. `mapParser.ts` is a pure file-to-grid transform, and `bookingService.ts` owns the in-memory booking state with a clean, testable API.

**No database, no persistence.** In-memory state via a `Map<string, Booking>` resets on restart. The spec explicitly allows this, and it keeps the solution self-contained with zero infrastructure dependencies.

**No auth library.** Room number + guest name is treated as "sufficient auth" per spec. Validation is a simple array lookup against the loaded `bookings.json`.

**Neighbor-aware path rendering.** Path tiles (`#`) inspect their four cardinal neighbors to pick the correct arrow image (straight, corner, T-junction, 4-way crossing) and CSS rotation. This required reading the actual pixel content of the asset images to determine their default orientation — a detail that would be easy to miss.

**`useState` + `fetch` only on the frontend.** No router, no state manager. The component tree is shallow enough that prop drilling is trivial. Adding Redux or React Query for three components would be over-engineering.

**Dev-only guest list modal.** The `?` button exposes all registered guests for easy testing during review. It could be stripped before production; it doesn't affect any booking or validation logic.
