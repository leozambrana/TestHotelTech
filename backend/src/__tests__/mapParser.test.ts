import { describe, it, expect } from 'vitest';
import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { parseMap } from '../mapParser.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function withTempMap(content: string, fn: (path: string) => void) {
  const path = join(tmpdir(), `test-map-${Date.now()}.ascii`);
  writeFileSync(path, content, 'utf-8');
  try { fn(path); } finally { unlinkSync(path); }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('parseMap', () => {
  it('returns the correct number of rows and columns', () => {
    withTempMap('.W.\n.#.\n...', (p) => {
      const grid = parseMap(p);
      expect(grid).toHaveLength(3);
      expect(grid[0]).toHaveLength(3);
    });
  });

  it('identifies cabana (W) tiles with correct type, id, and availability', () => {
    withTempMap('.W.\n...', (p) => {
      const grid = parseMap(p);
      const tile = grid[0]![1]!; // W at (x=1, y=0)
      expect(tile.type).toBe('cabana');
      expect(tile.id).toBe('cabana-1-0');
      expect(tile.available).toBe(true);
      expect(tile.symbol).toBe('W');
    });
  });

  it('identifies pool (p) tiles correctly', () => {
    withTempMap('p', (p) => {
      const tile = parseMap(p)[0]![0]!;
      expect(tile.type).toBe('pool');
      expect(tile.id).toBeNull();
    });
  });

  it('identifies path (#) tiles correctly', () => {
    withTempMap('#', (p) => {
      const tile = parseMap(p)[0]![0]!;
      expect(tile.type).toBe('path');
      expect(tile.id).toBeNull();
    });
  });

  it('identifies chalet (c) tiles correctly', () => {
    withTempMap('c', (p) => {
      const tile = parseMap(p)[0]![0]!;
      expect(tile.type).toBe('chalet');
      expect(tile.id).toBeNull();
    });
  });

  it('identifies empty (.) tiles correctly', () => {
    withTempMap('.', (p) => {
      const tile = parseMap(p)[0]![0]!;
      expect(tile.type).toBe('empty');
      expect(tile.id).toBeNull();
    });
  });

  it('assigns correct x / y coordinates to each tile', () => {
    withTempMap('...\n..W', (p) => {
      const grid = parseMap(p);
      const cabana = grid[1]![2]!;
      expect(cabana.x).toBe(2);
      expect(cabana.y).toBe(1);
    });
  });

  it('generates unique ids per cabana based on coordinates', () => {
    withTempMap('WW\nWW', (p) => {
      const grid = parseMap(p);
      const ids = grid.flat().filter((t) => t.type === 'cabana').map((t) => t.id);
      const unique = new Set(ids);
      expect(unique.size).toBe(4);
    });
  });

  it('falls back to "empty" for unknown symbols', () => {
    withTempMap('?', (p) => {
      const tile = parseMap(p)[0]![0]!;
      expect(tile.type).toBe('empty');
    });
  });

  it('handles CRLF line endings correctly', () => {
    withTempMap('WW\r\nWW', (p) => {
      const grid = parseMap(p);
      expect(grid).toHaveLength(2);
      expect(grid[0]![0]!.type).toBe('cabana');
    });
  });

  it('skips blank lines', () => {
    withTempMap('WW\n\nWW', (p) => {
      const grid = parseMap(p);
      expect(grid).toHaveLength(2);
    });
  });
});
