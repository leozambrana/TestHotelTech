#!/usr/bin/env node
/**
 * scripts/start.js
 *
 * Cross-platform entry point for `npm start` at the monorepo root.
 *
 * Usage:
 *   npm start                                              # use defaults
 *   npm start -- --map=./map.ascii --bookings=./bookings.json
 *
 * This script:
 *  1. Parses --map and --bookings from process.argv (after the `--` separator).
 *  2. Spawns the frontend (Vite dev) and backend (tsx) via `concurrently`.
 *  3. Passes the flags through to the backend tsx process.
 */

'use strict';

const { parseArgs } = require('util');
const { concurrently } = require('concurrently');
const path = require('path');

// ─── Argument parsing ─────────────────────────────────────────────────────────

const { values } = parseArgs({
  options: {
    map: { type: 'string', default: './map.ascii' },
    bookings: { type: 'string', default: './bookings.json' },
  },
  strict: false,
  args: process.argv.slice(2),
});

const mapArg = `--map=${values.map}`;
const bookingsArg = `--bookings=${values.bookings}`;

// ─── Resolve paths relative to the monorepo root ─────────────────────────────

const root = path.resolve(__dirname, '..');
const backendSrc = path.join(root, 'backend', 'src', 'server.ts');

// ─── Spawn both services ──────────────────────────────────────────────────────

const { result } = concurrently(
  [
    {
      name: 'WEB',
      command: 'npm run dev',
      cwd: path.join(root, 'frontend'),
      prefixColor: 'cyan.bold',
    },
    {
      name: 'API',
      command: `npx tsx "${backendSrc}" ${mapArg} ${bookingsArg}`,
      cwd: root,
      prefixColor: 'magenta.bold',
    },
  ],
  {
    killOthers: ['failure', 'success'],
    restartTries: 0,
  },
);

result.then(
  () => process.exit(0),
  (err) => {
    console.error(err);
    process.exit(1);
  },
);
