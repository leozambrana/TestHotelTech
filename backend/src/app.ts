import express from 'express';
import cors from 'cors';
import type { GuestRecord, BookingBody } from './types.js';
import { parseMap } from './mapParser.js';
import {
  isValidGuest,
  isCabanaBooked,
  getBooking,
  addBooking,
  getAllBookedIds,
} from './bookingService.js';

/**
 * Factory function that creates and configures the Express application.
 * Keeping app creation separate from server.listen() allows the app
 * to be instantiated in tests without binding to a port.
 */
export function createApp(guestList: GuestRecord[], mapPath: string) {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // ── GET /api/map ──────────────────────────────────────────────────────────
  app.get('/api/map', (_req, res) => {
    try {
      const bookedIds = getAllBookedIds();
      const grid = parseMap(mapPath).map((row) =>
        row.map((tile) => ({
          ...tile,
          available:
            tile.type === 'cabana' && tile.id !== null
              ? !bookedIds.has(tile.id)
              : tile.available,
        })),
      );
      res.json(grid);
    } catch {
      res.status(500).json({ error: 'Failed to parse map file.' });
    }
  });

  // ── POST /api/bookings ────────────────────────────────────────────────────
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
    res.status(201).json({
      message: 'Cabana successfully booked!',
      booking: { cabanaId, guestName, roomNumber },
    });
  });

  // ── GET /api/guests ───────────────────────────────────────────────────────
  app.get('/api/guests', (_req, res) => {
    res.json(guestList);
  });

  // ── GET /api/health ───────────────────────────────────────────────────────
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', map: mapPath, bookedCount: getAllBookedIds().size });
  });

  return app;
}
