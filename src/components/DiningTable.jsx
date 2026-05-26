import Philosopher from './Philosopher';
import Fork from './Fork';
import '../styles/table.css';

const TWO_PI = Math.PI * 2;

/**
 * Calculate (x, y) for an item placed on a circle of given radius at angle `angle` (radians).
 */
function circlePos(cx, cy, radius, angle) {
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  };
}

export default function DiningTable({ philosophers, forks, activePhilosopher, activeForks, isDeadlock }) {
  const n = philosophers.length;
  const size = Math.min(520, window.innerWidth - 80);
  const cx = size / 2;
  const cy = size / 2;

  const tableRadius     = size * 0.21;
  const philosopherRadius = size * 0.38;
  const forkRadius      = size * 0.27;

  // Angle for philosopher i — start at top (−π/2)
  const philoAngle = (i) => (TWO_PI * i) / n - Math.PI / 2;
  // Fork i sits between philosopher i and (i+1)
  const forkAngle  = (i) => (TWO_PI * (i + 0.5)) / n - Math.PI / 2;

  return (
    <div className="dining-table-wrapper">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        className={`dining-svg ${isDeadlock ? 'deadlock-flash' : ''}`}
        id="dining-table-svg"
      >
        {/* Outer plate ring */}
        <circle
          cx={cx} cy={cy}
          r={philosopherRadius + 46}
          fill="rgba(224,231,255,0.18)"
          stroke="rgba(99,102,241,0.12)"
          strokeWidth={1.5}
          strokeDasharray="6 4"
        />

        {/* Table surface */}
        <circle
          cx={cx} cy={cy}
          r={tableRadius + 14}
          fill="rgba(255,255,255,0.7)"
          stroke="rgba(99,102,241,0.2)"
          strokeWidth={2}
          className="table-surface"
        />

        {/* Table inner gradient */}
        <defs>
          <radialGradient id="tableGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="rgba(224,231,255,0.7)" />
            <stop offset="100%" stopColor="rgba(199,210,254,0.4)" />
          </radialGradient>
          <radialGradient id="deadlockGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="rgba(254,202,202,0.8)" />
            <stop offset="100%" stopColor="rgba(252,165,165,0.4)" />
          </radialGradient>
        </defs>

        <circle
          cx={cx} cy={cy}
          r={tableRadius}
          fill={isDeadlock ? 'url(#deadlockGrad)' : 'url(#tableGrad)'}
          stroke={isDeadlock ? 'rgba(239,68,68,0.4)' : 'rgba(99,102,241,0.25)'}
          strokeWidth={2.5}
        />

        {/* Table center text */}
        <text x={cx} y={cy - 8} textAnchor="middle" dominantBaseline="central"
          fontSize={20} style={{ userSelect: 'none' }}>
          {isDeadlock ? '☠️' : '🍽️'}
        </text>
        <text x={cx} y={cy + 16} textAnchor="middle" dominantBaseline="central"
          fill={isDeadlock ? '#ef4444' : '#6366f1'}
          fontSize={10}
          fontWeight={700}
          fontFamily="Inter, sans-serif"
          style={{ userSelect: 'none', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {isDeadlock ? 'DEADLOCK' : 'TABLE'}
        </text>

        {/* Connection lines from philosopher to adjacent forks */}
        {philosophers.map((p, i) => {
          const pa = philoAngle(i);
          const pp = circlePos(cx, cy, philosopherRadius, pa);
          const lf = (TWO_PI * (i + 0.5)) / n - Math.PI / 2;
          const rf = (TWO_PI * (i - 0.5 + n)) / n - Math.PI / 2;
          const lfp = circlePos(cx, cy, forkRadius, lf);
          const rfp = circlePos(cx, cy, forkRadius, rf);
          return (
            <g key={`lines-${i}`}>
              <line
                x1={pp.x} y1={pp.y} x2={lfp.x} y2={lfp.y}
                stroke={activeForks.includes(i) ? 'rgba(34,197,94,0.4)' : 'rgba(148,163,184,0.2)'}
                strokeWidth={activeForks.includes(i) ? 2 : 1}
                strokeDasharray="3 3"
                className="fork-line"
              />
              <line
                x1={pp.x} y1={pp.y} x2={rfp.x} y2={rfp.y}
                stroke={activeForks.includes((i - 1 + n) % n) ? 'rgba(34,197,94,0.4)' : 'rgba(148,163,184,0.2)'}
                strokeWidth={activeForks.includes((i - 1 + n) % n) ? 2 : 1}
                strokeDasharray="3 3"
                className="fork-line"
              />
            </g>
          );
        })}

        {/* Forks */}
        {forks.map((fork, i) => {
          const fa = forkAngle(i);
          const fp = circlePos(cx, cy, forkRadius, fa);
          // Rotate fork to point outward (+ 90 to align tines outward)
          const rotDeg = (fa * 180) / Math.PI + 90;
          return (
            <Fork
              key={`fork-${i}`}
              fork={fork}
              x={fp.x}
              y={fp.y}
              angle={rotDeg}
              isActive={activeForks.includes(i)}
            />
          );
        })}

        {/* Philosophers */}
        {philosophers.map((p, i) => {
          const pa = philoAngle(i);
          const pp = circlePos(cx, cy, philosopherRadius, pa);
          return (
            <Philosopher
              key={`philo-${i}`}
              philosopher={p}
              x={pp.x}
              y={pp.y}
              angle={(pa * 180) / Math.PI}
              isActive={activePhilosopher === i}
            />
          );
        })}
      </svg>
    </div>
  );
}
