'use client';

import React, { useState, useEffect } from 'react';
import { assembleHack, AssemblyResult } from '@/lib/assembler';
import { 
  boxAsm, 
  addAsm, 
  maxAsm, 
  rectAsm, 
  assemblerPy 
} from '@/lib/projectData';
import { 
  Play, 
  Download, 
  Copy, 
  Check, 
  FileCode, 
  Terminal, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  RotateCcw,
  BookOpen
} from 'lucide-react';

const duplicateLabelSample = `// Duplicate Label Detection Test Program (K mod 3 = 2)
// Student Roll Number: 2501730041 | Parameter K = 41
// Feature: Warning is emitted when a label is declared more than once.

(START)
    @10
    D=A
(LOOP)
    @counter
    M=D
    D=D-1
(LOOP)              // Line 11: Intentional Duplicate Label
    @LOOP
    D;JGT
(END)
    @END
    0;JMP
`;

export default function PartBPage() {
  const [sourceCode, setSourceCode] = useState<string>(boxAsm);
  const [selectedPreset, setSelectedPreset] = useState<string>('box');
  const [result, setResult] = useState<AssemblyResult | null>(null);
  const [activeInspectorTab, setActiveInspectorTab] = useState<'machine' | 'symbols' | 'python'>('machine');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedHack, setCopiedHack] = useState(false);

  // Automatically assemble on mount and when source changes
  useEffect(() => {
    const res = assembleHack(sourceCode);
    setResult(res);
  }, [sourceCode]);

  const handleLoadPreset = (name: string, code: string) => {
    setSelectedPreset(name);
    setSourceCode(code);
  };

  const handleDownloadHack = () => {
    if (!result || !result.success) return;
    const blob = new Blob([result.machineCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedPreset === 'box' ? 'Box' : selectedPreset}.hack`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPython = () => {
    const blob = new Blob([assemblerPy], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'assembler.py';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyHack = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.machineCode);
    setCopiedHack(true);
    setTimeout(() => setCopiedHack(false), 2000);
  };

  return (
    <div className="min-h-screen bg-olive-dark text-cream py-10 px-4 sm:px-6 lg:px-8 selection:bg-gold selection:text-olive-dark">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Title Header */}
        <div className="bg-ivory rounded-editorial border border-border p-8 text-forest-text shadow-card">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill text-xs font-mono font-bold bg-cream border border-gold text-olive-dark">
                PART B &bull; PYTHON ASSEMBLER &amp; TRANSLATOR STUDIO (3.0 MARKS)
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-forest-text mt-2">
                Hack Two-Pass Assembler Playground
              </h1>
              <p className="text-sm text-forest-muted mt-1 max-w-2xl font-sans">
                Real-time two-pass translation engine: strips comments, detects duplicate labels (K mod 3 = 2), evaluates A/C instructions, allocates RAM variables, and generates 16-bit binary.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleDownloadPython}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-olive-dark hover:bg-olive text-cream transition flex items-center gap-2 shadow-sm border border-gold/40"
              >
                <Download className="w-4 h-4 text-gold" />
                Download assembler.py
              </button>
            </div>
          </div>
        </div>

        {/* Preset Selector Bar */}
        <div className="bg-ivory rounded-editorial border border-border p-4 text-forest-text shadow-card flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-forest-muted uppercase tracking-wider mr-2">
              Load Preset Program:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => handleLoadPreset('box', boxAsm)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                  selectedPreset === 'box'
                    ? 'bg-olive-dark text-cream border border-gold'
                    : 'bg-cream text-forest-text hover:bg-ivory border border-border'
                }`}
              >
                Box.asm (Capstone)
              </button>
              <button
                onClick={() => handleLoadPreset('add', addAsm)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                  selectedPreset === 'add'
                    ? 'bg-olive-dark text-cream border border-gold'
                    : 'bg-cream text-forest-text hover:bg-ivory border border-border'
                }`}
              >
                Add.asm
              </button>
              <button
                onClick={() => handleLoadPreset('max', maxAsm)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                  selectedPreset === 'max'
                    ? 'bg-olive-dark text-cream border border-gold'
                    : 'bg-cream text-forest-text hover:bg-ivory border border-border'
                }`}
              >
                Max.asm
              </button>
              <button
                onClick={() => handleLoadPreset('rect', rectAsm)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                  selectedPreset === 'rect'
                    ? 'bg-olive-dark text-cream border border-gold'
                    : 'bg-cream text-forest-text hover:bg-ivory border border-border'
                }`}
              >
                Rect.asm
              </button>
              <button
                onClick={() => handleLoadPreset('duplicate', duplicateLabelSample)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                  selectedPreset === 'duplicate'
                    ? 'bg-olive-dark text-cream border border-gold'
                    : 'bg-cream text-forest-text hover:bg-ivory border border-border'
                }`}
              >
                Duplicate Label Test (K mod 3)
              </button>
            </div>
          </div>

          <div className="text-xs font-mono text-forest-muted">
            Status: {result?.success ? (
              <span className="text-olive font-bold inline-flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100% Assembled Cleanly
              </span>
            ) : (
              <span className="text-red-700 font-bold inline-flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Syntax Errors Found
              </span>
            )}
          </div>
        </div>

        {/* Diagnostic Warnings / Errors Box */}
        {result && (result.warnings.length > 0 || result.errors.length > 0) && (
          <div className="space-y-3">
            {result.warnings.map((warn, i) => (
              <div key={i} className="p-4 rounded-xl bg-cream border border-gold/60 text-forest-text text-xs flex items-start gap-3 shadow-sm">
                <ShieldCheck className="w-5 h-5 text-olive-dark flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-serif text-sm text-forest-text">
                    Special K mod 3 = 2 Warning Diagnostic
                  </strong>
                  <p className="font-mono text-[11px] text-forest-muted mt-0.5">{warn}</p>
                </div>
              </div>
            ))}

            {result.errors.map((err, i) => (
              <div key={i} className="p-4 rounded-xl bg-red-50 border border-red-300 text-red-900 text-xs flex items-start gap-3 shadow-sm">
                <AlertTriangle className="w-5 h-5 text-red-700 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-serif text-sm text-red-950">Assembly Syntax Error</strong>
                  <p className="font-mono text-[11px] text-red-800 mt-0.5">{err}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Editor & Machine Code Side-by-Side */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Interactive Assembly Editor (6 Cols) */}
          <div className="lg:col-span-6 bg-ivory rounded-editorial border border-border p-6 text-forest-text shadow-card space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-olive-dark" />
                  <span className="font-mono font-bold text-xs uppercase tracking-wider text-forest-text">
                    Assembly Source Editor (.asm)
                  </span>
                </div>
                <span className="text-xs font-mono text-forest-muted">
                  {sourceCode.split('\n').length} lines
                </span>
              </div>

              <div className="mt-4">
                <textarea
                  value={sourceCode}
                  onChange={(e) => setSourceCode(e.target.value)}
                  placeholder="// Enter Hack Assembly code here..."
                  rows={20}
                  className="w-full p-4 rounded-xl font-mono text-xs leading-relaxed bg-cream/40 border border-border text-forest-text focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold resize-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-forest-muted">
              <span>Edit or paste assembly to recompile instantly</span>
              <button
                onClick={() => setSourceCode(boxAsm)}
                className="text-xs text-olive-dark underline font-bold"
              >
                Reset to Box.asm
              </button>
            </div>
          </div>

          {/* Right Column: Output Inspector Tabs (6 Cols) */}
          <div className="lg:col-span-6 bg-ivory rounded-editorial border border-border p-6 text-forest-text shadow-card space-y-4 flex flex-col justify-between">
            <div>
              {/* Tab Switcher */}
              <div className="flex items-center justify-between pb-3 border-b border-border flex-wrap gap-2">
                <div className="flex gap-1 bg-cream p-1 rounded-xl border border-border">
                  <button
                    onClick={() => setActiveInspectorTab('machine')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                      activeInspectorTab === 'machine'
                        ? 'bg-ivory text-olive-dark shadow-sm border border-gold'
                        : 'text-forest-muted hover:text-forest-text'
                    }`}
                  >
                    16-Bit Machine Code (.hack)
                  </button>
                  <button
                    onClick={() => setActiveInspectorTab('symbols')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                      activeInspectorTab === 'symbols'
                        ? 'bg-ivory text-olive-dark shadow-sm border border-gold'
                        : 'text-forest-muted hover:text-forest-text'
                    }`}
                  >
                    Symbol Table
                  </button>
                  <button
                    onClick={() => setActiveInspectorTab('python')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                      activeInspectorTab === 'python'
                        ? 'bg-ivory text-olive-dark shadow-sm border border-gold'
                        : 'text-forest-muted hover:text-forest-text'
                    }`}
                  >
                    Python Script
                  </button>
                </div>

                {activeInspectorTab === 'machine' && result?.success && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyHack}
                      className="px-2.5 py-1 rounded-lg border border-border bg-cream hover:bg-ivory text-[11px] font-mono font-bold text-forest-text transition flex items-center gap-1"
                    >
                      {copiedHack ? <Check className="w-3 h-3 text-olive" /> : <Copy className="w-3 h-3" />}
                      {copiedHack ? 'Copied' : 'Copy'}
                    </button>
                    <button
                      onClick={handleDownloadHack}
                      className="px-2.5 py-1 rounded-lg bg-olive-dark hover:bg-olive text-[11px] font-mono font-bold text-cream transition flex items-center gap-1"
                    >
                      <Download className="w-3 h-3 text-gold" />
                      .hack
                    </button>
                  </div>
                )}
              </div>

              {/* Machine Code View */}
              {activeInspectorTab === 'machine' && (
                <div className="mt-4 bg-[#2B3518] text-[#FAF8EE] p-4 rounded-xl font-mono text-xs overflow-x-auto max-h-[460px] leading-relaxed select-text">
                  {result && result.binaryInstructions.length > 0 ? (
                    <table className="w-full border-collapse">
                      <tbody>
                        {result.binaryInstructions.map((bin, idx) => (
                          <tr key={idx} className="hover:bg-ivory/5">
                            <td className="w-12 select-none text-right pr-4 text-sage/60 text-[11px]">
                              {idx}
                            </td>
                            <td className="tracking-widest font-mono">
                              <span className={bin.startsWith('0') ? 'text-gold' : 'text-cream'}>
                                {bin}
                              </span>
                            </td>
                            <td className="pl-4 text-[10px] text-sage/70 font-sans">
                              {bin.startsWith('0') ? 'A-inst' : 'C-inst'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-8 text-center text-sage">
                      No instructions generated. Check for syntax errors.
                    </div>
                  )}
                </div>
              )}

              {/* Symbol Table View */}
              {activeInspectorTab === 'symbols' && result && (
                <div className="mt-4 space-y-4 max-h-[460px] overflow-y-auto">
                  {/* Labels Section */}
                  <div>
                    <h4 className="text-[11px] font-mono font-bold text-forest-muted uppercase tracking-wider mb-2">
                      ROM Labels (First Pass Discovery):
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      {Object.keys(result.labels).length > 0 ? (
                        Object.entries(result.labels).map(([lbl, info]) => (
                          <div key={lbl} className="p-2.5 rounded-lg bg-cream/50 border border-border flex justify-between">
                            <span className="font-bold text-olive-dark">{lbl}</span>
                            <span className="text-forest-muted">ROM[{info.address}] &bull; L{info.line}</span>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-xs text-forest-muted col-span-2 italic">
                          No branch labels defined in this program.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Allocated Variables Section */}
                  <div>
                    <h4 className="text-[11px] font-mono font-bold text-forest-muted uppercase tracking-wider mb-2">
                      Allocated Variables (RAM Address &ge; 16):
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      {Object.keys(result.variables).length > 0 ? (
                        Object.entries(result.variables).map(([v, addr]) => (
                          <div key={v} className="p-2.5 rounded-lg bg-cream/50 border border-border flex justify-between">
                            <span className="font-bold text-olive-dark">{v}</span>
                            <span className="text-forest-muted">RAM[{addr}]</span>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-xs text-forest-muted col-span-2 italic">
                          No user variables allocated.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Python Deliverable View */}
              {activeInspectorTab === 'python' && (
                <div className="mt-4 bg-[#2B3518] text-[#FAF8EE] p-4 rounded-xl font-mono text-xs overflow-x-auto max-h-[460px] leading-relaxed select-text">
                  <pre>
                    <code>{assemblerPy}</code>
                  </pre>
                </div>
              )}
            </div>

            {/* Bottom Stats Footer */}
            <div className="pt-4 border-t border-border flex flex-wrap items-center justify-between text-xs font-mono text-forest-muted gap-2">
              <span>ROM Instructions: {result?.stats.instructionCount || 0}</span>
              <span>Labels: {result?.stats.labelCount || 0}</span>
              <span>Variables: {result?.stats.variableCount || 0}</span>
              <span>Warnings: {result?.stats.warningCount || 0}</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
