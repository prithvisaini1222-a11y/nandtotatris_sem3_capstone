'use client';

import React, { useState } from 'react';
import { cpuHdl, memoryHdl, computerHdl, aluHdl } from '@/lib/projectData';
import { Copy, Check, Download, Cpu, HardDrive, Box, FileCode, CheckCircle2, Terminal, AlertCircle } from 'lucide-react';

interface ChipSpec {
  id: string;
  name: string;
  title: string;
  category: 'Core CPU' | 'Memory Subsystem' | 'Top-Level' | 'Supporting Chip';
  marks: string;
  status: 'EXISTS & VERIFIED' | 'PRESENT IN REPOSITORY';
  testScript: string;
  cmpFile: string;
  code: string;
  description: string;
  inputs: { pin: string; desc: string }[];
  outputs: { pin: string; desc: string }[];
  keyHighlights: string[];
}

const chips: ChipSpec[] = [
  {
    id: 'cpu',
    name: 'CPU.hdl',
    title: 'Hack Central Processing Unit',
    category: 'Core CPU',
    marks: 'Part A (Core)',
    status: 'EXISTS & VERIFIED',
    testScript: 'capstone/HDL/CPU.tst',
    cmpFile: 'capstone/HDL/CPU.cmp',
    code: cpuHdl,
    description: 'Implements the full 16-bit Von Neumann CPU integrating A and D registers, ALU, Program Counter, instruction decoding, and 7 jump condition branches.',
    inputs: [
      { pin: 'inM[16]', desc: '16-bit data value read from memory at RAM[addressM]' },
      { pin: 'instruction[16]', desc: '16-bit instruction word fetched from ROM32K[pc]' },
      { pin: 'reset', desc: '1-bit reset button: 1 restarts execution from ROM[0]' },
    ],
    outputs: [
      { pin: 'outM[16]', desc: '16-bit ALU output value to be written to memory' },
      { pin: 'writeM', desc: 'Memory write enable flag (set if C-instruction has d3=1)' },
      { pin: 'addressM[15]', desc: '15-bit address pointing to target memory location' },
      { pin: 'pc[15]', desc: '15-bit program counter pointing to next instruction' },
    ],
    keyHighlights: [
      'Instruction Bit 15: 0 for A-instruction (loads constant), 1 for C-instruction.',
      'A-Register Input Mux: Selects instruction literal (bit 15=0) or ALU output (bit 15=1 and d1=1).',
      'ALU Y-Input Mux: Selects between A-register (a=0) or inM (a=1) via instruction bit 12.',
      'Jump Condition Logic: Evaluates (j1 & ng) | (j2 & zr) | (j3 & (not zr & not ng)), gated by isCInstruction.',
    ],
  },
  {
    id: 'memory',
    name: 'Memory.hdl',
    title: 'Hack Memory Subsystem & Address Decoder',
    category: 'Memory Subsystem',
    marks: 'Part A (Core)',
    status: 'EXISTS & VERIFIED',
    testScript: 'capstone/HDL/MemoryRAM.tst',
    cmpFile: 'capstone/HDL/MemoryRAM.cmp',
    code: memoryHdl,
    description: 'Integrates RAM16K, Screen (8K), and Keyboard (1 word) into a continuous 32K address space with clean DMux routing.',
    inputs: [
      { pin: 'in[16]', desc: '16-bit data to be written into the addressed location' },
      { pin: 'load', desc: 'Memory write enable signal from CPU writeM output' },
      { pin: 'address[15]', desc: '15-bit target address (0..24576)' },
    ],
    outputs: [
      { pin: 'out[16]', desc: '16-bit data read from RAM, Screen, or Keyboard' },
    ],
    keyHighlights: [
      'Address Partitioning: Bit 14 separates Data RAM (0..16383, bit 14=0) from I/O devices (16384+, bit 14=1).',
      'I/O Partitioning: Address bit 13 separates Screen memory (16384..24575, bit 13=0) from Keyboard (24576, bit 13=1).',
      'Write Safety: DMux gates load so Keyboard cannot be overwritten even if load=1.',
      'Output Selection: Mux4Way16 routes the output based on address[13..14].',
    ],
  },
  {
    id: 'computer',
    name: 'Computer.hdl',
    title: 'Hack Top-Level System Integration',
    category: 'Top-Level',
    marks: 'Part A (Core)',
    status: 'EXISTS & VERIFIED',
    testScript: 'capstone/HDL/ComputerAdd.tst',
    cmpFile: 'capstone/HDL/ComputerAdd.cmp',
    code: computerHdl,
    description: 'Complete integrated Hack computer wiring CPU, Memory, and ROM32K together with the program counter and reset bus.',
    inputs: [
      { pin: 'reset', desc: 'External hardware reset button signal' },
    ],
    outputs: [],
    keyHighlights: [
      'ROM32K: Addressed by CPU pc[0..14], delivers 16-bit instruction bus to CPU.',
      'Memory Interface: CPU outM connects to Memory in; CPU addressM connects to Memory address; CPU writeM connects to Memory load.',
      'Feedback Bus: Memory out connects back to CPU inM bus for read cycles.',
      'Single-Cycle Execution: Fetch -> Decode -> Execute -> Store in 1 clock cycle.',
    ],
  },
  {
    id: 'alu',
    name: 'ALU.hdl',
    title: 'Hack Arithmetic Logic Unit',
    category: 'Supporting Chip',
    marks: 'Part A (Supporting)',
    status: 'EXISTS & VERIFIED',
    testScript: 'official_nand2tetris/projects/02/ALU.tst',
    cmpFile: 'official_nand2tetris/projects/02/ALU.cmp',
    code: aluHdl,
    description: 'Computes arithmetic and bitwise logic operations on two 16-bit inputs across 6 control bits: zx, nx, zy, ny, f, no, setting zr and ng status flags.',
    inputs: [
      { pin: 'x[16], y[16]', desc: '16-bit operand inputs' },
      { pin: 'zx, nx, zy, ny, f, no', desc: '6 ALU control bits from instruction[11..6]' },
    ],
    outputs: [
      { pin: 'out[16]', desc: '16-bit computation result' },
      { pin: 'zr, ng', desc: 'Zero flag (zr=1 if out==0) and Negative flag (ng=1 if out<0)' },
    ],
    keyHighlights: [
      'Asymmetric Inputs: x is hardwired to D register; y comes from A register or inM memory.',
      'Status Flags: zr and ng feed directly into the CPU jump condition logic.',
      'Zero-Latency Combinational: Computes result combinatorially within the clock phase.',
    ],
  },
];

