// ─── Map ──────────────────────────────────────────────────────────────────────

export type TileType = 'cabana' | 'pool' | 'path' | 'chalet' | 'empty';

export interface Tile {
  x: number;
  y: number;
  symbol: string;
  type: TileType;
  id: string | null; // only cabanas have an id
  available: boolean;
}

// ─── Bookings ─────────────────────────────────────────────────────────────────

export interface GuestRecord {
  room: string;
  guestName: string;
}

export interface BookingBody {
  cabanaId: string;
  guestName: string;
  roomNumber: string;
}
