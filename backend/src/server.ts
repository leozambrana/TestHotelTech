import express from 'express';
import cors from 'cors';
import { readFileSync } from 'fs';
import { parseArgs } from 'util';
import { parseMap } from './mapParser.js';
import { isValidGuest, isCabanaBooked, getBooking, addBooking, getAllBookedIds } from './bookingService.js';
import type { GuestRecord, BookingBody } from './types.js';

// ─── CLI Arguments ────────────────────────────────────────────────────────────

const { values: args } = parseArgs({
  options: {
    map: { type: 'string', default: './map.ascii' },
    bookings: { type: 'string', default: './bookings.json' },
  },
  strict: false,
});

const MAP_PATH = args.map as string;
const BOOKINGS_PATH = args.bookings as string;

// ─── Load guest list at startup ───────────────────────────────────────────────

let guestList: GuestRecord[] = [];
try {
  const raw = readFileSync(BOOKINGS_PATH, 'utf-8');
  guestList = JSON.parse(raw) as GuestRecord[];
  console.log(`\x1b[35m[API]\x1b[0m Loaded ${guestList.length} guests from "${BOOKINGS_PATH}"`);
} catch {
  console.error(`\x1b[31m[API]\x1b[0m Failed to read bookings file: ${BOOKINGS_PATH}`);
  process.exit(1);
}

// ─── Express app ──────────────────────────────────────────────────────────────

const app = express();
app.use(cors());
app.use(express.json());

//Routes and logics

app.get('/api/map', (_req, res) => {
  try {
    const bookedIds = getAllBookedIds();
    const grid = parseMap(MAP_PATH).map((row) =>
      row.map((tile) => ({
        ...tile,
        available: tile.type === 'cabana' && tile.id !== null
          ? !bookedIds.has(tile.id)
          : tile.available,
      })),
    );
    res.json(grid);
  } catch {
    res.status(500).json({ error: 'Failed to parse map file.' });
  }
});

app.post('/api/bookings', (req, res) => {
  const { cabanaId, guestName, roomNumber } = req.body as Partial<BookingBody>;

  if (!cabanaId || !guestName || !roomNumber) {
    res.status(400).json({ error: 'cabanaId, guestName and roomNumber are required.' });
    return;
  }

  if (!isValidGuest(guestList, guestName, roomNumber)) {
    res.status(400).json({
      error: `Guest "${guestName}" with room "${roomNumber}" not found in the bookings file.`,
    });
    return;
  }

  if (isCabanaBooked(cabanaId)) {
    const existing = getBooking(cabanaId)!;
    res.status(409).json({
      error: `Cabana "${cabanaId}" is already booked by ${existing.guestName}.`,
    });
    return;
  }

  addBooking({ cabanaId, guestName: guestName.trim(), roomNumber: roomNumber.trim() });
  console.log(`\x1b[35m[API]\x1b[0m Booked ${cabanaId} for ${guestName} (room ${roomNumber})`);

  res.status(201).json({
    message: 'Cabana successfully booked!',
    booking: { cabanaId, guestName, roomNumber },
  });
});

app.get('/api/guests', (_req, res) => {
  res.json(guestList);
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', map: MAP_PATH, bookings: BOOKINGS_PATH, bookedCount: getAllBookedIds().size });
});

//Start server

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`\x1b[35m[API]\x1b[0m Server running at http://localhost:${PORT}`);
  console.log(`\x1b[35m[API]\x1b[0m Map      → ${MAP_PATH}`);
  console.log(`\x1b[35m[API]\x1b[0m Bookings → ${BOOKINGS_PATH}`);
});
