import { readFileSync } from 'fs';
import { parseArgs } from 'util';
import { createApp } from './app.js';
import type { GuestRecord } from './types.js';

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

// ─── Start ────────────────────────────────────────────────────────────────────

const app = createApp(guestList, MAP_PATH);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`\x1b[35m[API]\x1b[0m Server running at http://localhost:${PORT}`);
  console.log(`\x1b[35m[API]\x1b[0m Map      → ${MAP_PATH}`);
  console.log(`\x1b[35m[API]\x1b[0m Bookings → ${BOOKINGS_PATH}`);
});
