import { FORK_STATE } from '../hooks/useSimulation';
import '../styles/fork.css';

export default function Fork({ fork, x, y, angle, isActive }) {
  const isHeld = fork.state !== FORK_STATE.FREE;

  return (
    <g
      className={`fork-group ${isHeld ? 'held' : 'free'} ${isActive ? 'active' : ''}`}
      transform={`translate(${x}, ${y}) rotate(${angle})`}
      id={`fork-node-${fork.id}`}
    >
      {/* Background pill */}
      <rect
        className={`fork-bg ${isHeld ? 'fork-bg-held' : 'fork-bg-free'}`}
        x={-7}
        y={-18}
        width={14}
        height={36}
        rx={7}
      />

      {/* Fork icon (tines) */}
      {/* Handle */}
      <rect className="fork-handle" x={-2} y={4} width={4} height={12} rx={2} />
      {/* Tines */}
      <rect className="fork-tine" x={-5} y={-16} width={2.5} height={14} rx={1.2} />
      <rect className="fork-tine" x={-1.2} y={-16} width={2.5} height={14} rx={1.2} />
      <rect className="fork-tine" x={2.5} y={-16} width={2.5} height={14} rx={1.2} />

      {/* Fork label */}
      <text
        className={`fork-label ${isHeld ? 'fork-label-held' : ''}`}
        x={0}
        y={28}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={9}
      >
        F{fork.id + 1}
      </text>
    </g>
  );
}
