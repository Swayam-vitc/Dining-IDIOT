import '../styles/controls.css';

const SPEEDS = [
  { label: 'Slow',   ms: 2000 },
  { label: 'Normal', ms: 1200 },
  { label: 'Fast',   ms: 600  },
  { label: 'Turbo',  ms: 250  },
];

export default function ControlPanel({ sim }) {
  const { currentStep, steps, isPlaying, speed,
          step, prevStep, togglePlay, goToResult, setSpeed } = sim;

  const isFirst = currentStep === 0;
  const isLast  = currentStep === steps.length - 1;
  const progress = steps.length > 1 ? (currentStep / (steps.length - 1)) * 100 : 0;

  return (
    <div className="control-panel glass-card">
      {/* Step counter */}
      <div className="step-counter">
        <span className="step-label">Step</span>
        <span className="step-nums">
          <span className="step-current text-mono">{currentStep + 1}</span>
          <span className="step-sep">/</span>
          <span className="step-total text-mono">{steps.length}</span>
        </span>
      </div>

      {/* Progress bar */}
      <div className="progress-bar-track" id="simulation-progress">
        <div
          className="progress-bar-fill"
          style={{ width: `${progress}%` }}
        />
        <div
          className="progress-bar-thumb"
          style={{ left: `calc(${progress}% - 8px)` }}
        />
      </div>

      {/* Playback buttons */}
      <div className="playback-buttons">
        <button
          className="btn btn-secondary ctrl-btn"
          id="ctrl-prev"
          onClick={prevStep}
          disabled={isFirst}
          title="Previous step"
        >⏮</button>

        <button
          className={`btn ${isPlaying ? 'btn-danger' : 'btn-primary'} ctrl-btn-play`}
          id="ctrl-play-pause"
          onClick={togglePlay}
          disabled={isLast}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>

        <button
          className="btn btn-secondary ctrl-btn"
          id="ctrl-next"
          onClick={step}
          disabled={isLast}
          title="Next step"
        >⏭</button>
      </div>

      {/* Speed selector */}
      <div className="speed-selector">
        <span className="speed-label">Speed</span>
        <div className="speed-pills">
          {SPEEDS.map(s => (
            <button
              key={s.ms}
              id={`speed-${s.label.toLowerCase()}`}
              className={`speed-pill ${speed === s.ms ? 'active' : ''}`}
              onClick={() => setSpeed(s.ms)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Skip to result */}
      {!isLast && (
        <button
          className="btn btn-secondary skip-btn"
          id="ctrl-skip-result"
          onClick={goToResult}
        >
          ⏩ Skip to Result
        </button>
      )}
    </div>
  );
}
