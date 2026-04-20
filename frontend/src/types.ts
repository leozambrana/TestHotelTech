// Shared types mirroring the backend's types.ts

export type TileType = 'cabana' | 'pool' | 'path' | 'chalet' | 'empty';

export interface Tile {
  x: number;
  y: number;
  symbol: string;
  type: TileType;
  id: string | null;
  available: boolean;
}

export interface BookingPayload {
  cabanaId: string;
  guestName: string;
  roomNumber: string;
}

export interface BookingResponse {
  message: string;
  booking: BookingPayload;
}

export interface ApiError {
  error: string;
}
