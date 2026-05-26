import { useState } from 'react';
import '../styles/config.css';

const MAX_PHILOSOPHERS = 10;
const MIN_PHILOSOPHERS = 2;

export default function ConfigScreen({ onStart }) {
  const [total, setTotal] = useState(5);
  const [hungry, setHungry] = useState(new Set([1, 3]));
  const [useWaiter, setUseWaiter] = useState(false);
  const [error, setError] = useState('');

  const toggleHungry = (idx) => {
    setHungry(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
    setError('');
  };

  const handleTotalChange = (val) => {
    const n = Math.max(MIN_PHILOSOPHERS, Math.min(MAX_PHILOSOPHERS, Number(val)));
    setTotal(n);
    // Remove hungry selections that are out of range
    setHungry(prev => new Set([...prev].filter(i => i < n)));
    setError('');
  };

  const handleStart = () => {
    if (hungry.size === 0) {
      setError('Please select at least one hungry philosopher.');
      return;
    }
    setError('');
    const hungryIndices = [...hungry].sort((a, b) => a - b);
    onStart(total, hungryIndices, useWaiter);
  };

  const isDeadlockWarning = hungry.size === total;

  const stateColors = ['var(--color-thinking)', 'var(--color-hungry)'];

  return (
    <div className="config-wrapper">
      {/* Hero */}
      <div className="config-hero">
        <div className="hero-icon">🍽️</div>
        <h1 className="hero-title">Dining Philosophers Problem</h1>
        <p className="hero-subtitle">
          A classic operating systems problem illustrating the challenges of
          <strong> resource allocation</strong> and <strong>deadlock prevention</strong> in concurrent systems.
        </p>
      </div>

      {/* Info Cards */}
      <div className="info-cards">
        <div className="info-card glass-card">
          <span className="info-icon">🤔</span>
          <h3>Thinking</h3>
          <p>Philosopher is not hungry and not using any forks.</p>
        </div>
        <div className="info-card glass-card">
          <span className="info-icon">😋</span>
          <h3>Hungry</h3>
          <p>Philosopher wants to eat and is trying to pick up forks.</p>
        </div>
        <div className="info-card glass-card">
          <span className="info-icon">🍴</span>
          <h3>Eating</h3>
          <p>Philosopher holds both adjacent forks and is eating.</p>
        </div>
        <div className="info-card glass-card">
          <span className="info-icon">⏳</span>
          <h3>Waiting</h3>
          <p>Philosopher is hungry but forks are unavailable.</p>
        </div>
      </div>

      {/* Config Form */}
      <div className="config-form glass-card">
        <h2 className="config-form-title">⚙️ Configure Simulation</h2>

        {/* Total Philosophers */}
        <div className="form-group">
          <label className="form-label">
            Number of Philosophers
            <span className="form-hint">({MIN_PHILOSOPHERS}–{MAX_PHILOSOPHERS})</span>
          </label>
          <div className="number-input-row">
            <button
              className="btn btn-secondary num-btn"
              id="decrease-philosophers"
              onClick={() => handleTotalChange(total - 1)}
              disabled={total <= MIN_PHILOSOPHERS}
            >−</button>
            <div className="num-display">{total}</div>
            <button
              className="btn btn-secondary num-btn"
              id="increase-philosophers"
              onClick={() => handleTotalChange(total + 1)}
              disabled={total >= MAX_PHILOSOPHERS}
            >+</button>
          </div>
          {/* Philosopher strip preview */}
          <div className="philosopher-strip">
            {Array.from({ length: total }, (_, i) => (
              <div
                key={i}
                className={`strip-philosopher ${hungry.has(i) ? 'hungry' : 'thinking'}`}
                title={`P${i+1}: ${hungry.has(i) ? 'Hungry' : 'Thinking'}`}
              >
                P{i+1}
              </div>
            ))}
          </div>
        </div>

        {/* Hungry Philosophers */}
        <div className="form-group">
          <label className="form-label">
            Select Hungry Philosophers
            <span className="form-hint">({hungry.size} selected)</span>
          </label>
          <div className="checkbox-grid">
            {Array.from({ length: total }, (_, i) => (
              <label
                key={i}
                className={`checkbox-item ${hungry.has(i) ? 'checked' : ''}`}
                id={`hungry-toggle-${i}`}
              >
                <input
                  type="checkbox"
                  checked={hungry.has(i)}
                  onChange={() => toggleHungry(i)}
                  style={{ display: 'none' }}
                />
                <span className="checkbox-emoji">{hungry.has(i) ? '😋' : '🤔'}</span>
                <span className="checkbox-label">P{i+1}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Waiter Solution Toggle */}
        <div className="form-group">
          <label className="form-label toggle-row">
            <div>
              <span>Enable Waiter Solution (Deadlock Prevention)</span>
              <p className="form-hint-block">
                Allows at most <strong>n−1</strong> philosophers to try eating simultaneously, breaking the circular wait condition.
              </p>
            </div>
            <div
              className={`toggle-switch ${useWaiter ? 'on' : ''}`}
              id="waiter-toggle"
              onClick={() => setUseWaiter(w => !w)}
              role="switch"
              aria-checked={useWaiter}
            >
              <div className="toggle-thumb" />
            </div>
          </label>
        </div>

        {/* Deadlock Warning */}
        {isDeadlockWarning && (
          <div className="deadlock-warning">
            <span>⚠️</span>
            <div>
              <strong>All philosophers are hungry!</strong>
              <p>This will cause an immediate <strong>deadlock</strong>. No philosopher can eat because each is waiting for a fork held by a neighbour.</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="form-error">⚠️ {error}</div>
        )}

        {/* Start Button */}
        <button
          className="btn btn-primary start-btn"
          id="start-simulation-btn"
          onClick={handleStart}
        >
          {isDeadlockWarning ? '⚠️ Show Deadlock' : '▶ Start Simulation'}
        </button>
      </div>
    </div>
  );
}
