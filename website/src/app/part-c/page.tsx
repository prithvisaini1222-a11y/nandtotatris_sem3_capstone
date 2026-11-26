'use client';

import React, { useState, useEffect, useRef } from 'react';
import { HackCpuEmulator, CpuState } from '@/lib/hackCpuEmulator';
import { boxHack, boxAsm } from '@/lib/projectData';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  Monitor, 
  Keyboard, 
  Activity, 
  Cpu, 
  CheckCircle2, 
  ShieldCheck,
  FileCode
} from 'lucide-react';

export default function PartCPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const emulatorRef = useRef<HackCpuEmulator>(new HackCpuEmulator());
  const animationFrameRef = useRef<number | null>(null);

  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(3000); // Cycles per animation frame
  const [isKeyDown, setIsKeyDown] = useState<boolean>(false);
  const [cpuState, setCpuState] = useState<CpuState>({
    pc: 0,
    a: 0,
    d: 0,
    kbd: 0,
    currentInstruction: '0000000000000000',
    cycles: 0,
    lastWrittenAddress: null,
    lastWrittenValue: null,
    modifiedScreenAddresses: [],
  });

  // Load Box.hack machine code on mount
  useEffect(() => {
    const emulator = emulatorRef.current;
    const instructions = boxHack.trim().split('\n');
    emulator.loadProgram(instructions);

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        emulator.renderScreen(ctx);
      }
    }
  }, []);

  // Physical Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }
      emulatorRef.current.setKeyboard(e.keyCode || 65);
      setIsKeyDown(true);
    };

    const handleKeyUp = () => {
      emulatorRef.current.setKeyboard(0);
      setIsKeyDown(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Continuous CPU Execution Loop (requestAnimationFrame)
  useEffect(() => {
    let lastRenderTime = 0;

    const loop = (timestamp: number) => {
      const emulator = emulatorRef.current;

      if (isRunning) {
        emulator.stepCycles(speed);

        // Update canvas rendering
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            emulator.renderScreen(ctx, [41, 50, 31], [243, 238, 216]);
          }
        }

        // Throttle UI state updates to ~20 FPS to prevent React render lag
        if (timestamp - lastRenderTime > 50) {
          setCpuState(emulator.getState());
          lastRenderTime = timestamp;
        }
      }

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRunning, speed]);

  const toggleRun = () => {
    setIsRunning(!isRunning);
  };

  const handleStep = () => {
    const emulator = emulatorRef.current;
    emulator.step();
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        emulator.renderScreen(ctx, [41, 50, 31], [243, 238, 216]);
      }
    }
    setCpuState(emulator.getState());
  };

  const handleReset = () => {
    const emulator = emulatorRef.current;
    emulator.reset();
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        emulator.renderScreen(ctx, [41, 50, 31], [243, 238, 216]);
      }
    }
    setCpuState(emulator.getState());
  };

  const handleSimPress = () => {
    emulatorRef.current.setKeyboard(75); // 'K' key code
    setIsKeyDown(true);
  };

  const handleSimRelease = () => {
    emulatorRef.current.setKeyboard(0);
    setIsKeyDown(false);
  };

  // Inspect live screen words
  const emuMem = emulatorRef.current.memory;
  const word17695 = emuMem[17695] || 0;
  const word17696 = emuMem[17696] || 0; // Row 41, Word 0 (Box start)
  const word17697 = emuMem[17697] || 0; // Row 41, Word 1
  const word17698 = emuMem[17698] || 0;
  const word18304 = emuMem[18304] || 0; // Row 60, Word 0
  const word18305 = emuMem[18305] || 0; // Row 60, Word 1 (Box end)
  const word18306 = emuMem[18306] || 0;

  return (
    <div className="min-h-screen bg-olive-dark text-cream py-10 px-4 sm:px-6 lg:px-8 selection:bg-gold selection:text-olive-dark">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Banner */}
        <div className="bg-ivory rounded-editorial border border-border p-8 text-forest-text shadow-card">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill text-xs font-mono font-bold bg-cream border border-gold text-olive-dark">
                PART C &bull; BOX PROGRAM &amp; CPU SOFTWARE EMULATOR (2.5 MARKS)
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-forest-text mt-2">
                Hack CPU &amp; Screen Emulator
              </h1>
              <p className="text-sm text-forest-muted mt-1 max-w-2xl font-sans">
                Real 16-bit Von Neumann software emulator executing <code>Box.hack</code>. Canvas pixels are painted directly from emulator SCREEN memory (RAM[16384..24575]).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-3.5 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-2 ${
                isKeyDown 
                  ? 'bg-olive-dark text-gold border-gold' 
                  : 'bg-cream text-forest-text border-border'
              }`}>
                <Keyboard className="w-4 h-4" />
                {isKeyDown ? 'Key Pressed (Drawing Box)' : 'Key Released (Box Erased)'}
              </span>
            </div>
          </div>
        </div>

        {/* Simulator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: 512 x 256 Canvas & Interactive Controls (8 Cols) */}
          <div className="lg:col-span-8 bg-ivory rounded-editorial border border-border p-7 text-forest-text shadow-card space-y-6">
            
            {/* Canvas Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Monitor className="w-4 h-4 text-olive-dark" />
                <span className="font-mono font-bold text-xs uppercase tracking-wider text-forest-text">
                  HACK SCREEN MEMORY DISPLAY (512 &times; 256 PIXELS)
                </span>
              </div>
              <span className="text-xs font-mono text-forest-muted">
                Address: SCREEN (16384) to KBD (24576)
              </span>
            </div>

            {/* Canvas Container */}
            <div className="p-4 rounded-xl bg-olive-dark border border-gold/30 shadow-inner flex flex-col items-center justify-center">
              <canvas
                ref={canvasRef}
                width={512}
                height={256}
                className="w-full max-w-[640px] aspect-[2/1] rounded-lg border border-gold/40 shadow-editorial pixelated bg-cream"
              />
              <div className="w-full flex justify-between items-center text-[10px] font-mono text-sage/70 pt-2 px-1">
                <span>Row 0 (Col 0..511)</span>
                <span>Box Location: Row 41 to 60 &bull; Cols 0 to 31</span>
                <span>Row 255</span>
              </div>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              
              {/* Play / Pause / Step / Reset */}
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleRun}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm ${
                    isRunning
                      ? 'bg-cream text-olive-dark border border-gold hover:bg-ivory'
                      : 'bg-olive-dark text-cream border border-gold hover:bg-olive'
                  }`}
                >
                  {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isRunning ? 'Pause CPU' : 'Run CPU'}
                </button>

                <button
                  onClick={handleStep}
                  disabled={isRunning}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold border border-border bg-cream hover:bg-ivory text-forest-text disabled:opacity-50 transition flex items-center gap-1.5"
                >
                  <SkipForward className="w-4 h-4" />
                  Single Step
                </button>

                <button
                  onClick={handleReset}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold border border-border bg-cream hover:bg-ivory text-forest-text transition flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
              </div>

              {/* Physical Key Simulation Button */}
              <div className="flex items-center gap-2">
                <button
                  onMouseDown={handleSimPress}
                  onMouseUp={handleSimRelease}
                  onTouchStart={handleSimPress}
                  onTouchEnd={handleSimRelease}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold font-sans uppercase tracking-wider transition-all shadow-editorial border select-none ${
                    isKeyDown
                      ? 'bg-gold text-olive-dark border-gold scale-95'
                      : 'bg-olive-dark hover:bg-olive text-cream border-gold/40'
                  }`}
                >
                  Hold Key to Draw Box
                </button>
              </div>

              {/* Speed Slider */}
              <div className="flex items-center gap-2 text-xs font-mono text-forest-muted">
                <span>Speed:</span>
                <input
                  type="range"
                  min="500"
                  max="10000"
                  step="500"
                  value={speed}
                  onChange={(e) => setSpeed(parseInt(e.target.value, 10))}
                  className="w-24 accent-olive-dark"
                />
                <span className="w-12 text-right">{speed}c</span>
              </div>

            </div>

            {/* Instruction Tip */}
            <div className="p-3.5 rounded-xl bg-cream/60 border border-border text-xs text-forest-muted leading-relaxed font-sans">
              <strong className="text-forest-text font-serif text-sm block">How the Physical Keyboard Polling Works:</strong>
              Press and hold <strong>any key on your physical keyboard</strong>. The browser captures the keystroke, updates the emulator&apos;s keyboard register at address <code>24576</code>, and the running <code>Box.hack</code> machine loop writes <code>-1</code> into screen rows 41 to 60. Releasing the key writes <code>0</code> and erases the box.
            </div>

          </div>

          {/* Right Column: Live Registers & Memory Word Monitor (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Live CPU Registers Card */}
            <div className="bg-ivory rounded-editorial border border-border p-6 text-forest-text shadow-card space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-olive-dark" />
                  <h3 className="font-serif text-base font-bold text-forest-text">
                    Live CPU Registers
                  </h3>
                </div>
                <span className="text-[11px] font-mono font-bold text-olive-dark bg-cream px-2 py-0.5 rounded border border-border">
                  Cycle #{cpuState.cycles.toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-cream/50 border border-border">
                  <span className="text-[10px] text-forest-muted block uppercase font-sans">Program Counter</span>
                  <span className="text-base font-bold text-forest-text">PC = {cpuState.pc}</span>
                </div>

                <div className="p-3 rounded-xl bg-cream/50 border border-border">
                  <span className="text-[10px] text-forest-muted block uppercase font-sans">A-Register</span>
                  <span className="text-base font-bold text-forest-text">A = {cpuState.a}</span>
                </div>

                <div className="p-3 rounded-xl bg-cream/50 border border-border">
                  <span className="text-[10px] text-forest-muted block uppercase font-sans">D-Register</span>
                  <span className="text-base font-bold text-forest-text">D = {cpuState.d}</span>
                </div>

                <div className="p-3 rounded-xl bg-cream/50 border border-border">
                  <span className="text-[10px] text-forest-muted block uppercase font-sans">KBD Memory</span>
                  <span className={`text-base font-bold ${cpuState.kbd !== 0 ? 'text-olive-dark' : 'text-forest-muted'}`}>
                    RAM[24576] = {cpuState.kbd}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-cream/50 border border-border text-xs font-mono">
                <span className="text-[10px] text-forest-muted block uppercase font-sans">ROM Instruction Code</span>
                <span className="font-bold text-olive-dark tracking-wider">{cpuState.currentInstruction}</span>
              </div>
            </div>

            {/* Memory Address Monitor (Empirical Proof of Screen Writing) */}
            <div className="bg-ivory rounded-editorial border border-border p-6 text-forest-text shadow-card space-y-4">
              <h3 className="font-serif text-base font-bold text-forest-text border-b border-border pb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-olive" />
                Screen Memory Address Monitor
              </h3>
              <p className="text-[11px] text-forest-muted font-sans leading-relaxed">
                Direct read from emulator memory words showing the boundary and box contents:
              </p>

              <div className="space-y-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-cream/40 border border-border flex justify-between">
                  <span className="text-forest-muted">RAM[17695] (Row 40 End):</span>
                  <span className="font-bold">{word17695}</span>
                </div>

                <div className="p-2.5 rounded-lg bg-cream border border-gold/60 flex justify-between font-bold text-olive-dark">
                  <span>RAM[17696] (Row 41, Word 0 &bull; Box Start):</span>
                  <span>{word17696 === -1 ? '-1 (0xFFFF / Black)' : '0 (White)'}</span>
                </div>

                <div className="p-2.5 rounded-lg bg-cream border border-gold/60 flex justify-between font-bold text-olive-dark">
                  <span>RAM[17697] (Row 41, Word 1 &bull; 32px):</span>
                  <span>{word17697 === -1 ? '-1 (0xFFFF / Black)' : '0 (White)'}</span>
                </div>

                <div className="p-2.5 rounded-lg bg-cream/40 border border-border flex justify-between">
                  <span className="text-forest-muted">RAM[17698] (Row 41, Word 2):</span>
                  <span className="font-bold">{word17698}</span>
                </div>

                <div className="p-2.5 rounded-lg bg-cream border border-gold/60 flex justify-between font-bold text-olive-dark">
                  <span>RAM[18305] (Row 60, Word 1 &bull; Box End):</span>
                  <span>{word18305 === -1 ? '-1 (0xFFFF / Black)' : '0 (White)'}</span>
                </div>

                <div className="p-2.5 rounded-lg bg-cream/40 border border-border flex justify-between">
                  <span className="text-forest-muted">RAM[18306] (Row 60, Word 2):</span>
                  <span className="font-bold">{word18306}</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
