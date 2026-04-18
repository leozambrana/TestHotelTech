import type { GuestRecord, BookingBody } from './types.js';

const bookedCabanas = new Map<string, BookingBody>();

export function isValidGuest(guestList: GuestRecord[], guestName: string, roomNumber: string): boolean {
  return guestList.some(
    (g) =>
      g.guestName.trim().toLowerCase() === guestName.trim().toLowerCase() &&
      g.room === roomNumber.trim(),
  );
}

export function isCabanaBooked(cabanaId: string): boolean {
  return bookedCabanas.has(cabanaId);
}

export function getBooking(cabanaId: string): BookingBody | undefined {
  return bookedCabanas.get(cabanaId);
}

export function addBooking(booking: BookingBody): void {
  bookedCabanas.set(booking.cabanaId, booking);
}

export function getAllBookedIds(): Set<string> {
  return new Set(bookedCabanas.keys());
}
