import { useState, useEffect, useRef } from 'react';
import type { Tile, BookingPayload, BookingResponse, ApiError } from './types';

const API = 'http://localhost:3001';

interface BookingModalProps {
  tile: Tile;
  onClose: () => void;
  onSuccess: (cabanaId: string) => void;
}

export function BookingModal({ tile, onClose, onSuccess }: BookingModalProps) {
  const [guestName, setGuestName]     = useState('');
  const [roomNumber, setRoomNumber]   = useState('');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [succeeded, setSucceeded]     = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  // Focus name input on open
  useEffect(() => { nameRef.current?.focus(); }, []);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!guestName.trim() || !roomNumber.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const payload: BookingPayload = {
        cabanaId: tile.id!,
        guestName: guestName.trim(),
        roomNumber: roomNumber.trim(),
      };

      const res = await fetch(`${API}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as BookingResponse | ApiError;

      if (!res.ok) {
        setError((data as ApiError).error ?? 'Failed to process booking.');
        return;
      }

      setSucceeded(true);
      // Close after short delay so user sees success state
      setTimeout(() => {
        onSuccess(tile.id!);
        onClose();
      }, 1500);
    } catch {
      setError('Could not connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="modal">
        <button className="btn-close" onClick={onClose} aria-label="Close">×</button>

        <div className="modal-header">
          <p className="modal-eyebrow">Cabin Booking</p>
          <h2 className="modal-title" id="modal-title">Confirm Reservation</h2>
          <p className="modal-id">{tile.id}</p>
        </div>

        {succeeded ? (
          <div className="modal-success">
            ✓ Booking confirmed successfully!
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="guestName">Guest Name</label>
              <input
                id="guestName"
                ref={nameRef}
                className="form-input"
                type="text"
                placeholder="e.g. Alice Smith"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                disabled={loading}
                required
                autoComplete="off"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="roomNumber">Room Number</label>
              <input
                id="roomNumber"
                className="form-input"
                type="text"
                placeholder="e.g. 101"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                disabled={loading}
                required
                autoComplete="off"
              />
            </div>

            {error && <div className="modal-error" role="alert">{error}</div>}

            <div className="btn-row">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || !guestName.trim() || !roomNumber.trim()}
              >
                {loading ? 'Confirming…' : 'Confirm Booking'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
