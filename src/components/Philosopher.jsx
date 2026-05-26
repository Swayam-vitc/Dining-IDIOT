import { STATE } from '../hooks/useSimulation';
import '../styles/philosopher.css';

const STATE_EMOJI = {
  [STATE.THINKING]: '🤔',
  [STATE.HUNGRY]:   '😋',
  [STATE.EATING]:   '🍴',
  [STATE.WAITING]:  '⏳',
};

const STATE_LABEL = {
  [STATE.THINKING]: 'Thinking',
  [STATE.HUNGRY]:   'Hungry',
  [STATE.EATING]:   'Eating',
  [STATE.WAITING]:  'Waiting',
};

export default function Philosopher({ philosopher, x, y, isActive, angle }) {
  const { state, name, id } = philosopher;

  return (
    <g
      className={`philosopher-group state-${state} ${isActive ? 'active' : ''}`}
      transform={`translate(${x}, ${y})`}
      id={`philosopher-node-${id}`}
    >
      {/* Glow ring behind circle */}
      <circle
        className={`philosopher-glow glow-${state}`}
        cx={0}
        cy={0}
        r={36}
      />

      {/* Main circle */}
      <circle
        className={`philosopher-circle circle-${state}`}
        cx={0}
        cy={0}
        r={28}
      />

      {/* Emoji */}
      <text
        className="philosopher-emoji"
        x={0}
        y={0}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={22}
      >
        {STATE_EMOJI[state]}
      </text>

      {/* Name label */}
      <text
        className="philosopher-name"
        x={0}
        y={44}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
      >
        {name}
      </text>

      {/* State label */}
      <text
        className={`philosopher-state-label label-${state}`}
        x={0}
        y={58}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={10}
      >
        {STATE_LABEL[state]}
      </text>
    </g>
  );
}
