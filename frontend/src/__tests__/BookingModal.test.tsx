import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BookingModal } from '../BookingModal';
import type { Tile } from '../types';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockTile: Tile = {
  x: 1, y: 1, symbol: 'W', type: 'cabana', id: 'cabana-1-1', available: true,
};

const mockOnClose   = vi.fn();
const mockOnSuccess = vi.fn();

function renderModal() {
  return render(
    <BookingModal tile={mockTile} onClose={mockOnClose} onSuccess={mockOnSuccess} />,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('fetch', vi.fn());
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('BookingModal', () => {
  it('renders the guest name and room number fields', () => {
    renderModal();
    expect(screen.getByLabelText(/Guest Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Room Number/i)).toBeInTheDocument();
  });

  it('shows the cabin id in the header', () => {
    renderModal();
    expect(screen.getByText('cabana-1-1')).toBeInTheDocument();
  });

  it('disables the confirm button when fields are empty', () => {
    renderModal();
    expect(screen.getByRole('button', { name: /Confirm Booking/i })).toBeDisabled();
  });

  it('enables the confirm button when both fields are filled', async () => {
    const user = userEvent.setup();
    renderModal();
    await user.type(screen.getByLabelText(/Guest Name/i), 'Alice');
    await user.type(screen.getByLabelText(/Room Number/i), '101');
    expect(screen.getByRole('button', { name: /Confirm Booking/i })).not.toBeDisabled();
  });

  it('calls onClose when Cancel is clicked', async () => {
    renderModal();
    await userEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(mockOnClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when Escape is pressed', async () => {
    renderModal();
    await userEvent.keyboard('{Escape}');
    expect(mockOnClose).toHaveBeenCalledOnce();
  });

  it('shows an error alert on a 400 response', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Guest not found in the bookings file.' }),
    });
    const user = userEvent.setup();
    renderModal();
    await user.type(screen.getByLabelText(/Guest Name/i), 'Wrong Name');
    await user.type(screen.getByLabelText(/Room Number/i), '999');
    await user.click(screen.getByRole('button', { name: /Confirm Booking/i }));

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(screen.getByText(/Guest not found/i)).toBeInTheDocument();
  });

  it('shows a success message on a 201 response', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({
        message: 'Cabana successfully booked!',
        booking: { cabanaId: 'cabana-1-1', guestName: 'Alice Smith', roomNumber: '101' },
      }),
    });
    const user = userEvent.setup();
    renderModal();
    await user.type(screen.getByLabelText(/Guest Name/i), 'Alice Smith');
    await user.type(screen.getByLabelText(/Room Number/i), '101');
    await user.click(screen.getByRole('button', { name: /Confirm Booking/i }));

    await waitFor(() =>
      expect(screen.getByText(/Booking confirmed successfully/i)).toBeInTheDocument(),
    );
  });

  it('shows a network error when fetch throws', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'));
    const user = userEvent.setup();
    renderModal();
    await user.type(screen.getByLabelText(/Guest Name/i), 'Alice Smith');
    await user.type(screen.getByLabelText(/Room Number/i), '101');
    await user.click(screen.getByRole('button', { name: /Confirm Booking/i }));

    await waitFor(() =>
      expect(screen.getByText(/Could not connect/i)).toBeInTheDocument(),
    );
  });
});
