import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import type { Tile } from '../types';

// ─── Mock grid ────────────────────────────────────────────────────────────────

const mockGrid: Tile[][] = [[
  { x: 0, y: 0, symbol: 'W', type: 'cabana', id: 'cabana-0-0', available: true },
  { x: 1, y: 0, symbol: 'W', type: 'cabana', id: 'cabana-1-0', available: false },
  { x: 2, y: 0, symbol: 'p', type: 'pool',   id: null,         available: true },
]];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mockFetch(data: unknown, status = 200) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
  }));
}

beforeEach(() => vi.stubGlobal('fetch', vi.fn()));
afterEach(() => vi.restoreAllMocks());

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('App', () => {
  it('shows a loading spinner while fetching the map', () => {
    mockFetch(mockGrid);
    render(<App />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders the map grid after successful fetch', async () => {
    mockFetch(mockGrid);
    render(<App />);
    await waitFor(() => expect(screen.getByRole('grid')).toBeInTheDocument());
  });

  it('shows an error alert when the fetch fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));
    render(<App />);
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
  });

  it('opens the booking modal when an available cabin is clicked', async () => {
    mockFetch(mockGrid);
    const user = userEvent.setup();
    render(<App />);
    await waitFor(() => screen.getByRole('grid'));

    const available = screen.getByLabelText(/cabana-0-0.*available/i);
    await user.click(available);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Confirm Reservation/i)).toBeInTheDocument();
  });

  it('shows "already booked" notice when a booked cabin is clicked', async () => {
    mockFetch(mockGrid);
    const user = userEvent.setup();
    render(<App />);
    await waitFor(() => screen.getByRole('grid'));

    const booked = screen.getByLabelText(/cabana-1-0.*already booked/i);
    await user.click(booked);

    await waitFor(() =>
      expect(screen.getByText(/already booked/i)).toBeInTheDocument(),
    );
  });

  it('displays cabin count in the stats strip', async () => {
    mockFetch(mockGrid);
    render(<App />);
    await waitFor(() => screen.getByRole('grid'));
    // Stats strip renders "Total: 2 cabins" across multiple elements
    const strip = document.querySelector('.status-strip');
    expect(strip?.textContent).toMatch(/Total.*2.*cabins/s);
  });
});
