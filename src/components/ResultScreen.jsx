import { STATE } from '../hooks/useSimulation';
import '../styles/result.css';

export default function ResultScreen({ sim }) {
  const { steps, config, isDeadlockScenario, reset } = sim;

  // Tally from final step
  const finalState = steps[steps.length - 1];
  const philosophers = finalState?.philosophers ?? [];
  const totalSteps = steps.length;

  const atePhilos   = philosophers.filter(p => p.ateCount > 0);
  const neverAte    = philosophers.filter(p => p.ateCount === 0 && config.hungryIndices.includes(p.id));
  const thinkingPhilos = philosophers.filter(p => !config.hungryIndices.includes(p.id));

  const totalAte     = philosophers.reduce((s, p) => s + p.ateCount,   0);
  const totalWaited  = philosophers.reduce((s, p) => s + p.waitCount,  0);

  return (
    <div className="result-wrapper">
      {/* Header */}
      <div className={`result-hero ${isDeadlockScenario ? 'result-hero-deadlock' : 'result-hero-success'}`}>
        <div className="result-hero-icon">
          {isDeadlockScenario ? '☠️' : '🎉'}
        </div>
        <h1 className="result-title">
          {isDeadlockScenario ? 'Deadlock Detected!' : 'Simulation Complete!'}
        </h1>
        <p className="result-subtitle">
          {isDeadlockScenario
            ? 'All philosophers were hungry at once — creating an unavoidable circular wait.'
            : `Simulation ran for ${totalSteps} steps. All hungry philosophers were processed.`
          }
        </p>
      </div>

      {/* Stats row */}
      <div className="result-stats">
        <div className="stat-card glass-card">
          <div className="stat-icon">👥</div>
          <div className="stat-value">{config.totalPhilosophers}</div>
          <div className="stat-label">Total Philosophers</div>
        </div>
        <div className="stat-card glass-card">
          <div className="stat-icon">😋</div>
          <div className="stat-value" style={{ color: 'var(--color-hungry)' }}>
            {config.hungryIndices.length}
          </div>
          <div className="stat-label">Were Hungry</div>
        </div>
        <div className="stat-card glass-card">
          <div className="stat-icon">✅</div>
          <div className="stat-value" style={{ color: 'var(--color-eating)' }}>{totalAte}</div>
          <div className="stat-label">Meals Eaten</div>
        </div>
        <div className="stat-card glass-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-value" style={{ color: 'var(--color-waiting)' }}>{totalWaited}</div>
          <div className="stat-label">Total Waits</div>
        </div>
        <div className="stat-card glass-card">
          <div className="stat-icon">📊</div>
          <div className="stat-value" style={{ color: 'var(--accent)' }}>{totalSteps}</div>
          <div className="stat-label">Sim Steps</div>
        </div>
      </div>

      <div className="result-grid">
        {/* Philosopher Summary Table */}
        <div className="result-table-card glass-card">
          <h2 className="result-section-title">📊 Philosopher Summary</h2>
          <table className="philo-table">
            <thead>
              <tr>
                <th>Philosopher</th>
                <th>Role</th>
                <th>Meals Eaten</th>
                <th>Times Waited</th>
                <th>Outcome</th>
              </tr>
            </thead>
            <tbody>
              {philosophers.map(p => {
                const wasHungry = config.hungryIndices.includes(p.id);
                const outcome = isDeadlockScenario
                  ? 'Deadlocked'
                  : wasHungry
                    ? p.ateCount > 0 ? 'Ate ✅' : 'Starved ❌'
                    : 'Thinking 🤔';
                return (
                  <tr key={p.id} className={wasHungry ? 'row-hungry' : 'row-thinking'}>
                    <td className="td-name text-mono">{p.name}</td>
                    <td>
                      <span className={`state-badge ${wasHungry ? 'hungry' : 'thinking'}`}>
                        {wasHungry ? 'Hungry' : 'Thinking'}
                      </span>
                    </td>
                    <td className="td-center text-mono">{p.ateCount}</td>
                    <td className="td-center text-mono">{p.waitCount}</td>
                    <td>
                      <span className={`outcome-badge ${
                        isDeadlockScenario ? 'deadlock'
                        : p.ateCount > 0   ? 'ate'
                        : wasHungry        ? 'starved'
                        :                   'thinking'
                      }`}>
                        {outcome}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Explanation Panel */}
        <div className="explanation-card glass-card">
          <h2 className="result-section-title">📖 What Happened?</h2>

          {isDeadlockScenario ? (
            <div className="explanation-content">
              <div className="explain-block explain-deadlock">
                <h3>☠️ Deadlock</h3>
                <p>
                  Since <strong>all {config.totalPhilosophers} philosophers were hungry</strong>, each
                  philosopher would pick up their left fork simultaneously, then wait for the right
                  fork — which is held by their neighbour. This creates a <strong>circular wait</strong>:
                  a deadlock condition where no philosopher can ever eat.
                </p>
              </div>
              <div className="explain-block explain-conditions">
                <h3>🔒 Four Deadlock Conditions Met</h3>
                <ul>
                  <li><strong>Mutual Exclusion</strong> — only one philosopher can hold a fork at a time</li>
                  <li><strong>Hold & Wait</strong> — each holds left fork while waiting for right</li>
                  <li><strong>No Preemption</strong> — no philosopher can steal a fork</li>
                  <li><strong>Circular Wait</strong> — P1→P2→P3→…→Pn→P1 dependency chain</li>
                </ul>
              </div>
              <div className="explain-block explain-solution">
                <h3>💡 Solution: Waiter Algorithm</h3>
                <p>
                  Allow at most <strong>n−1 philosophers</strong> to try eating simultaneously.
                  This breaks the circular wait and ensures at least one philosopher can always eat.
                  Enable it on the Config screen!
                </p>
              </div>
            </div>
          ) : (
            <div className="explanation-content">
              <div className="explain-block explain-success">
                <h3>✅ Sequential Eating</h3>
                <p>
                  Philosophers ate <strong>one at a time</strong>. Each hungry philosopher
                  picked up both adjacent forks, ate, then released them — allowing the next
                  philosopher to proceed. This prevents deadlock but may cause <strong>starvation</strong>
                  if a philosopher can never acquire both forks.
                </p>
              </div>
              {config.useWaiter && (
                <div className="explain-block explain-waiter">
                  <h3>🎩 Waiter Solution Active</h3>
                  <p>
                    The waiter solution limited simultaneous eaters to
                    <strong> {config.totalPhilosophers - 1}</strong>, ensuring the circular
                    wait condition could never form.
                  </p>
                </div>
              )}
              <div className="explain-block explain-fork">
                <h3>🍴 Fork Protocol</h3>
                <p>
                  Fork numbering: Fork <em>i</em> sits between Philosopher <em>i</em> and
                  Philosopher <em>(i+1) mod n</em>. Each philosopher needs their left fork
                  (Fork <em>i</em>) and right fork (Fork <em>(i−1+n) mod n</em>).
                </p>
              </div>
            </div>
          )}

          {/* Config recap */}
          <div className="config-recap">
            <div className="recap-item">
              <span>Waiter Solution</span>
              <strong>{config.useWaiter ? '✅ Enabled' : '❌ Disabled'}</strong>
            </div>
            <div className="recap-item">
              <span>Deadlock</span>
              <strong className={isDeadlockScenario ? 'text-danger' : 'text-success'}>
                {isDeadlockScenario ? '⚠️ Occurred' : '✅ Avoided'}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="result-cta">
        <button className="btn btn-primary cta-btn" id="result-restart-btn" onClick={reset}>
          ↺ Run Another Simulation
        </button>
      </div>
    </div>
  );
}
