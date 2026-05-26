import { useEffect, useRef } from 'react';
import '../styles/terminal.css';

const LINE_STYLES = {
  cmd:      'term-line-cmd',
  divider:  'term-line-divider',
  input:    'term-line-input',
  info:     'term-line-info',
  eating:   'term-line-eating',
  waiting:  'term-line-waiting',
  deadlock: 'term-line-deadlock',
  warn:     'term-line-warn',
  blank:    'term-line-blank',
};

export default function CLabTerminal({ terminalLines }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [terminalLines]);

  if (!terminalLines || terminalLines.length === 0) return null;

  return (
    <div className="term-wrapper glass-card" id="c-lab-terminal">
      {/* Terminal title bar */}
      <div className="term-titlebar">
        <div className="term-dots">
          <span className="term-dot term-dot-red" />
          <span className="term-dot term-dot-yellow" />
          <span className="term-dot term-dot-green" />
        </div>
        <span className="term-title">C Lab Terminal — Dining Philosopher</span>
        <span className="term-badge">LIVE</span>
      </div>

      {/* Terminal body */}
      <div className="term-body" ref={scrollRef}>
        <div className="term-lines">
          {terminalLines.map((line, idx) => {
            if (line.type === 'blank') {
              return <div key={idx} className="term-line-blank">&nbsp;</div>;
            }
            return (
              <div key={idx} className={`term-line ${LINE_STYLES[line.type] || 'term-line-info'}`}>
                {line.type === 'cmd' && (
                  <span className="term-prompt">$ </span>
                )}
                <span className="term-text">{line.text}</span>
                {idx === terminalLines.length - 1 && line.type !== 'blank' && (
                  <span className="term-cursor">█</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
