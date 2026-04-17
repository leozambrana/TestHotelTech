Resort Map Booking - Project Blueprint

1. Context & Tech Stack
   Build a simple, luxury-themed resort booking app.

Frontend: React (Vite) + Tailwind CSS.

Backend: Node.js (Express) + TypeScript.

Language: TypeScript for both.

Goal: Pragmatic, simple, and clean code. Avoid over-engineering.

2. Core Requirements
   Map Parsing: Read an ASCII file (map.ascii) and convert it into a grid for the frontend.

Symbols: W (Cabana), p (Pool), # (Path), c (Chalet), . (Empty).

Booking Flow:

Click W -> If available: Modal asks for Name & Room Number.

Validate against bookings.json.

If valid -> Mark as booked in-memory.

Update UI immediately (distinct style for booked cabanas).

Single Entrypoint: The root package.json must have a script to run both via concurrently. It must accept --map and --bookings flags.

3. Data Structure & Logic
   Backend (The Source of Truth)
   State: Maintain an in-memory array/object of bookedCabanas. No database.

Validation: Check if guestName and roomNumber exist in the provided bookings.json before confirming a booking.

CLI Arguments: Use process.argv or minimist to capture:

--map <path> (Default: ./map.ascii)

--bookings <path> (Default: ./bookings.json)

Frontend (The UI)
Map Rendering: Fetch the grid from the API. Render each cell as a Tile component.

Visuals: Use the provided assets. Available cabanas should look "clickable". Booked cabanas should look "occupied" (e.g., red tint or icon).

UX: Clear error messages for invalid guests and a success confirmation after booking.

4. Development Steps for Cursor
   Step 1: Create the project structure (Monorepo style with /backend and /frontend).

Step 2: Implement the ASCII Parser in the backend. It should return a JSON grid like [[{ type: 'W', id: '0-1', x: 0, y: 1 }, ...]].

Step 3: Implement the Booking API (POST /api/book) with validation against bookings.json.

Step 4: Build the React frontend. Map the grid to a CSS Grid layout.

Step 5: Add the Modal for booking and integrate with the API.

Step 6: Create the single-command runner in the root package.json.

5. Coding Standards (Marcin's Preferences)
   Simplicity: Don't use Redux or complex state machines. useState and fetch are enough.

Testing: Generate unit tests for the ASCII parser and the booking validation logic.

Documentation: Maintain an AI.md file tracking the prompts used.
