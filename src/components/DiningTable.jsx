import Philosopher from './Philosopher';
import Fork from './Fork';
import { STEP_TYPE } from '../hooks/useSimulation';
import '../styles/table.css';

const TWO_PI = Math.PI * 2;

function circlePos(cx, cy, radius, angle) {
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  };
}

/**
 * Annotation label floating near a fork during active steps.
 */
function ForkAnnotation({ x, y, label, color, angle }) {
  // Offset label outward from center
  const offsetX = Math.cos(angle) * 28;
  const offsetY = Math.sin(angle) * 28;
  return (
    <g transform={`translate(${x + offsetX}, ${y + offsetY})`} className="fork-annotation">
      <rect
        x={-30} y={-11}
        width={60} height={22}
        rx={11}
        fill={color}
        opacity={0.92}
      />
      <text
        x={0} y={0}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={9}
        fontWeight={800}
        fontFamily="Inter, sans-serif"
        fill="#fff"
        style={{ userSelect: 'none' }}
      >
        {label}
      </text>
    </g>
  );
}

/**
 * Step indicator badge near the active philosopher.
 */
function StepBadge({ x, y, stepType }) {
  if (!stepType) return null;

  const configs = {
    [STEP_TYPE.PICK_LEFT]:  { text: '① Left Fork',  color: '#6366f1', bg: 'rgba(99,102,241,0.9)' },
    [STEP_TYPE.PICK_RIGHT]: { text: '② Right Fork', color: '#8b5cf6', bg: 'rgba(139,92,246,0.9)' },
    [STEP_TYPE.EATING]:     { text: '③ EATING',     color: '#22c55e', bg: 'rgba(22,163,74,0.9)'  },
    [STEP_TYPE.RELEASE]:    { text: '④ Released',   color: '#64748b', bg: 'rgba(71,85,105,0.85)' },
    [STEP_TYPE.WAITING]:    { text: '⏳ WAITING',   color: '#f59e0b', bg: 'rgba(217,119,6,0.9)'  },
  };

  const cfg = configs[stepType];
  if (!cfg) return null;

  return (
    <g transform={`translate(${x}, ${y - 52})`} className="step-badge-group">
      <rect
        x={-40} y={-13}
        width={80} height={26}
        rx={13}
        fill={cfg.bg}
        filter="url(#stepBadgeShadow)"
      />
      <text
        x={0} y={0}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={10}
        fontWeight={900}
        fontFamily="Inter, sans-serif"
        fill="#fff"
        style={{ userSelect: 'none' }}
      >
        {cfg.text}
      </text>
    </g>
  );
}

/**
 * Resource legend labels on the outer ring.
 */
