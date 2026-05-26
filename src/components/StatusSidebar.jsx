import { STATE } from '../hooks/useSimulation';
import '../styles/sidebar.css';

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

export default function StatusSidebar({ philosophers, forks, activePhilosopher }) {
  return (
    <div className="sidebar glass-card">
      <h3 className="sidebar-title">👥 Philosopher States</h3>

      <div className="philosopher-list">
        {philosophers.map((p) => (
          <div
            key={p.id}
            className={`philo-row state-row-${p.state} ${activePhilosopher === p.id ? 'philo-row-active' : ''}`}
            id={`sidebar-philo-${p.id}`}
          >
            <div className="philo-row-left">
              <span className="philo-avatar">{STATE_EMOJI[p.state]}</span>
              <div>
                <div className="philo-name">{p.name}</div>
                <div className="philo-stats text-mono text-xs">
                  Ate: {p.ateCount} · Waited: {p.waitCount}
                </div>
              </div>
            </div>
            <span className={`state-badge ${p.state}`}>
              {STATE_LABEL[p.state]}
            </span>
          </div>
        ))}
      </div>

      {/* Fork status */}
      <div className="fork-status-section">
        <h4 className="fork-status-title">🍴 Fork Status</h4>
        <div className="fork-status-grid">
          {forks.map((f) => (
            <div
              key={f.id}
              className={`fork-status-item ${f.state !== 'free' ? 'fork-taken' : 'fork-free'}`}
              id={`sidebar-fork-${f.id}`}
              title={f.heldBy !== null ? `Held by P${f.heldBy + 1}` : 'Available'}
            >
              <span className="fork-status-icon">🍴</span>
              <span className="fork-status-label text-mono">F{f.id + 1}</span>
              <span className={`fork-dot ${f.state !== 'free' ? 'dot-taken' : 'dot-free'}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
