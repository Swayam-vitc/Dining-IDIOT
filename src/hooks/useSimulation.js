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

// Step types for flowchart
export const STEP_TYPE = {
  INIT:         'init',
  CHECK_LEFT:   'check_left',
  PICK_LEFT:    'pick_left',
  CHECK_RIGHT:  'check_right',
  PICK_RIGHT:   'pick_right',
  EATING:       'eating',
  RELEASE:      'release',
  WAITING:      'waiting',
  DEADLOCK:     'deadlock',
  COMPLETE:     'complete',
};

/**
 * Build flowchart steps for a philosopher action.
 * Returns an array of {id, label, status, description} objects.
 * status: 'done' | 'active' | 'pending' | 'error' | 'skipped'
 */
function buildFlowchartSteps(stepType, philoName, leftFork, rightFork) {
  const steps = [
    {
      id: 'hungry',
      icon: '😋',
      label: `${philoName} is Hungry`,
      description: `Philosopher ${philoName} wants to eat and initiates a resource request.`,
      status: 'pending',
    },
    {
      id: 'req_left',
      icon: '🍴',
      label: `Request Left Fork (F${leftFork + 1})`,
      description: `${philoName} tries to pick up the left fork — Fork F${leftFork + 1}. This is a shared resource (mutex/semaphore).`,
      status: 'pending',
    },
    {
      id: 'pick_left',
      icon: '✅',
      label: `Acquired Left Fork (F${leftFork + 1})`,
      description: `Fork F${leftFork + 1} is free! ${philoName} locks it. No other philosopher can use F${leftFork + 1} now.`,
      status: 'pending',
    },
    {
      id: 'req_right',
      icon: '🍴',
      label: `Request Right Fork (F${rightFork + 1})`,
      description: `${philoName} now tries to pick up the right fork — Fork F${rightFork + 1}.`,
      status: 'pending',
    },
    {
      id: 'pick_right',
      icon: '✅',
      label: `Acquired Right Fork (F${rightFork + 1})`,
      description: `Fork F${rightFork + 1} is free! ${philoName} locks it. Both forks are now held.`,
      status: 'pending',
    },
    {
      id: 'eating',
      icon: '🍽️',
      label: `${philoName} is EATING`,
      description: `${philoName} holds both F${leftFork + 1} and F${rightFork + 1}. Critical section — eating in progress!`,
      status: 'pending',
    },
    {
      id: 'release',
      icon: '🔓',
      label: `Release Both Forks`,
      description: `${philoName} finishes eating and releases F${leftFork + 1} and F${rightFork + 1}. Both forks are now free for neighbours.`,
      status: 'pending',
    },
    {
      id: 'thinking',
      icon: '🤔',
      label: `${philoName} is Thinking`,
      description: `${philoName} returns to thinking state. Cycle complete!`,
      status: 'pending',
    },
  ];

  // Mark steps based on current type
  const markUpTo = (untilId, lastStatus = 'active') => {
    let found = false;
    for (const s of steps) {
      if (found) break;
      if (s.id === untilId) {
        s.status = lastStatus;
        found = true;
      } else {
        s.status = 'done';
      }
    }
  };

  switch (stepType) {
    case STEP_TYPE.INIT:
      steps[0].status = 'active';
      break;
    case STEP_TYPE.CHECK_LEFT:
    case STEP_TYPE.PICK_LEFT:
      markUpTo('pick_left');
      break;
    case STEP_TYPE.CHECK_RIGHT:
    case STEP_TYPE.PICK_RIGHT:
      markUpTo('pick_right');
      break;
    case STEP_TYPE.EATING:
      markUpTo('eating');
      break;
    case STEP_TYPE.RELEASE:
      markUpTo('release');
      break;
    case STEP_TYPE.COMPLETE:
      steps.forEach(s => s.status = 'done');
      break;
    case STEP_TYPE.WAITING:
      steps[0].status = 'done';
      steps[1].status = 'error';
      steps.slice(2).forEach(s => s.status = 'skipped');
      break;
    default:
      break;
  }

  return steps;
}

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
    heldBy: null,
  }));

  return { philosophers, forks };
}

/**
 * Generate terminal lines for C lab output simulation.
 * Returns accumulated array of lines up to this point in the simulation.
 */