function ResourceLabels({ cx, cy, n, forks, philosopherRadius }) {
  const outerR = philosopherRadius + 60;
  return (
    <>
      {forks.map((fork, i) => {
        const angle = (TWO_PI * (i + 0.5)) / n - Math.PI / 2;
        const pos = circlePos(cx, cy, outerR, angle);
        const isHeld = fork.state !== 'free';
        return (
          <text
            key={`res-label-${i}`}
            x={pos.x}
            y={pos.y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={8.5}
            fontWeight={700}
            fontFamily="Inter, sans-serif"
            fill={isHeld ? '#f97316' : '#94a3b8'}
            opacity={0.85}
            style={{ userSelect: 'none' }}
          >
            {`R${fork.id + 1}`}
          </text>
        );
      })}
    </>
  );
}

export default function DiningTable({ philosophers, forks, activePhilosopher, activeForks, isDeadlock, stepType }) {
  const n = philosophers.length;
  const size = Math.min(520, window.innerWidth - 80);
  const cx = size / 2;
  const cy = size / 2;

  const tableRadius       = size * 0.21;
  const philosopherRadius = size * 0.38;
  const forkRadius        = size * 0.27;

  const philoAngle = (i) => (TWO_PI * i) / n - Math.PI / 2;
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
        <defs>
          <radialGradient id="tableGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="rgba(224,231,255,0.7)" />
            <stop offset="100%" stopColor="rgba(199,210,254,0.4)" />
          </radialGradient>
          <radialGradient id="deadlockGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="rgba(254,202,202,0.8)" />
            <stop offset="100%" stopColor="rgba(252,165,165,0.4)" />
          </radialGradient>
          <filter id="stepBadgeShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Outer plate ring */}
        <circle
          cx={cx} cy={cy}
          r={philosopherRadius + 46}
          fill="rgba(224,231,255,0.18)"
          stroke="rgba(99,102,241,0.12)"
          strokeWidth={1.5}
          strokeDasharray="6 4"
        />

        {/* Resource ring label */}
        <text
          x={cx} y={cy - philosopherRadius - 58}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={9}
          fontWeight={700}
          fontFamily="Inter, sans-serif"
          fill="#94a3b8"
          style={{ userSelect: 'none' }}
        >
          RESOURCES (Forks = Shared Mutex)
        </text>

        {/* Resource labels (R1, R2, ...) */}
        <ResourceLabels
          cx={cx} cy={cy}
          n={n}
          forks={forks}
          philosopherRadius={philosopherRadius}
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

        {/* Table inner */}
        <circle
          cx={cx} cy={cy}
          r={tableRadius}
          fill={isDeadlock ? 'url(#deadlockGrad)' : 'url(#tableGrad)'}
          stroke={isDeadlock ? 'rgba(239,68,68,0.4)' : 'rgba(99,102,241,0.25)'}
          strokeWidth={2.5}
        />

        {/* Table center */}
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

        {/* Connection lines */}
        {philosophers.map((p, i) => {
          const pa = philoAngle(i);
          const pp = circlePos(cx, cy, philosopherRadius, pa);
          const lf = (TWO_PI * (i + 0.5)) / n - Math.PI / 2;
          const rf = (TWO_PI * (i - 0.5 + n)) / n - Math.PI / 2;
          const lfp = circlePos(cx, cy, forkRadius, lf);
          const rfp = circlePos(cx, cy, forkRadius, rf);
          const isActivePhilo = activePhilosopher === i;
          return (
            <g key={`lines-${i}`}>
              <line
                x1={pp.x} y1={pp.y} x2={lfp.x} y2={lfp.y}
                stroke={activeForks.includes(i) ? 'rgba(34,197,94,0.55)' : isActivePhilo ? 'rgba(99,102,241,0.2)' : 'rgba(148,163,184,0.15)'}
                strokeWidth={activeForks.includes(i) ? 2.5 : 1}
                strokeDasharray={activeForks.includes(i) ? 'none' : '3 3'}
                className="fork-line"
              />
              <line
                x1={pp.x} y1={pp.y} x2={rfp.x} y2={rfp.y}
                stroke={activeForks.includes((i - 1 + n) % n) ? 'rgba(34,197,94,0.55)' : isActivePhilo ? 'rgba(99,102,241,0.2)' : 'rgba(148,163,184,0.15)'}
                strokeWidth={activeForks.includes((i - 1 + n) % n) ? 2.5 : 1}
                strokeDasharray={activeForks.includes((i - 1 + n) % n) ? 'none' : '3 3'}
                className="fork-line"
              />
            </g>
          );
        })}

        {/* Forks */}
        {forks.map((fork, i) => {
          const fa = forkAngle(i);
          const fp = circlePos(cx, cy, forkRadius, fa);
          const rotDeg = (fa * 180) / Math.PI + 90;

          // Fork annotation when active
          const isActiveFork = activeForks.includes(i);
          const annotColor = fork.state !== 'free' ? '#f97316' : '#22c55e';
          const annotLabel = fork.state !== 'free' ? `🔒 Held` : `🔓 Free`;

          return (
            <g key={`fork-g-${i}`}>
              <Fork
                fork={fork}
                x={fp.x}
                y={fp.y}
                angle={rotDeg}
                isActive={isActiveFork}
              />
              {isActiveFork && (
                <ForkAnnotation
                  x={fp.x}
                  y={fp.y}
                  label={annotLabel}
                  color={annotColor}
                  angle={fa}
                />
              )}
            </g>
          );
        })}

        {/* Philosophers */}
        {philosophers.map((p, i) => {
          const pa = philoAngle(i);
          const pp = circlePos(cx, cy, philosopherRadius, pa);
          const isActive = activePhilosopher === i;
          return (
            <g key={`philo-g-${i}`}>
              <Philosopher
                philosopher={p}
                x={pp.x}
                y={pp.y}
                angle={(pa * 180) / Math.PI}
                isActive={isActive}
              />
              {isActive && (
                <StepBadge
                  x={pp.x}
                  y={pp.y}
                  stepType={stepType}
                />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