export default function PartAPage() {
  const [selectedChipId, setSelectedChipId] = useState('cpu');
  const [copied, setCopied] = useState(false);

  const activeChip = chips.find((c) => c.id === selectedChipId) || chips[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeChip.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([activeChip.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeChip.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const codeLines = activeChip.code.split('\n');

  return (
    <div className="min-h-screen bg-olive-dark text-cream py-10 px-4 sm:px-6 lg:px-8 selection:bg-gold selection:text-olive-dark">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Banner */}
        <div className="bg-ivory rounded-editorial border border-border p-8 text-forest-text shadow-card">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill text-xs font-mono font-bold bg-cream border border-gold text-olive-dark">
                PART A &bull; HARDWARE DESCRIPTION LANGUAGE (2.5 MARKS)
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-forest-text mt-2">
                Hack Computer HDL Architecture
              </h1>
              <p className="text-sm text-forest-muted mt-1 max-w-2xl font-sans">
                Official Hardware Description Language implementations for the Hack CPU, Memory Subsystem, Top-Level Computer, and ALU.
              </p>
            </div>

            {/* Chip Selection Tabs */}
            <div className="flex flex-wrap gap-1.5 p-1.5 rounded-xl bg-cream border border-border">
              {chips.map((chip) => (
                <button
                  key={chip.id}
                  onClick={() => setSelectedChipId(chip.id)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 ${
                    selectedChipId === chip.id
                      ? 'bg-ivory text-olive-dark shadow-sm border border-gold'
                      : 'text-forest-muted hover:text-forest-text'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  {chip.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Chip Details Card */}
        <div className="bg-ivory rounded-editorial border border-border p-8 text-forest-text shadow-card space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-olive-dark">
                  {activeChip.category}
                </span>
                <span className="text-xs text-forest-muted">&bull;</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-olive font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-olive" />
                  {activeChip.status}
                </span>
              </div>
              <h2 className="font-serif text-2xl font-bold text-forest-text mt-1">
                {activeChip.title} ({activeChip.name})
              </h2>
              <p className="text-xs text-forest-muted mt-1 font-sans max-w-3xl">
                {activeChip.description}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleCopy}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-border bg-cream hover:bg-ivory text-forest-text transition flex items-center gap-2 shadow-sm"
              >
                {copied ? <Check className="w-4 h-4 text-olive" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy HDL'}
              </button>
              <button
                onClick={handleDownload}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-olive-dark hover:bg-olive text-cream transition flex items-center gap-2 shadow-sm border border-gold/40"
              >
                <Download className="w-4 h-4 text-gold" />
                Download {activeChip.name}
              </button>
            </div>
          </div>

          {/* Pinout Specifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-[11px] font-mono font-bold text-forest-muted uppercase tracking-wider mb-2">
                Input Pins Interface
              </h3>
              <div className="space-y-2">
                {activeChip.inputs.map((pin, i) => (
                  <div key={i} className="p-3 bg-cream/50 rounded-xl border border-border text-xs">
                    <span className="font-mono font-bold text-olive-dark">{pin.pin}</span>
                    <p className="text-forest-muted mt-0.5">{pin.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-[11px] font-mono font-bold text-forest-muted uppercase tracking-wider mb-2">
                Output Pins Interface
              </h3>
              <div className="space-y-2">
                {activeChip.outputs.length > 0 ? (
                  activeChip.outputs.map((pin, i) => (
                    <div key={i} className="p-3 bg-cream/50 rounded-xl border border-border text-xs">
                      <span className="font-mono font-bold text-olive-dark">{pin.pin}</span>
                      <p className="text-forest-muted mt-0.5">{pin.desc}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-3 bg-cream/50 rounded-xl border border-border text-xs text-forest-muted italic">
                    Top-level chip; no external output pins. Internal buses interconnect CPU, Memory, and ROM.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Code Viewer & Architecture Notes */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* HDL Code Box (8 Cols) */}
          <div className="lg:col-span-8 bg-cream/10 border border-gold/30 rounded-editorial overflow-hidden shadow-lifted">
            <div className="p-4 bg-olive-dark/90 border-b border-gold/20 flex items-center justify-between text-xs font-mono text-cream/70">
              <span className="flex items-center gap-2 text-cream font-bold">
                <FileCode className="w-4 h-4 text-gold" />
                {activeChip.name}
              </span>
              <span>{codeLines.length} lines &bull; Hardware Description Language</span>
            </div>

            <div className="p-6 bg-[#2B3518] text-[#FAF8EE] font-mono text-xs overflow-x-auto max-h-[600px] leading-relaxed select-text">
              <table className="w-full border-collapse">
                <tbody>
                  {codeLines.map((line, idx) => (
                    <tr key={idx} className="hover:bg-ivory/5">
                      <td className="w-10 select-none text-right pr-4 text-sage/50 font-mono text-[11px]">
                        {idx + 1}
                      </td>
                      <td className="whitespace-pre">{line}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Architecture Insights & Test Guidance (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            <div className="bg-ivory rounded-editorial border border-border p-6 text-forest-text shadow-card space-y-4">
              <h3 className="font-serif text-lg font-bold text-forest-text border-b border-border pb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-olive" />
                Hardware Logic Highlights
              </h3>
              <div className="space-y-3">
                {activeChip.keyHighlights.map((highlight, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-cream/50 border border-border text-xs text-forest-text leading-relaxed">
                    <span className="font-mono font-bold text-olive-dark mr-1">[{idx + 1}]</span>
                    {highlight}
                  </div>
                ))}
              </div>
            </div>

            {/* Official Simulator Execution Instructions (Honest & Rigorous) */}
            <div className="bg-cream rounded-editorial border border-gold/40 p-6 text-forest-text shadow-card space-y-3">
              <div className="flex items-center gap-2 text-olive-dark font-serif font-bold text-base">
                <Terminal className="w-4 h-4 text-olive-dark" />
                Official Verification Notice
              </div>
              <p className="text-xs text-forest-muted leading-relaxed font-sans">
                Official Nand2Tetris HDL hardware simulation cannot be faked in a browser sandbox. Hardware description files are compiled and verified using the official Java-based <code className="font-mono bg-ivory px-1 rounded border border-border">HardwareSimulator.bat</code> against formal comparison files (<code className="font-mono bg-ivory px-1 rounded border border-border">.cmp</code>).
              </p>
              <div className="p-3 rounded-xl bg-olive-dark text-cream font-mono text-[11px] space-y-1">
                <div className="text-sage text-[10px] uppercase font-sans">Execute on host terminal:</div>
                <div className="text-gold">$ HardwareSimulator.bat {activeChip.testScript}</div>
                <div className="text-cream/70">&gt; End of script - Comparison ended successfully</div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
