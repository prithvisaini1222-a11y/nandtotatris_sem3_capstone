'use client';

import React, { useState } from 'react';
import { calculateK, KParameters } from '@/lib/kCalculator';
import { PROJECT_CONFIG } from '@/config/project';
import { Calculator, RotateCcw, CheckCircle2, ShieldCheck } from 'lucide-react';

interface KCalculatorProps {
  onParametersChange?: (params: KParameters) => void;
}

export default function KCalculatorCard({ onParametersChange }: KCalculatorProps) {
  const defaultRoll = PROJECT_CONFIG.rollNumber || '2501730041';
  const [rollInput, setRollInput] = useState(defaultRoll);
  const [params, setParams] = useState<KParameters>(calculateK(defaultRoll));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setRollInput(val);
    if (val.trim().length >= 2) {
      const computed = calculateK(val);
      setParams(computed);
      if (onParametersChange) {
        onParametersChange(computed);
      }
    }
  };

  const resetToDefault = () => {
    setRollInput(defaultRoll);
    const computed = calculateK(defaultRoll);
    setParams(computed);
    if (onParametersChange) {
      onParametersChange(computed);
    }
  };

  const hasValidRoll = rollInput.trim().length >= 2;

  return (
    <div className="bg-ivory rounded-editorial border border-border p-8 shadow-card text-forest-text">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-5 border-b border-border">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-cream border border-gold flex items-center justify-center text-olive-dark shadow-sm">
            <Calculator className="w-5 h-5 text-olive-dark" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-forest-text flex items-center gap-2">
              Personal Parameter K Engine
              <span className="text-[11px] font-sans px-2.5 py-0.5 rounded-full bg-cream text-olive-dark border border-gold font-semibold">
                {PROJECT_CONFIG.universityName}
              </span>
            </h3>
            <p className="text-xs text-forest-muted font-sans mt-0.5">
              Evaluates parameter K from the last two digits of the student university roll number.
            </p>
          </div>
        </div>

        {/* Input & Reset */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <input
              type="text"
              value={rollInput}
              onChange={handleChange}
              placeholder="Enter Roll No."
              className="w-44 px-3.5 py-2 rounded-xl border border-border bg-cream/40 text-xs font-mono font-bold text-forest-text focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold"
            />
          </div>
          <button
            onClick={resetToDefault}
            className="p-2 rounded-xl border border-border text-olive-dark hover:bg-cream transition-colors"
            title={`Reset to Student Roll No (${defaultRoll})`}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!hasValidRoll ? (
        <div className="my-6 p-6 rounded-xl bg-cream/50 border border-dashed border-border text-center text-xs text-forest-muted">
          Please enter at least the last two digits of your university roll number to compute personal hardware parameters.
        </div>
      ) : (
        <>
          {/* Primary K Output Banner */}
          <div className="my-6 p-5 rounded-xl bg-cream border border-gold/40 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-olive-dark font-sans">
                Calculated Parameter K
              </span>
              <div className="text-3xl font-serif font-bold text-olive-dark flex items-baseline gap-2.5 mt-0.5">
                <span>K = {params.K}</span>
                <span className="text-xs font-normal text-forest-muted font-sans">
                  (derived from Roll ending in <span className="font-mono font-bold text-forest-text">{params.rollNumber.slice(-2)}</span>)
                </span>
              </div>
            </div>

            <div className="flex gap-2.5">
              <div className="bg-ivory px-4 py-2 rounded-xl border border-border text-center shadow-sm">
                <span className="text-[10px] text-forest-muted block uppercase font-mono tracking-wider">K mod 3</span>
                <span className="text-base font-bold text-olive-dark font-mono">{params.kMod3}</span>
              </div>
              <div className="bg-ivory px-4 py-2 rounded-xl border border-border text-center shadow-sm">
                <span className="text-[10px] text-forest-muted block uppercase font-mono tracking-wider">K mod 4</span>
                <span className="text-base font-bold text-olive-dark font-mono">{params.kMod4}</span>
              </div>
            </div>
          </div>

          {/* Grid of Calculations */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-xs font-mono">
            <div className="bg-cream/40 p-4 rounded-xl border border-border">
              <span className="text-[10px] text-forest-muted block uppercase font-sans tracking-wider">Box Start Row</span>
              <span className="font-bold text-forest-text text-sm">Row {params.boxStartingRow}</span>
            </div>
            <div className="bg-cream/40 p-4 rounded-xl border border-border">
              <span className="text-[10px] text-forest-muted block uppercase font-sans tracking-wider">Box Dimensions</span>
              <span className="font-bold text-forest-text text-sm">{params.boxWidthPixels}px &times; {params.boxHeight}h</span>
            </div>
            <div className="bg-cream/40 p-4 rounded-xl border border-border">
              <span className="text-[10px] text-forest-muted block uppercase font-sans tracking-wider">Words / Row</span>
              <span className="font-bold text-forest-text text-sm">{params.wordsPerRow} words (32 bits)</span>
            </div>
            <div className="bg-cream/40 p-4 rounded-xl border border-border">
              <span className="text-[10px] text-forest-muted block uppercase font-sans tracking-wider">Screen Addr Map</span>
              <span className="font-bold text-olive-dark text-sm">{params.startingScreenAddress}..{params.endingScreenAddress}</span>
            </div>
          </div>

          {/* Assignment Feature Rule */}
          <div className="mt-5 p-4 bg-cream/70 rounded-xl border border-gold/30 text-xs text-forest-text flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-olive flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-forest-text block font-serif text-sm">
                Part B Requirement (K mod 3 = {params.kMod3}):
              </span>
              <span className="text-forest-muted leading-relaxed font-sans mt-0.5 block">
                {params.featureDescription}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
