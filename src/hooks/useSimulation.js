import { useState, useCallback, useRef } from 'react';

// Philosopher states
export const STATE = {
  THINKING: 'thinking',
  HUNGRY:   'hungry',
  EATING:   'eating',
  WAITING:  'waiting',
};

// Fork states
export const FORK_STATE = {
  FREE:    'free',
  HELD_L:  'held_left',
  HELD_R:  'held_right',
};

/**
 * Build the initial simulation state from user config.
 */
function buildInitialState(totalPhilosophers, hungrySet) {
  const philosophers = Array.from({ length: totalPhilosophers }, (_, i) => ({
    id: i,
    name: `P${i + 1}`,
    state: hungrySet.has(i) ? STATE.HUNGRY : STATE.THINKING,
    ateCount: 0,
    waitCount: 0,
  }));

  const forks = Array.from({ length: totalPhilosophers }, (_, i) => ({
    id: i,
    state: FORK_STATE.FREE,
    heldBy: null, // philosopher id
  }));

  return { philosophers, forks };
}

/**
 * Generate the full simulation steps array.
 * Each step = snapshot of philosopher + fork states + event log message.
 */
function generateSteps(totalPhilosophers, hungryIndices, useWaiterSolution) {
  const steps = [];
  const events = [];

  // ---- Deadlock check ----
  if (hungryIndices.length === totalPhilosophers) {
    // Immediate deadlock
    const { philosophers, forks } = buildInitialState(totalPhilosophers, new Set(hungryIndices));
    const deadlockPhilos = philosophers.map(p => ({ ...p, state: STATE.WAITING }));
    steps.push({
      philosophers: deadlockPhilos,
      forks,
      event: '⚠️ All philosophers are HUNGRY — Deadlock detected! No philosopher can proceed.',
      isDeadlock: true,
      activePhilosopher: null,
      activeForks: [],
    });
    return { steps, isDeadlockScenario: true };
  }

  // ---- Normal simulation ----
  const hungrySet = new Set(hungryIndices);
  let { philosophers, forks } = buildInitialState(totalPhilosophers, hungrySet);

  // Clone helper
  const clonePhilos = (arr) => arr.map(p => ({ ...p }));
  const cloneForks  = (arr) => arr.map(f => ({ ...f }));

  // Initial state snapshot
  steps.push({
    philosophers: clonePhilos(philosophers),
    forks: cloneForks(forks),
    event: `🍽️ Simulation started. ${hungryIndices.length} philosopher(s) are hungry: ${hungryIndices.map(i => `P${i+1}`).join(', ')}`,
    isDeadlock: false,
    activePhilosopher: null,
    activeForks: [],
  });

  // Waiter solution: allow at most n-1 hungry philosophers to "try" eating
  const allowedToTry = useWaiterSolution
    ? hungryIndices.slice(0, totalPhilosophers - 1)
    : hungryIndices;

  // Process each hungry philosopher one at a time (sequential, one eats at a time)
  for (let turn = 0; turn < hungryIndices.length; turn++) {
    const philoIdx = hungryIndices[turn];
    const leftFork  = philoIdx;
    const rightFork = (philoIdx - 1 + totalPhilosophers) % totalPhilosophers;

    const isBlocked = useWaiterSolution && !allowedToTry.includes(philoIdx);

    const leftFree  = forks[leftFork].state  === FORK_STATE.FREE;
    const rightFree = forks[rightFork].state === FORK_STATE.FREE;

    if (!isBlocked && leftFree && rightFree) {
      // --- Pick up left fork ---
      philosophers = clonePhilos(philosophers);
      forks = cloneForks(forks);
      forks[leftFork].state  = FORK_STATE.HELD_L;
      forks[leftFork].heldBy = philoIdx;
      philosophers[philoIdx].state = STATE.HUNGRY;

      steps.push({
        philosophers: clonePhilos(philosophers),
        forks: cloneForks(forks),
        event: `🍴 P${philoIdx+1} picks up LEFT fork (Fork ${leftFork+1})`,
        isDeadlock: false,
        activePhilosopher: philoIdx,
        activeForks: [leftFork],
      });

      // --- Pick up right fork ---
      philosophers = clonePhilos(philosophers);
      forks = cloneForks(forks);
      forks[rightFork].state  = FORK_STATE.HELD_R;
      forks[rightFork].heldBy = philoIdx;

      steps.push({
        philosophers: clonePhilos(philosophers),
        forks: cloneForks(forks),
        event: `🍴 P${philoIdx+1} picks up RIGHT fork (Fork ${rightFork+1})`,
        isDeadlock: false,
        activePhilosopher: philoIdx,
        activeForks: [leftFork, rightFork],
      });

      // --- Eating ---
      philosophers = clonePhilos(philosophers);
      philosophers[philoIdx].state = STATE.EATING;
      philosophers[philoIdx].ateCount += 1;

      // Others still hungry → show as waiting
      for (let j = turn + 1; j < hungryIndices.length; j++) {
        const waitIdx = hungryIndices[j];
        philosophers[waitIdx].state = STATE.WAITING;
        philosophers[waitIdx].waitCount += 1;
      }

      steps.push({
        philosophers: clonePhilos(philosophers),
        forks: cloneForks(forks),
        event: `✅ P${philoIdx+1} is now EATING! Others wait their turn.`,
        isDeadlock: false,
        activePhilosopher: philoIdx,
        activeForks: [leftFork, rightFork],
      });

      // --- Release forks ---
      philosophers = clonePhilos(philosophers);
      forks = cloneForks(forks);
      forks[leftFork].state  = FORK_STATE.FREE;
      forks[leftFork].heldBy = null;
      forks[rightFork].state = FORK_STATE.FREE;
      forks[rightFork].heldBy = null;
      philosophers[philoIdx].state = STATE.THINKING;

      steps.push({
        philosophers: clonePhilos(philosophers),
        forks: cloneForks(forks),
        event: `🔓 P${philoIdx+1} finished eating and released both forks. Now THINKING.`,
        isDeadlock: false,
        activePhilosopher: philoIdx,
        activeForks: [],
      });

    } else {
      // --- Can't eat — waiting ---
      philosophers = clonePhilos(philosophers);
      philosophers[philoIdx].state = STATE.WAITING;
      philosophers[philoIdx].waitCount += 1;

      const reason = isBlocked
        ? `Waiter solution: only ${totalPhilosophers - 1} philosophers allowed at once`
        : `Forks unavailable (Left: ${leftFree ? 'free' : 'taken'}, Right: ${rightFree ? 'free' : 'taken'})`;

      steps.push({
        philosophers: clonePhilos(philosophers),
        forks: cloneForks(forks),
        event: `⏳ P${philoIdx+1} is WAITING — ${reason}`,
        isDeadlock: false,
        activePhilosopher: philoIdx,
        activeForks: [],
      });
    }
  }

  // --- Final summary step ---
  steps.push({
    philosophers: clonePhilos(philosophers),
    forks: cloneForks(forks),
    event: `🏁 Simulation complete! All hungry philosophers have been processed.`,
    isDeadlock: false,
    activePhilosopher: null,
    activeForks: [],
    isFinal: true,
  });

  return { steps, isDeadlockScenario: false };
}