function buildTerminalLines(totalPhilosophers, hungryIndices, config, terminalSoFar, newEvent) {
  return [...terminalSoFar, newEvent];
}

/**
 * Generate the full simulation steps array.
 */
function generateSteps(totalPhilosophers, hungryIndices, useWaiterSolution) {
  const steps = [];
  const terminalLines = [];

  // ---- Deadlock check ----
  if (hungryIndices.length === totalPhilosophers) {
    const { philosophers, forks } = buildInitialState(totalPhilosophers, new Set(hungryIndices));
    const deadlockPhilos = philosophers.map(p => ({ ...p, state: STATE.WAITING }));

    // Build terminal for deadlock
    const dlTerminal = [
      { type: 'cmd',    text: `[root@localhost OS_lab_4B_100]# cc TW5.c` },
      { type: 'cmd',    text: `[root@localhost OS_lab_4B_100]# ./a.out` },
      { type: 'divider',text: `=====DINING PHILOSOPHER PROBLEM========` },
      { type: 'input',  text: `Enter total number of philosophers: ${totalPhilosophers}` },
      { type: 'input',  text: `Enter number of hungry philosophers: ${hungryIndices.length}` },
      ...hungryIndices.map((idx, i) => ({
        type: 'input',
        text: `Enter position of hungry philosopher ${i + 1}: ${idx + 1}`,
      })),
      { type: 'blank',  text: '' },
      { type: 'info',   text: '1.Allow one philosopher to eat' },
      { type: 'info',   text: ' 2.Exit' },
      { type: 'input',  text: '3.Enter your choice:1' },
      { type: 'blank',  text: '' },
      { type: 'warn',   text: '⚠️  DEADLOCK DETECTED — All philosophers WAITING' },
      { type: 'blank',  text: '' },
      ...deadlockPhilos.map(p => ({ type: 'deadlock', text: `Philosopher ${p.id + 1} is WAITING (circular deadlock)` })),
      { type: 'divider', text: '................' },
    ];

    steps.push({
      philosophers: deadlockPhilos,
      forks,
      event: '⚠️ All philosophers are HUNGRY — Deadlock detected! No philosopher can proceed.',
      isDeadlock: true,
      activePhilosopher: null,
      activeForks: [],
      stepType: STEP_TYPE.DEADLOCK,
      stepDescription: 'All philosophers picked up their left fork simultaneously. Now everyone waits for the right fork — creating a circular wait. This is a DEADLOCK.',
      flowchartSteps: null,
      terminalLines: dlTerminal,
      activeFlowchartStep: null,
    });
    return { steps, isDeadlockScenario: true };
  }

  // ---- Normal simulation ----
  const hungrySet = new Set(hungryIndices);
  let { philosophers, forks } = buildInitialState(totalPhilosophers, hungrySet);

  const clonePhilos = (arr) => arr.map(p => ({ ...p }));
  const cloneForks  = (arr) => arr.map(f => ({ ...f }));

  // Build initial terminal header
  const baseTerminal = [
    { type: 'cmd',    text: `[root@localhost OS_lab_4B_100]# cc TW5.c` },
    { type: 'cmd',    text: `[root@localhost OS_lab_4B_100]# ./a.out` },
    { type: 'divider',text: `=====DINING PHILOSOPHER PROBLEM========` },
    { type: 'input',  text: `Enter total number of philosophers: ${totalPhilosophers}` },
    { type: 'input',  text: `Enter number of hungry philosophers: ${hungryIndices.length}` },
    ...hungryIndices.map((idx, i) => ({
      type: 'input',
      text: `Enter position of hungry philosopher ${i + 1}: ${idx + 1}`,
    })),
    { type: 'blank',  text: '' },
    { type: 'info',   text: '1.Allow one philosopher to eat' },
    { type: 'info',   text: ' 2.Exit' },
    { type: 'input',  text: '3.Enter your choice:1' },
    { type: 'blank',  text: '' },
    { type: 'info',   text: 'Only one philosopher eats at time:' },
    { type: 'blank',  text: '' },
  ];

  // Track cumulative terminal output blocks
  // Each eating round adds a block
  const terminalBlocks = [...baseTerminal];

  // Initial state snapshot
  steps.push({
    philosophers: clonePhilos(philosophers),
    forks: cloneForks(forks),
    event: `🍽️ Simulation started. ${hungryIndices.length} philosopher(s) are hungry: ${hungryIndices.map(i => `P${i+1}`).join(', ')}`,
    isDeadlock: false,
    activePhilosopher: null,
    activeForks: [],
    stepType: STEP_TYPE.INIT,
    stepDescription: `The dining table is set. There are ${totalPhilosophers} philosophers and ${totalPhilosophers} forks. Hungry philosophers: ${hungryIndices.map(i => `P${i+1}`).join(', ')}. Each philosopher needs BOTH adjacent forks to eat.`,
    flowchartSteps: null,
    terminalLines: [...terminalBlocks],
    activeFlowchartStep: null,
  });

  const allowedToTry = useWaiterSolution
    ? hungryIndices.slice(0, totalPhilosophers - 1)
    : hungryIndices;

  // Process each hungry philosopher
  for (let turn = 0; turn < hungryIndices.length; turn++) {
    const philoIdx = hungryIndices[turn];
    const philoName = `P${philoIdx + 1}`;
    const leftFork  = philoIdx;
    const rightFork = (philoIdx - 1 + totalPhilosophers) % totalPhilosophers;

    const isBlocked = useWaiterSolution && !allowedToTry.includes(philoIdx);
    const leftFree  = forks[leftFork].state  === FORK_STATE.FREE;
    const rightFree = forks[rightFork].state === FORK_STATE.FREE;

    if (!isBlocked && leftFree && rightFree) {
      // ---- STEP: Pick up left fork ----
      philosophers = clonePhilos(philosophers);
      forks = cloneForks(forks);
      forks[leftFork].state  = FORK_STATE.HELD_L;
      forks[leftFork].heldBy = philoIdx;
      philosophers[philoIdx].state = STATE.HUNGRY;

      steps.push({
        philosophers: clonePhilos(philosophers),
        forks: cloneForks(forks),
        event: `🍴 ${philoName} picks up LEFT fork (Fork F${leftFork + 1})`,
        isDeadlock: false,
        activePhilosopher: philoIdx,
        activeForks: [leftFork],
        stepType: STEP_TYPE.PICK_LEFT,
        stepDescription: `${philoName} successfully acquires the LEFT fork — Fork F${leftFork + 1}. This fork is now LOCKED (held by ${philoName}). Fork F${leftFork + 1} sits between ${philoName} and P${((philoIdx - 1 + totalPhilosophers) % totalPhilosophers) + 1}.`,
        flowchartSteps: buildFlowchartSteps(STEP_TYPE.PICK_LEFT, philoName, leftFork, rightFork),
        terminalLines: [...terminalBlocks],
        activeFlowchartStep: 'pick_left',
      });

      // ---- STEP: Pick up right fork ----
      philosophers = clonePhilos(philosophers);
      forks = cloneForks(forks);
      forks[rightFork].state  = FORK_STATE.HELD_R;
      forks[rightFork].heldBy = philoIdx;

      steps.push({
        philosophers: clonePhilos(philosophers),
        forks: cloneForks(forks),
        event: `🍴 ${philoName} picks up RIGHT fork (Fork F${rightFork + 1})`,
        isDeadlock: false,
        activePhilosopher: philoIdx,
        activeForks: [leftFork, rightFork],
        stepType: STEP_TYPE.PICK_RIGHT,
        stepDescription: `${philoName} successfully acquires the RIGHT fork — Fork F${rightFork + 1}. Both forks are now locked! ${philoName} has everything needed to eat.`,
        flowchartSteps: buildFlowchartSteps(STEP_TYPE.PICK_RIGHT, philoName, leftFork, rightFork),
        terminalLines: [...terminalBlocks],
        activeFlowchartStep: 'pick_right',
      });

      // ---- STEP: Eating ----
      philosophers = clonePhilos(philosophers);
      philosophers[philoIdx].state = STATE.EATING;
      philosophers[philoIdx].ateCount += 1;

      // Others still hungry → show as waiting
      const waitingNames = [];
      for (let j = turn + 1; j < hungryIndices.length; j++) {
        const waitIdx = hungryIndices[j];
        philosophers[waitIdx].state = STATE.WAITING;
        philosophers[waitIdx].waitCount += 1;
        waitingNames.push(`P${waitIdx + 1}`);
      }

      // Build terminal eating block
      const eatingBlock = [
        { type: 'eating', text: `Philosopher ${philoIdx + 1} is EATING` },
        ...waitingNames.map(name => ({ type: 'waiting', text: `Philosopher ${name.slice(1)} is WAITING` })),
        { type: 'divider', text: '................' },
        { type: 'blank', text: '' },
      ];
      terminalBlocks.push(...eatingBlock);

      steps.push({
        philosophers: clonePhilos(philosophers),
        forks: cloneForks(forks),
        event: `✅ ${philoName} is now EATING! Others wait their turn.`,
        isDeadlock: false,
        activePhilosopher: philoIdx,
        activeForks: [leftFork, rightFork],
        stepType: STEP_TYPE.EATING,
        stepDescription: `${philoName} is in the CRITICAL SECTION — eating with Fork F${leftFork + 1} (left) and Fork F${rightFork + 1} (right). All other hungry philosophers must wait. This is mutual exclusion in action!`,
        flowchartSteps: buildFlowchartSteps(STEP_TYPE.EATING, philoName, leftFork, rightFork),
        terminalLines: [...terminalBlocks],
        activeFlowchartStep: 'eating',
      });

      // ---- STEP: Release forks ----
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
        event: `🔓 ${philoName} finished eating and released both forks. Now THINKING.`,
        isDeadlock: false,
        activePhilosopher: philoIdx,
        activeForks: [],
        stepType: STEP_TYPE.RELEASE,
        stepDescription: `${philoName} exits the critical section and releases Fork F${leftFork + 1} and Fork F${rightFork + 1}. Both forks are now FREE — the next philosopher in the queue can proceed.`,
        flowchartSteps: buildFlowchartSteps(STEP_TYPE.RELEASE, philoName, leftFork, rightFork),
        terminalLines: [...terminalBlocks],
        activeFlowchartStep: 'release',
      });

    } else {
      // ---- STEP: Waiting (blocked) ----
      philosophers = clonePhilos(philosophers);
      philosophers[philoIdx].state = STATE.WAITING;
      philosophers[philoIdx].waitCount += 1;

      const reason = isBlocked
        ? `Waiter solution: only ${totalPhilosophers - 1} philosophers allowed at once`
        : `Forks unavailable (Left F${leftFork + 1}: ${leftFree ? 'free' : 'taken'}, Right F${rightFork + 1}: ${rightFree ? 'free' : 'taken'})`;

      const waitBlock = [
        { type: 'waiting', text: `Philosopher ${philoIdx + 1} is WAITING` },
        { type: 'divider', text: '................' },
        { type: 'blank', text: '' },
      ];
      terminalBlocks.push(...waitBlock);

      steps.push({
        philosophers: clonePhilos(philosophers),
        forks: cloneForks(forks),
        event: `⏳ ${philoName} is WAITING — ${reason}`,
        isDeadlock: false,
        activePhilosopher: philoIdx,
        activeForks: [],
        stepType: STEP_TYPE.WAITING,
        stepDescription: `${philoName} cannot eat right now. Reason: ${reason}. The philosopher is blocked and must wait until the required forks become available.`,
        flowchartSteps: buildFlowchartSteps(STEP_TYPE.WAITING, philoName, leftFork, rightFork),
        terminalLines: [...terminalBlocks],
        activeFlowchartStep: 'req_left',
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
    stepType: STEP_TYPE.COMPLETE,
    stepDescription: 'All hungry philosophers have successfully eaten (or were processed). No deadlock occurred. The dining table is at rest.',
    flowchartSteps: null,
    terminalLines: [...terminalBlocks],
    activeFlowchartStep: null,
    isFinal: true,
  });

  return { steps, isDeadlockScenario: false };
}

/**
 * useSimulation — core simulation hook
 */
export function useSimulation() {
  const [config, setConfig] = useState(null);
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1200);
  const [isDeadlockScenario, setIsDeadlockScenario] = useState(false);
  const [phase, setPhase] = useState('config');
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
