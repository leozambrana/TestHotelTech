import { useState, useEffect, useCallback, useRef } from 'react';
import type { Tile } from './types';
import { MapTile } from './MapTile';
import { BookingModal } from './BookingModal';
import { GuestListModal } from './GuestListModal';
import cabanaImg from '../assets/cabana.png';

const API = 'http://localhost:3001';

export default function App() {
  const [grid, setGrid]                       = useState<Tile[][]>([]);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState<string | null>(null);
  const [selectedTile, setSelectedTile]       = useState<Tile | null>(null);
  const [showGuests, setShowGuests]           = useState(false);
  const [unavailableMsg, setUnavailableMsg]   = useState<string | null>(null);
  const noticeTimer                           = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Fetch map from backend ─────────────────────────────────────────────────
  const fetchMap = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/api/map`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as Tile[][];
      setGrid(data);
    } catch {
      setError('Failed to load map. Please check if the backend is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMap(); }, [fetchMap]);

  // ── After a successful booking, mark the tile in local state ──────────────
  function handleBookingSuccess(cabanaId: string) {
    setGrid((prev) =>
      prev.map((row) =>
        row.map((tile) =>
          tile.id === cabanaId ? { ...tile, available: false } : tile,
        ),
      ),
    );
  }

  // ── Tile click — routes to booking modal or unavailable notice ─────────────
  function handleTileClick(tile: Tile) {
    if (tile.available) {
      setSelectedTile(tile);
    } else {
      if (noticeTimer.current) clearTimeout(noticeTimer.current);
      setUnavailableMsg(`${tile.id} is already booked.`);
      noticeTimer.current = setTimeout(() => setUnavailableMsg(null), 3000);
    }
  }

  // ── Stats ──────────────────────────────────────────────────────────────────
  const allCabanas   = grid.flat().filter((t) => t.type === 'cabana');
  const totalCabanas = allCabanas.length;
  const available    = allCabanas.filter((t) => t.available).length;
  const booked       = totalCabanas - available;

  return (
    <>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="header">
        <div className="header-brand">
          <img src={cabanaImg} className="header-logo" alt="Resort Paradiso" />
          <div>
            <div className="header-title">Resort Paradise</div>
            <div className="header-subtitle">Luxury Cabin Booking</div>
          </div>
        </div>
        <div className="header-badge">Bookings Open</div>
      </header>

      {/* ── Main ───────────────────────────────────────────────────────────── */}
      <main className="main">

        {/* Legend */}
        <div className="legend" role="complementary" aria-label="Map legend">
          <div className="legend-item">
            <div className="legend-dot cabana-available" />
            <span>Available cabin</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot cabana-booked" />
            <span>Booked cabin</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot pool-dot" />
            <span>Pool</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot path-dot" />
            <span>Path</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot chalet-dot" />
            <span>Chalet</span>
          </div>
        </div>

        {/* Map */}
        {loading && (
          <div className="state-card">
            <div className="spinner" role="status" aria-label="Loading resort map…" />
            <p>Loading resort map…</p>
          </div>
        )}

        {error && (
          <div className="state-card error" role="alert">
            <p>{error}</p>
            <button className="btn btn-secondary" onClick={fetchMap} style={{ flex: 'unset', width: 'auto', marginTop: 8 }}>
              Try again
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className="map-wrapper">
            <p className="map-title">Interactive Resort Map</p>
            <div className="map-grid" role="grid" aria-label="Resort map">
              {grid.map((row, y) => (
                <div className="map-row" key={y} role="row">
                  {row.map((tile) => (
                    <MapTile
                      key={`${tile.x}-${tile.y}`}
                      tile={tile}
                      grid={grid}
                      onClick={handleTileClick}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats strip */}
        {!loading && !error && totalCabanas > 0 && (
          <div className="status-strip" aria-live="polite">
            <div className="status-item">
              Total: <strong>{totalCabanas}</strong> cabins
            </div>
            <div className="status-item">
              Available: <strong style={{ color: 'var(--available)' }}>{available}</strong>
            </div>
            <div className="status-item">
              Booked: <strong style={{ color: 'var(--booked)' }}>{booked}</strong>
            </div>
          </div>
        )}
      </main>

      {/* ── Booking modal ───────────────────────────────────────────────────── */}
      {selectedTile && (
        <BookingModal
          tile={selectedTile}
          onClose={() => setSelectedTile(null)}
          onSuccess={handleBookingSuccess}
        />
      )}

      {/* ── Unavailable cabin toast ───────────────────────────────────────── */}
      {unavailableMsg && (
        <div className="toast" role="status" aria-live="assertive">
          {unavailableMsg}
        </div>
      )}

      {/* ── Guest list modal (dev helper) ──────────────────────────────────── */}
      {showGuests && <GuestListModal onClose={() => setShowGuests(false)} />}

      {/* ── Floating help button ───────────────────────────────────────────── */}
      <button
        id="guest-list-btn"
        className="help-btn"
        onClick={() => setShowGuests(true)}
        aria-label="Open guest list"
      >
        ?
      </button>
    </>
  );
}
