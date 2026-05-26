import { useEffect, useRef } from 'react';
import '../styles/eventlog.css';

export default function EventLog({ events, currentStep }) {
  const logRef = useRef(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [currentStep]);

  return (
    <div className="event-log glass-card">
      <h3 className="log-title">📋 Event Log</h3>
      <div className="log-entries" ref={logRef}>
        {events.slice(0, currentStep + 1).map((event, i) => (
          <div
            key={i}
            className={`log-entry ${i === currentStep ? 'log-entry-current' : 'log-entry-past'}`}
            id={`log-entry-${i}`}
          >
            <span className="log-step text-mono">#{String(i + 1).padStart(2, '0')}</span>
            <span className="log-text">{event}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
