import type { Tile } from './types';

// ─── Asset imports ─────────────────────────────────────────────────────────────
import cabanaImg   from '../assets/cabana.png';
import poolImg     from '../assets/pool.png';
import chaletImg   from '../assets/houseChimney.png';
import straightImg from '../assets/arrowStraight.png';
import cornerImg   from '../assets/arrowCornerSquare.png';
import crossingImg from '../assets/arrowCrossing.png';
import splitImg    from '../assets/arrowSplit.png';
import endImg      from '../assets/arrowEnd.png';

// ─── Path image logic ──────────────────────────────────────────────────────────

/**
 * Given a tile's position and the full grid, inspect the 4 cardinal neighbors
 * to select the correct path arrow image and CSS rotation angle.
 *
 * Assumed default orientations (before rotation):
 *   arrowStraight    → vertical  (connects up ↔ down)
 *   arrowCornerSquare → top-right corner (connects up ↔ right)
 *   arrowCrossing    → 4-way (+), any rotation looks the same
 *   arrowSplit       → T-junction missing the bottom (connects up, left, right)
 *   arrowEnd         → dead-end pointing up (opens downward)
 */
function getPathConfig(grid: Tile[][], x: number, y: number): { src: string; rotation: number } {
  // A path "connects" to any non-empty neighbor — paths, chalets, cabanas, pools, etc.
  const isConnected = (nx: number, ny: number) => {
    const neighbor = grid[ny]?.[nx];
    return neighbor !== undefined && neighbor.type !== 'empty';
  };

  const up    = isConnected(x, y - 1);
  const down  = isConnected(x, y + 1);
  const left  = isConnected(x - 1, y);
  const right = isConnected(x + 1, y);
  const count = [up, down, left, right].filter(Boolean).length;

  // 4-way crossing
  if (count === 4) return { src: crossingImg, rotation: 0 };

  // T-junction — rotate to hide the missing direction
  if (count === 3) {
    if (!down)  return { src: splitImg, rotation: 270   }; // up + left + right
    if (!left)  return { src: splitImg, rotation: 0  }; // up + right + down
    if (!up)    return { src: splitImg, rotation: 90 }; // left + right + down
    if (!right) return { src: splitImg, rotation: 180 }; // up + left + down
  }

  // Straight
  if (up && down)    return { src: straightImg, rotation: 0  }; // vertical
  if (left && right) return { src: straightImg, rotation: 90 }; // horizontal

  // Corner — rotate so the two open arms align
  if (up    && right) return { src: cornerImg, rotation: 0   };
  if (right && down)  return { src: cornerImg, rotation: 90  };
  if (down  && left)  return { src: cornerImg, rotation: 180 };
  if (left  && up)    return { src: cornerImg, rotation: 270 };

  // Dead-end (1 neighbor) or isolated (0)
  if (up)    return { src: endImg, rotation: 0   }; // opens toward top
  if (right) return { src: endImg, rotation: 90  };
  if (down)  return { src: endImg, rotation: 180 };
  if (left)  return { src: endImg, rotation: 270 };

  // Isolated path tile — fallback to straight
  return { src: straightImg, rotation: 0 };
}

// ─── Component ─────────────────────────────────────────────────────────────────

interface TileProps {
  tile: Tile;
  grid: Tile[][];
  onClick: (tile: Tile) => void;
}

export function MapTile({ tile, grid, onClick }: TileProps) {
  const { type, available, x, y } = tile;

  const classNames = [
    'tile',
    type,
    type === 'cabana' ? (available ? 'available' : 'booked') : '',
  ]
    .filter(Boolean)
    .join(' ');

  // Resolve image + rotation for path tiles dynamically
  let imgSrc: string | undefined;
  let imgRotation = 0;

  if (type === 'path') {
    const config = getPathConfig(grid, x, y);
    imgSrc       = config.src;
    imgRotation  = config.rotation;
  } else if (type === 'cabana') {
    imgSrc = cabanaImg;
  } else if (type === 'pool') {
    imgSrc = poolImg;
  } else if (type === 'chalet') {
    imgSrc = chaletImg;
  }

  // Accessible label
  const label =
    type === 'cabana'
      ? available
        ? `Cabin ${tile.id} — available. Click to book.`
        : `Cabin ${tile.id} — already booked.`
      : type;

  function handleClick() {
    if (type === 'cabana' && available) onClick(tile);
  }

  return (
    <div
      className={classNames}
      onClick={handleClick}
      role={type === 'cabana' && available ? 'button' : undefined}
      tabIndex={type === 'cabana' && available ? 0 : undefined}
      aria-label={label}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}
      title={label}
    >
      {imgSrc && (
        <img
          src={imgSrc}
          alt=""
          draggable={false}
          style={imgRotation ? { transform: `rotate(${imgRotation}deg)` } : undefined}
        />
      )}
    </div>
  );
}
