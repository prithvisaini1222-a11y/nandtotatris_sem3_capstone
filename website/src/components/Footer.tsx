'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Cpu, CheckCircle2, RotateCcw } from 'lucide-react';
import { PROJECT_CONFIG, getConfiguredRollNumber } from '@/config/project';
import { useIntro } from '@/components/intro/IntroScreen';

export default function Footer() {
  const pathname = usePathname();
  const { replayIntro } = useIntro();
  const rollInfo = getConfiguredRollNumber();

  return (
    <footer className="bg-olive-dark text-cream/70 border-t border-gold/20 text-xs mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Col 1: Project Identity */}
          <div className="space-y-3.5 md:col-span-1">
            <div className="flex items-center gap-2.5 text-cream font-serif font-bold text-base">
              <div className="w-7 h-7 rounded-lg bg-cream border border-gold flex items-center justify-center text-olive-dark">
                <Cpu className="w-4 h-4 text-olive-dark" />
              </div>
              HACK COMPUTER LAB
            </div>
            <p className="text-xs text-cream/70 leading-relaxed font-sans">
              Capstone Engineering Project: <strong className="text-cream font-medium">{PROJECT_CONFIG.projectTitle}</strong>.
              From elementary NAND logic gates up to complete machine code execution on custom hardware.
            </p>
            <div className="text-[11px] text-sage pt-1 font-mono">
              Course: {PROJECT_CONFIG.courseCode} &bull; {PROJECT_CONFIG.courseName}
            </div>
          </div>

          {/* Col 2: Assignment Hierarchy */}
          <div>
            <h4 className="text-gold font-serif text-sm font-bold uppercase tracking-wider mb-4">
              Assignment Modules
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/part-a" className="hover:text-cream transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold inline-block"></span>
                  Part A: Hack Computer HDL (2.5 Marks)
                </Link>
              </li>
              <li>
                <Link href="/part-b" className="hover:text-cream transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold inline-block"></span>
                  Part B: Python Assembler (3.0 Marks)
                </Link>
              </li>
              <li>
                <Link href="/part-c" className="hover:text-cream transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold inline-block"></span>
                  Part C: Box Program &amp; Emulator (2.5 Marks)
                </Link>
              </li>
              <li>
                <Link href="/submission" className="hover:text-cream transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold inline-block"></span>
                  Final Submission Deliverables
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Hardware & Parameters */}
          <div>
            <h4 className="text-gold font-serif text-sm font-bold uppercase tracking-wider mb-4">
              Hardware Parameters (K=41)
            </h4>
            <div className="space-y-2 text-xs font-mono text-cream/80">
              <div className="flex justify-between border-b border-gold/10 pb-1">
                <span>Box Starting Row:</span>
                <span className="text-gold font-bold">Row 41</span>
              </div>
              <div className="flex justify-between border-b border-gold/10 pb-1">
                <span>Box Dimensions:</span>
                <span className="text-gold font-bold">32 px &times; 20 rows</span>
              </div>
              <div className="flex justify-between border-b border-gold/10 pb-1">
                <span>Screen Start Addr:</span>
                <span className="text-gold font-bold">17696 (Word 0)</span>
              </div>
              <div className="flex justify-between border-b border-gold/10 pb-1">
                <span>Screen End Addr:</span>
                <span className="text-gold font-bold">18305 (Word 1)</span>
              </div>
            </div>
          </div>

          {/* Col 4: University Record */}
          <div>
            <h4 className="text-gold font-serif text-sm font-bold uppercase tracking-wider mb-4">
              University Record
            </h4>
            <div className="p-4 rounded-xl bg-ivory/5 border border-gold/25 space-y-2 text-xs">
              <div className="text-cream/70">Student: <strong className="text-cream font-sans">{PROJECT_CONFIG.studentName}</strong></div>
              <div className="text-cream/70 font-mono">Roll: <strong className="text-gold">{rollInfo.value}</strong></div>
              <div className="text-cream/70">School: <span className="text-cream/90">{PROJECT_CONFIG.schoolName}</span></div>
              <div className="text-cream/70">University: <span className="text-cream/90">{PROJECT_CONFIG.universityName}</span></div>
              <div className="pt-2 border-t border-gold/20 text-[11px] text-sage font-mono">
                Evaluation: 10 Marks Individual Capstone
              </div>
            </div>
          </div>

        </div>

        <div className="pt-10 mt-10 border-t border-gold/20 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-cream/60">
          <div>
            &copy; {PROJECT_CONFIG.academicTerm} {PROJECT_CONFIG.universityName} &bull; {PROJECT_CONFIG.courseCode} Capstone Submission
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {pathname === '/' && (
              <button
                type="button"
                onClick={replayIntro}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill border border-gold/30 text-cream/80 hover:text-gold hover:border-gold/60 transition-colors text-[11px] font-mono tracking-wider uppercase"
              >
                <RotateCcw className="w-3 h-3" />
                Replay Intro
              </button>
            )}
            <div className="flex items-center gap-2 text-gold">
              <CheckCircle2 className="w-4 h-4 text-gold" />
              <span>Strict Assignment-Compliant Architecture &bull; Empirically Verified</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
