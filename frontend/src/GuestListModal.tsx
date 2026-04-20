import { useState, useEffect } from 'react';

const API = 'http://localhost:3001';

interface Guest {
  room: string;
  guestName: string;
}

interface GuestListModalProps {
  onClose: () => void;
}

export function GuestListModal({ onClose }: GuestListModalProps) {
  const [guests, setGuests]   = useState<Guest[]>([]);
  const [search, setSearch]   = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Fetch guest list
  useEffect(() => {
    fetch(`${API}/api/guests`)
      .then((r) => r.json())
      .then((data) => setGuests(data as Guest[]))
      .catch(() => setError('Could not load guest list.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = guests.filter(
    (g) =>
      g.guestName.toLowerCase().includes(search.toLowerCase()) ||
      g.room.includes(search),
  );

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="guest-list-title"
    >
      <div className="modal guest-list-modal">
        <button className="btn-close" onClick={onClose} aria-label="Close">×</button>

        <div className="modal-header">
          <p className="modal-eyebrow">Dev Reference</p>
          <h2 className="modal-title" id="guest-list-title">Registered Guests</h2>
          <p className="modal-id">{guests.length} guests loaded from bookings.json</p>
        </div>

        {/* Search */}
        <div className="guest-search-wrap">
          <input
            className="form-input"
            type="search"
            placeholder="Search by name or room…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
            aria-label="Search guests"
          />
        </div>

        {/* List */}
        <div className="guest-list-body">
          {loading && <p className="guest-list-empty">Loading…</p>}
          {error   && <p className="guest-list-empty guest-list-error">{error}</p>}
          {!loading && !error && filtered.length === 0 && (
            <p className="guest-list-empty">No guests match "{search}"</p>
          )}
          {!loading && !error && filtered.map((g) => (
            <div className="guest-row" key={`${g.room}-${g.guestName}`}>
              <span className="guest-room">Room {g.room}</span>
              <span className="guest-name">{g.guestName}</span>
            </div>
          ))}
        </div>

        <div className="btn-row" style={{ marginTop: 16 }}>
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
