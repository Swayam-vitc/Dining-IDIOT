import '../styles/flowchart.css';

const STATUS_CONFIG = {
  done:    { icon: '✅', className: 'fc-step-done',    dot: 'fc-dot-done'    },
  active:  { icon: '▶',  className: 'fc-step-active',  dot: 'fc-dot-active'  },
  pending: { icon: '○',  className: 'fc-step-pending', dot: 'fc-dot-pending' },
  error:   { icon: '❌', className: 'fc-step-error',   dot: 'fc-dot-error'   },
  skipped: { icon: '—',  className: 'fc-step-skipped', dot: 'fc-dot-skipped' },
};

function InitScreen({ stepDescription }) {
  return (
    <div className="fc-init-box">
      <div className="fc-init-icon">🍽️</div>
      <div className="fc-init-title">Simulation Ready</div>
      <div className="fc-init-desc">{stepDescription}</div>
      <div className="fc-init-legend">
        <span className="fc-legend-chip thinking">🤔 Thinking</span>
        <span className="fc-legend-chip hungry">😋 Hungry</span>
        <span className="fc-legend-chip eating">🍽️ Eating</span>
        <span className="fc-legend-chip waiting">⏳ Waiting</span>
      </div>
    </div>
  );
}

function CompleteScreen({ stepDescription }) {
  return (
    <div className="fc-complete-box">
      <div className="fc-complete-icon">🎉</div>
      <div className="fc-complete-title">All Done!</div>
      <div className="fc-complete-desc">{stepDescription}</div>
    </div>
  );
}

function DeadlockScreen({ stepDescription }) {
  return (
    <div className="fc-deadlock-box">
      <div className="fc-deadlock-icon">☠️</div>
      <div className="fc-deadlock-title">DEADLOCK</div>
      <div className="fc-deadlock-desc">{stepDescription}</div>
      <div className="fc-deadlock-conditions">
        <div className="fc-condition">🔒 Mutual Exclusion</div>
        <div className="fc-condition">✋ Hold & Wait</div>
        <div className="fc-condition">🚫 No Preemption</div>
        <div className="fc-condition">🔄 Circular Wait</div>
      </div>
    </div>
  );
}

export default function FlowchartView({ currentState }) {
  if (!currentState) return null;

  const { stepType, stepDescription, flowchartSteps, activeFlowchartStep } = currentState;

  // Special screens
  if (stepType === 'init') {
    return (
      <div className="fc-wrapper" id="flowchart-panel">
        <div className="fc-header">
          <span className="fc-header-icon">📋</span>
          <span className="fc-header-title">Process Flowchart</span>
        </div>
        <InitScreen stepDescription={stepDescription} />
      </div>
    );
  }

  if (stepType === 'complete') {
    return (
      <div className="fc-wrapper" id="flowchart-panel">
        <div className="fc-header">
          <span className="fc-header-icon">📋</span>
          <span className="fc-header-title">Process Flowchart</span>
        </div>
        <CompleteScreen stepDescription={stepDescription} />
      </div>
    );
  }

  if (stepType === 'deadlock') {
    return (
      <div className="fc-wrapper" id="flowchart-panel">
        <div className="fc-header">
          <span className="fc-header-icon">📋</span>
          <span className="fc-header-title">Process Flowchart</span>
        </div>
        <DeadlockScreen stepDescription={stepDescription} />
      </div>
    );
  }

  if (!flowchartSteps) return null;

  return (
    <div className="fc-wrapper" id="flowchart-panel">
      <div className="fc-header">
        <span className="fc-header-icon">📋</span>
        <span className="fc-header-title">Step-by-Step Process</span>
      </div>

      {/* Step description box */}
      <div className="fc-description-box">
        <span className="fc-desc-icon">💬</span>
        <span className="fc-desc-text">{stepDescription}</span>
      </div>

      {/* Flowchart steps */}
      <div className="fc-steps-list">
        {flowchartSteps.map((fcs, idx) => {
          const cfg = STATUS_CONFIG[fcs.status] || STATUS_CONFIG.pending;
          const isActive = fcs.id === activeFlowchartStep && fcs.status === 'active';

          return (
            <div key={fcs.id} className="fc-step-row">
              {/* Left: dot + connector line */}
              <div className="fc-step-left">
                <div className={`fc-dot ${cfg.dot} ${isActive ? 'fc-dot-pulse' : ''}`}>
                  {fcs.status === 'done'    && '✓'}
                  {fcs.status === 'active'  && '▶'}
                  {fcs.status === 'error'   && '✕'}
                  {fcs.status === 'skipped' && '—'}
                  {fcs.status === 'pending' && ''}
                </div>
                {idx < flowchartSteps.length - 1 && (
                  <div className={`fc-connector ${fcs.status === 'done' ? 'fc-connector-done' : 'fc-connector-pending'}`} />
                )}
              </div>

              {/* Right: content */}
              <div className={`fc-step-content ${cfg.className} ${isActive ? 'fc-step-active-glow' : ''}`}>
                <div className="fc-step-top">
                  <span className="fc-step-icon">{fcs.icon}</span>
                  <span className="fc-step-label">{fcs.label}</span>
                  <span className={`fc-step-badge ${fcs.status}`}>
                    {fcs.status === 'done'    ? 'Done'    :
                     fcs.status === 'active'  ? 'Active'  :
                     fcs.status === 'error'   ? 'Blocked' :
                     fcs.status === 'skipped' ? 'Skip'    : 'Pending'}
                  </span>
                </div>
                {(fcs.status === 'active' || fcs.status === 'error') && (
                  <div className="fc-step-desc">{fcs.description}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
