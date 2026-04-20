import { describe, it, expect, beforeEach } from 'vitest';
import {
  isValidGuest,
  isCabanaBooked,
  getBooking,
  addBooking,
  getAllBookedIds,
  resetBookings,
} from '../bookingService.js';
import type { GuestRecord } from '../types.js';

const GUESTS: GuestRecord[] = [
  { room: '101', guestName: 'Alice Smith' },
  { room: '102', guestName: 'Bob Jones' },
];

// ─── isValidGuest ─────────────────────────────────────────────────────────────

describe('isValidGuest', () => {
  it('returns true for an exact name + room match', () => {
    expect(isValidGuest(GUESTS, 'Alice Smith', '101')).toBe(true);
  });

  it('is case-insensitive for guest name', () => {
    expect(isValidGuest(GUESTS, 'alice smith', '101')).toBe(true);
    expect(isValidGuest(GUESTS, 'ALICE SMITH', '101')).toBe(true);
  });

  it('trims whitespace from inputs', () => {
    expect(isValidGuest(GUESTS, '  Alice Smith  ', '101')).toBe(true);
  });

  it('returns false when room number does not match', () => {
    expect(isValidGuest(GUESTS, 'Alice Smith', '102')).toBe(false);
  });

  it('returns false when name does not match', () => {
    expect(isValidGuest(GUESTS, 'Wrong Name', '101')).toBe(false);
  });

  it('returns false for an empty guest list', () => {
    expect(isValidGuest([], 'Alice Smith', '101')).toBe(false);
  });
});

// ─── booking state ────────────────────────────────────────────────────────────

describe('booking state', () => {
  beforeEach(() => resetBookings());

  it('isCabanaBooked returns false before any booking', () => {
    expect(isCabanaBooked('cabana-1-1')).toBe(false);
  });

  it('addBooking marks the cabin as booked', () => {
    addBooking({ cabanaId: 'cabana-1-1', guestName: 'Alice', roomNumber: '101' });
    expect(isCabanaBooked('cabana-1-1')).toBe(true);
  });

  it('getBooking returns the correct booking details', () => {
    addBooking({ cabanaId: 'cabana-1-1', guestName: 'Alice', roomNumber: '101' });
    expect(getBooking('cabana-1-1')).toEqual({
      cabanaId: 'cabana-1-1',
      guestName: 'Alice',
      roomNumber: '101',
    });
  });

  it('getBooking returns undefined for an unbooked cabin', () => {
    expect(getBooking('cabana-99-99')).toBeUndefined();
  });

  it('getAllBookedIds reflects all current bookings', () => {
    addBooking({ cabanaId: 'cabana-1-1', guestName: 'Alice', roomNumber: '101' });
    addBooking({ cabanaId: 'cabana-2-2', guestName: 'Bob', roomNumber: '102' });
    const ids = getAllBookedIds();
    expect(ids.has('cabana-1-1')).toBe(true);
    expect(ids.has('cabana-2-2')).toBe(true);
    expect(ids.size).toBe(2);
  });

  it('does not affect other cabanas when one is booked', () => {
    addBooking({ cabanaId: 'cabana-1-1', guestName: 'Alice', roomNumber: '101' });
    expect(isCabanaBooked('cabana-2-2')).toBe(false);
  });

  it('resetBookings clears all bookings', () => {
    addBooking({ cabanaId: 'cabana-1-1', guestName: 'Alice', roomNumber: '101' });
    resetBookings();
    expect(isCabanaBooked('cabana-1-1')).toBe(false);
    expect(getAllBookedIds().size).toBe(0);
  });
});
