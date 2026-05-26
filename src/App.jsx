import { useEffect } from 'react';
import { useSimulation } from './hooks/useSimulation';
import ConfigScreen    from './components/ConfigScreen';
import SimulationScreen from './components/SimulationScreen';
import ResultScreen    from './components/ResultScreen';

export default function App() {
  const sim = useSimulation();

  // Auto-play interval
  useEffect(() => {
    if (sim.isPlaying) {
      sim.timerRef.current = setInterval(() => {
        sim.setCurrentStep(prev => {
          if (prev >= sim.steps.length - 1) {
            sim.setIsPlaying(false);
            sim.setPhase('result');
            clearInterval(sim.timerRef.current);
            return prev;
          }
          return prev + 1;
        });
      }, sim.speed);
    } else {
      clearInterval(sim.timerRef.current);
    }
    return () => clearInterval(sim.timerRef.current);
  }, [sim.isPlaying, sim.speed, sim.steps.length]);

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="logo">
          <span className="logo-icon">🍽️</span>
          <div>
            <div>Dining Philosophers</div>
            <div className="header-subtitle">OS Synchronization Visualizer</div>
          </div>
        </div>
        {sim.phase !== 'config' && (
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-secondary" id="header-reset-btn" onClick={sim.reset}>
              ↺ Restart
            </button>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="screen-content">
        {sim.phase === 'config' && (
          <ConfigScreen onStart={sim.startSimulation} />
        )}
        {sim.phase === 'simulation' && (
          <SimulationScreen sim={sim} />
        )}
        {sim.phase === 'result' && (
          <ResultScreen sim={sim} />
        )}
      </main>
    </div>
  );
}
