'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Cpu, 
  Terminal, 
  Monitor, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Layers, 
  FileCode,
  Download
} from 'lucide-react';
import KCalculatorCard from '@/components/KCalculatorCard';
import { CpuRamFiringBackdrop } from '@/components/intro/IntroAnimation';
import { PROJECT_CONFIG } from '@/config/project';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-olive-dark text-cream selection:bg-gold selection:text-olive-dark">
      
      {/* =========================================================================
          HERO SECTION — EDITORIAL DEEP OLIVE & WARM CREAM
         ========================================================================= */}
      <section className="relative pt-12 pb-24 px-4 sm:px-6 lg:px-8 pcb-pattern overflow-hidden border-b border-gold/20">
        <CpuRamFiringBackdrop variant="hero" />
        <div className="relative z-10 max-w-7xl mx-auto">
          
          {/* Academic Meta Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-cream/10 border border-gold/40 text-xs font-mono text-gold mb-8">
            <span className="w-2 h-2 rounded-full bg-gold inline-block animate-pulse"></span>
            <span>{PROJECT_CONFIG.courseCode} &bull; {PROJECT_CONFIG.universityName} &bull; Individual Capstone</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left 7 Cols: Display Typography */}
            <div className="lg:col-span-7 space-y-6">
              <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-cream leading-[1.05]">
                MAKE THE COMPUTER <br />
                <span className="text-gold italic font-normal">DRAW A BOX.</span>
              </h1>

              <p className="text-lg sm:text-xl text-cream/80 max-w-2xl font-sans font-light leading-relaxed">
                Build the Hack computer. Create your own assembler. Execute machine code. Watch your computer draw.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Link
                  href="/part-a"
                  className="px-6 py-3.5 rounded-xl bg-cream hover:bg-ivory text-olive-dark font-sans font-bold text-xs uppercase tracking-wider transition-all shadow-editorial border border-gold inline-flex items-center gap-2"
                >
                  <Cpu className="w-4 h-4" />
                  Explore Part A: HDL
                </Link>
                <Link
                  href="/part-c"
                  className="px-6 py-3.5 rounded-xl bg-olive-dark hover:bg-olive text-cream font-sans font-bold text-xs uppercase tracking-wider transition-all border border-gold/40 inline-flex items-center gap-2"
                >
                  <Monitor className="w-4 h-4 text-gold" />
                  Launch Box Emulator
                </Link>
                <Link
                  href="/submission"
                  className="px-6 py-3.5 rounded-xl text-sage hover:text-cream font-sans font-semibold text-xs tracking-wider transition-colors inline-flex items-center gap-1.5"
                >
                  Deliverables Checklist &rarr;
                </Link>
              </div>
            </div>

            {/* Right 5 Cols: Interactive Hardware Architecture Card */}
            <div className="lg:col-span-5">
              <div className="bg-ivory rounded-editorial border border-border p-7 shadow-lifted text-forest-text space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-olive-dark font-bold">
                      CAPSTONE SPECIFICATION
                    </span>
                    <h3 className="font-serif text-xl font-bold text-forest-text">
                      Assignment Rubric
                    </h3>
                  </div>
                  <span className="px-3 py-1 rounded-pill bg-cream text-olive-dark border border-gold text-xs font-mono font-bold">
                    10 Marks Total
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-cream/50 border border-border flex items-center justify-between">
                    <div>
                      <strong className="block text-forest-text font-serif text-sm">Part A: HDL Computer</strong>
                      <span className="text-forest-muted">CPU, Memory &amp; Computer Chips</span>
                    </div>
                    <span className="font-mono font-bold text-olive-dark bg-ivory px-2.5 py-1 rounded border border-border">
                      2.5 Marks
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-cream/50 border border-border flex items-center justify-between">
                    <div>
                      <strong className="block text-forest-text font-serif text-sm">Part B: Python Assembler</strong>
                      <span className="text-forest-muted">Two-pass parser + K mod 3 check</span>
                    </div>
                    <span className="font-mono font-bold text-olive-dark bg-ivory px-2.5 py-1 rounded border border-border">
                      3.0 Marks
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-cream/50 border border-border flex items-center justify-between">
                    <div>
                      <strong className="block text-forest-text font-serif text-sm">Part C: Box Program</strong>
                      <span className="text-forest-muted">Box.asm &amp; Interactive Drawing</span>
                    </div>
                    <span className="font-mono font-bold text-olive-dark bg-ivory px-2.5 py-1 rounded border border-border">
                      2.5 Marks
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-cream/50 border border-border flex items-center justify-between">
                    <div>
                      <strong className="block text-forest-text font-serif text-sm">Viva Voce Defense</strong>
                      <span className="text-forest-muted">On-the-spot code modifications</span>
                    </div>
                    <span className="font-mono font-bold text-olive-dark bg-ivory px-2.5 py-1 rounded border border-border">
                      2.0 Marks
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/part-c"
                    className="w-full py-2.5 rounded-xl bg-olive-dark text-cream hover:bg-olive text-center text-xs font-bold font-sans uppercase tracking-wider transition-colors block"
                  >
                    Open Live Software Emulator &rarr;
                  </Link>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 1: PERSONAL PARAMETER K CALCULATOR
         ========================================================================= */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-6">
          <span className="text-xs font-mono uppercase tracking-wider text-gold font-bold">
            01 &bull; Personal Verification
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-cream mt-1">
            Student Identity &amp; Parameter K
          </h2>
          <p className="text-sm text-cream/70 mt-1 max-w-2xl font-sans">
            Every dimension and memory address is mathematically locked to your university roll number.
          </p>
        </div>

        <KCalculatorCard />
      </section>

      {/* =========================================================================
          SECTION 2: THREE ASSIGNMENT PARTS (INTERACTIVE CARDS)
         ========================================================================= */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-10">
          <span className="text-xs font-mono uppercase tracking-wider text-gold font-bold">
            02 &bull; Core Assignment Structure
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-cream mt-1">
            The Three Pillars of the Hack Machine
          </h2>
          <p className="text-sm text-cream/70 mt-1 max-w-2xl font-sans">
            Each section corresponds strictly to the official university evaluation breakdown.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1: Part A */}
          <Link
            href="/part-a"
            className="group bg-ivory rounded-editorial border border-border p-8 text-forest-text hover:border-gold shadow-card hover:shadow-lifted transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-cream border border-gold flex items-center justify-center text-olive-dark group-hover:scale-105 transition-transform">
                  <Cpu className="w-6 h-6 text-olive-dark" />
                </div>
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-cream border border-border text-olive-dark">
                  2.5 Marks
                </span>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-forest-muted">
                  PART A
                </span>
                <h3 className="font-serif text-2xl font-bold text-forest-text mt-0.5 group-hover:text-olive-dark transition-colors">
                  Hack Computer HDL
                </h3>
                <p className="text-xs text-forest-muted mt-2 leading-relaxed font-sans">
                  Inspect the official Hardware Description Language sources: <code>CPU.hdl</code>, <code>Memory.hdl</code>, and <code>Computer.hdl</code>. Review pinouts and official simulator test scripts.
                </p>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-border flex items-center justify-between text-xs font-bold text-olive-dark">
              <span>Inspect HDL Sources</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 2: Part B */}
          <Link
            href="/part-b"
            className="group bg-ivory rounded-editorial border border-border p-8 text-forest-text hover:border-gold shadow-card hover:shadow-lifted transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-cream border border-gold flex items-center justify-center text-olive-dark group-hover:scale-105 transition-transform">
                  <Terminal className="w-6 h-6 text-olive-dark" />
                </div>
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-cream border border-border text-olive-dark">
                  3.0 Marks
                </span>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-forest-muted">
                  PART B
                </span>
                <h3 className="font-serif text-2xl font-bold text-forest-text mt-0.5 group-hover:text-olive-dark transition-colors">
                  Python Assembler
                </h3>
                <p className="text-xs text-forest-muted mt-2 leading-relaxed font-sans">
                  Interactive assembly playground with pure two-pass compilation, symbol resolution, duplicate label detection (K mod 3 = 2), and machine code generator.
                </p>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-border flex items-center justify-between text-xs font-bold text-olive-dark">
              <span>Open Assembler Studio</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 3: Part C */}
          <Link
            href="/part-c"
            className="group bg-ivory rounded-editorial border border-border p-8 text-forest-text hover:border-gold shadow-card hover:shadow-lifted transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-cream border border-gold flex items-center justify-center text-olive-dark group-hover:scale-105 transition-transform">
                  <Monitor className="w-6 h-6 text-olive-dark" />
                </div>
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-cream border border-border text-olive-dark">
                  2.5 Marks
                </span>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-forest-muted">
                  PART C
                </span>
                <h3 className="font-serif text-2xl font-bold text-forest-text mt-0.5 group-hover:text-olive-dark transition-colors">
                  Box Program &amp; Emulator
                </h3>
                <p className="text-xs text-forest-muted mt-2 leading-relaxed font-sans">
                  Genuine 16-bit Von Neumann CPU software emulator executing <code>Box.hack</code> cycle-by-cycle. Press physical keys on your keyboard to draw and erase the 32&times;20 box at row 41.
                </p>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-border flex items-center justify-between text-xs font-bold text-olive-dark">
              <span>Run Software Emulator</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

        </div>
      </section>

      {/* =========================================================================
          SECTION 3: DATAFLOW PIPELINE
         ========================================================================= */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-ivory rounded-editorial border border-border p-8 shadow-card text-forest-text">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-olive-dark font-bold">
                END-TO-END EXECUTION PIPELINE
              </span>
              <h3 className="font-serif text-2xl font-bold text-forest-text mt-0.5">
                From Symbolic Assembly to Physical Pixels
              </h3>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-forest-muted">
              <span className="w-2 h-2 rounded-full bg-olive-dark inline-block"></span>
              Synchronous Execution Architecture
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 my-8">
            <Link href="/part-b" className="p-4 rounded-xl bg-cream border border-border hover:border-gold transition-colors block">
              <span className="text-[10px] font-mono text-forest-muted block">STAGE 1</span>
              <strong className="text-sm font-serif font-bold text-forest-text block mt-1">Box.asm</strong>
              <p className="text-[11px] text-forest-muted font-mono mt-1">@KBD, D=M, (LOOP)</p>
            </Link>

            <Link href="/part-b" className="p-4 rounded-xl bg-cream border border-border hover:border-gold transition-colors block">
              <span className="text-[10px] font-mono text-forest-muted block">STAGE 2</span>
              <strong className="text-sm font-serif font-bold text-forest-text block mt-1">Two-Pass Assembler</strong>
              <p className="text-[11px] text-forest-muted mt-1">Symbol table &amp; K mod 3 check</p>
            </Link>

            <Link href="/part-b" className="p-4 rounded-xl bg-cream border border-border hover:border-gold transition-colors block">
              <span className="text-[10px] font-mono text-forest-muted block">STAGE 3</span>
              <strong className="text-sm font-serif font-bold text-forest-text block mt-1">Box.hack</strong>
              <p className="text-[11px] text-forest-muted font-mono mt-1">16-bit binary machine code</p>
            </Link>

            <Link href="/part-a" className="p-4 rounded-xl bg-cream border border-border hover:border-gold transition-colors block">
              <span className="text-[10px] font-mono text-forest-muted block">STAGE 4</span>
              <strong className="text-sm font-serif font-bold text-forest-text block mt-1">Hack CPU (HDL)</strong>
              <p className="text-[11px] text-forest-muted mt-1">ALU, A/D, PC &amp; Memory decoder</p>
            </Link>

            <Link href="/part-c" className="p-4 rounded-xl bg-cream border border-border hover:border-gold transition-colors block">
              <span className="text-[10px] font-mono text-forest-muted block">STAGE 5</span>
              <strong className="text-sm font-serif font-bold text-forest-text block mt-1">Screen Memory</strong>
              <p className="text-[11px] text-forest-muted font-mono mt-1">RAM[17696..18305] pixels</p>
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: SUBMISSION CALLOUT
         ========================================================================= */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-cream/10 border border-gold/30 rounded-editorial p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="text-xs font-mono uppercase tracking-wider text-gold font-bold">
              Final Verification &amp; Downloads
            </span>
            <h3 className="font-serif text-3xl font-bold text-cream">
              Ready for University Assessment &amp; Evaluation
            </h3>
            <p className="text-sm text-cream/70 leading-relaxed font-sans">
              All required assignment deliverables—including <code>CPU.hdl</code>, <code>assembler.py</code>, <code>Box.asm</code>, <code>Box.hack</code>, and the 4-page ZOSIMA project report—are prepared, verified, and downloadable.
            </p>
          </div>

          <Link
            href="/submission"
            className="px-8 py-4 rounded-xl bg-cream hover:bg-ivory text-olive-dark font-sans font-bold text-xs uppercase tracking-wider transition-all shadow-editorial border border-gold inline-flex items-center gap-2 whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            View Deliverables Package &rarr;
          </Link>
        </div>
      </section>

    </div>
  );
}