/**
 * useSimulation — core simulation hook
 */
export function useSimulation() {
  const [config, setConfig] = useState(null); // { totalPhilosophers, hungryIndices, useWaiter }
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1200); // ms per step
  const [isDeadlockScenario, setIsDeadlockScenario] = useState(false);
  const [phase, setPhase] = useState('config'); // 'config' | 'simulation' | 'result'
  const timerRef = useRef(null);

  const startSimulation = useCallback((totalPhilosophers, hungryIndices, useWaiter) => {
    clearInterval(timerRef.current);
    const { steps: newSteps, isDeadlockScenario: deadlock } = generateSteps(
      totalPhilosophers, hungryIndices, useWaiter
    );
    setConfig({ totalPhilosophers, hungryIndices, useWaiter });
    setSteps(newSteps);
    setCurrentStep(0);
    setIsPlaying(false);
    setIsDeadlockScenario(deadlock);
    setPhase('simulation');
  }, []);

  const step = useCallback(() => {
    setCurrentStep(prev => {
      if (prev < steps.length - 1) return prev + 1;
      setIsPlaying(false);
      setPhase('result');
      return prev;
    });
  }, [steps.length]);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(0, prev - 1));
    setIsPlaying(false);
    clearInterval(timerRef.current);
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  // Auto-play effect handled externally via the component using useEffect
  const reset = useCallback(() => {
    clearInterval(timerRef.current);
    setCurrentStep(0);
    setIsPlaying(false);
    setPhase('config');
    setConfig(null);
    setSteps([]);
  }, []);

  const goToResult = useCallback(() => {
    clearInterval(timerRef.current);
    setIsPlaying(false);
    setCurrentStep(steps.length - 1);
    setPhase('result');
  }, [steps.length]);

  const currentState = steps[currentStep] || null;

  return {
    phase, config, steps, currentStep, currentState,
    isPlaying, speed, isDeadlockScenario, timerRef,
    startSimulation, step, prevStep, togglePlay, reset, goToResult,
    setSpeed, setIsPlaying, setCurrentStep, setPhase,
  };
}
