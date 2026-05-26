import DiningTable  from './DiningTable';
import ControlPanel from './ControlPanel';
import StatusSidebar from './StatusSidebar';
import EventLog      from './EventLog';
import '../styles/simulation.css';

export default function SimulationScreen({ sim }) {
  const { currentState, currentStep, steps, isDeadlockScenario, config } = sim;

  if (!currentState) return null;

  const { philosophers, forks, event, isDeadlock, activePhilosopher, activeForks, isFinal } = currentState;
  const events = steps.map(s => s.event);

  return (
    <div className="sim-wrapper">
      {/* Top: current event banner */}
      <div className={`event-banner glass-card ${isDeadlock ? 'banner-deadlock' : isFinal ? 'banner-success' : 'banner-normal'}`}
           id="current-event-banner">
        <span className="banner-text">{event}</span>
        {isDeadlock && (
          <span className="deadlock-tag">DEADLOCK</span>
        )}
        {isFinal && !isDeadlock && (
          <span className="success-tag">COMPLETE</span>
        )}
      </div>

      {/* Deadlock alert */}
      {isDeadlock && (
        <div className="deadlock-alert" id="deadlock-alert">
          <div className="deadlock-alert-icon">☠️</div>
          <div>
            <strong>Deadlock Detected!</strong>
            <p>Every philosopher is holding one fork and waiting for the other — forming a circular wait. No one can proceed.</p>
          </div>
        </div>
      )}

      {/* Config summary strip */}
      <div className="config-strip glass-card">
        <div className="config-strip-item">
          <span className="strip-label">Philosophers</span>
          <span className="strip-value text-mono">{config.totalPhilosophers}</span>
        </div>
        <div className="config-strip-divider" />
        <div className="config-strip-item">
          <span className="strip-label">Hungry</span>
          <span className="strip-value text-mono" style={{ color: 'var(--color-hungry)' }}>
            {config.hungryIndices.map(i => `P${i+1}`).join(', ')}
          </span>
        </div>
        <div className="config-strip-divider" />
        <div className="config-strip-item">
          <span className="strip-label">Waiter Solution</span>
          <span className={`strip-value ${config.useWaiter ? 'strip-on' : 'strip-off'}`}>
            {config.useWaiter ? '✅ On' : '❌ Off'}
          </span>
        </div>
        <div className="config-strip-divider" />
        <div className="config-strip-item">
          <span className="strip-label">Deadlock</span>
          <span className={`strip-value ${isDeadlockScenario ? 'strip-deadlock' : 'strip-safe'}`}>
            {isDeadlockScenario ? '⚠️ Yes' : '✅ No'}
          </span>
        </div>
      </div>

      {/* Main grid: table + sidebar */}
      <div className="sim-main-grid">
        {/* Left: Table + Controls + Log */}
        <div className="sim-left">
          <div className="table-card glass-card">
            <DiningTable
              philosophers={philosophers}
              forks={forks}
              activePhilosopher={activePhilosopher}
              activeForks={activeForks ?? []}
              isDeadlock={isDeadlock}
            />
          </div>

          <ControlPanel sim={sim} />
          <EventLog events={events} currentStep={currentStep} />
        </div>

        {/* Right: Sidebar */}
        <div className="sim-right">
          <StatusSidebar
            philosophers={philosophers}
            forks={forks}
            activePhilosopher={activePhilosopher}
          />

          {/* Legend */}
          <div className="legend-card glass-card">
            <h4 className="legend-title">🎨 Legend</h4>
            <div className="legend-items">
              {[
                { color: 'var(--color-thinking)', label: 'Thinking',  emoji: '🤔' },
                { color: 'var(--color-hungry)',   label: 'Hungry',    emoji: '😋' },
                { color: 'var(--color-eating)',   label: 'Eating',    emoji: '🍴' },
                { color: 'var(--color-waiting)',  label: 'Waiting',   emoji: '⏳' },
                { color: 'var(--fork-free)',      label: 'Fork Free', emoji: '🔓' },
                { color: 'var(--fork-held)',      label: 'Fork Held', emoji: '🔒' },
              ].map(({ color, label, emoji }) => (
                <div className="legend-item" key={label}>
                  <span className="legend-dot" style={{ background: color }} />
                  <span className="legend-emoji">{emoji}</span>
                  <span className="legend-label">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
