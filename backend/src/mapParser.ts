import { readFileSync } from 'fs';
import type { Tile, TileType } from './types.js';

// ─── Symbol → Type mapping ────────────────────────────────────────────────────

const SYMBOL_MAP: Record<string, TileType> = {
  W: 'cabana',
  p: 'pool',
  '#': 'path',
  c: 'chalet',
  '.': 'empty',
};

// ─── Parser ───────────────────────────────────────────────────────────────────

/**
 * Reads an ASCII map file and converts every character into a Tile object.
 * Cabanas (W) receive a unique id in the format `cabana-<x>-<y>`.
 * The `available` flag is always true here; the router layer overlays
 * the in-memory bookings state before responding to the client.
 */
export function parseMap(filePath: string): Tile[][] {
  const raw = readFileSync(filePath, 'utf-8');
  const lines = raw.replace(/\r/g, '').split('\n').filter((l) => l.length > 0);

  return lines.map((line, y) =>
    line.split('').map((symbol, x): Tile => {
      const type: TileType = SYMBOL_MAP[symbol] ?? 'empty';
      const isCabana = type === 'cabana';

      return {
        x,
        y,
        symbol,
        type,
        id: isCabana ? `cabana-${x}-${y}` : null,
        available: true, // bookings state applied at route level
      };
    }),
  );
}
