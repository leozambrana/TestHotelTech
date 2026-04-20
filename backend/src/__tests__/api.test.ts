import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { createApp } from '../app.js';
import { resetBookings } from '../bookingService.js';
import type { GuestRecord } from '../types.js';

// ─── Shared fixtures ──────────────────────────────────────────────────────────

const TEST_MAP = '.W.\n.#.\n...';
const GUESTS: GuestRecord[] = [
  { room: '101', guestName: 'Alice Smith' },
  { room: '102', guestName: 'Bob Jones' },
];

let mapPath: string;
let app: ReturnType<typeof createApp>;

beforeAll(() => {
  mapPath = join(tmpdir(), `api-test-map-${Date.now()}.ascii`);
  writeFileSync(mapPath, TEST_MAP, 'utf-8');
  app = createApp(GUESTS, mapPath);
});

afterAll(() => unlinkSync(mapPath));

beforeEach(() => resetBookings());

// ─── GET /api/map ─────────────────────────────────────────────────────────────

describe('GET /api/map', () => {
  it('returns 200 with a 2-D array', async () => {
    const res = await request(app).get('/api/map');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(Array.isArray(res.body[0])).toBe(true);
  });

  it('grid contains the cabana tile with correct shape', async () => {
    const res = await request(app).get('/api/map');
    const cabana = (res.body as any[][]).flat().find((t: any) => t.type === 'cabana');
    expect(cabana).toBeDefined();
    expect(cabana.id).toBe('cabana-1-0');
    expect(cabana.x).toBe(1);
    expect(cabana.y).toBe(0);
    expect(cabana.available).toBe(true);
  });

  it('shows available: false for a booked cabin', async () => {
    await request(app).post('/api/bookings').send({
      cabanaId: 'cabana-1-0',
      guestName: 'Alice Smith',
      roomNumber: '101',
    });
    const res = await request(app).get('/api/map');
    const cabana = (res.body as any[][]).flat().find((t: any) => t.type === 'cabana');
    expect(cabana.available).toBe(false);
  });
});

// ─── POST /api/bookings ───────────────────────────────────────────────────────

describe('POST /api/bookings', () => {
  it('returns 201 for a valid guest and room', async () => {
    const res = await request(app).post('/api/bookings').send({
      cabanaId: 'cabana-1-0',
      guestName: 'Alice Smith',
      roomNumber: '101',
    });
    expect(res.status).toBe(201);
    expect(res.body.message).toMatch(/booked/i);
    expect(res.body.booking.cabanaId).toBe('cabana-1-0');
  });

  it('returns 400 when guest is not in the list', async () => {
    const res = await request(app).post('/api/bookings').send({
      cabanaId: 'cabana-1-0',
      guestName: 'Unknown Person',
      roomNumber: '999',
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await request(app).post('/api/bookings').send({ cabanaId: 'cabana-1-0' });
    expect(res.status).toBe(400);
  });

  it('returns 409 when the cabin is already booked', async () => {
    await request(app).post('/api/bookings').send({
      cabanaId: 'cabana-1-0',
      guestName: 'Alice Smith',
      roomNumber: '101',
    });
    const res = await request(app).post('/api/bookings').send({
      cabanaId: 'cabana-1-0',
      guestName: 'Bob Jones',
      roomNumber: '102',
    });
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/already booked/i);
  });
});

// ─── GET /api/guests ──────────────────────────────────────────────────────────

describe('GET /api/guests', () => {
  it('returns 200 with the loaded guest array', async () => {
    const res = await request(app).get('/api/guests');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(GUESTS.length);
    expect(res.body[0].guestName).toBe('Alice Smith');
  });
});

// ─── GET /api/health ──────────────────────────────────────────────────────────

describe('GET /api/health', () => {
  it('returns status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('reflects bookedCount after a booking', async () => {
    await request(app).post('/api/bookings').send({
      cabanaId: 'cabana-1-0',
      guestName: 'Alice Smith',
      roomNumber: '101',
    });
    const res = await request(app).get('/api/health');
    expect(res.body.bookedCount).toBe(1);
  });
});
