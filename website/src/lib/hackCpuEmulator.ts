/**
 * Pure TypeScript Implementation of the Hack Central Processing Unit (CPU)
 * and Complete Computer System Emulator.
 *
 * Simulates:
 * - 16-bit Von Neumann CPU (A register, D register, PC, ALU, Jump condition evaluator)
 * - Complete 32K Memory Architecture:
 *   * RAM16K (0 to 16383)
 *   * SCREEN (16384 to 24575, 8192 words = 512 x 256 pixels)
 *   * KEYBOARD (24576, 1 word read-only register)
 * - 32K Instruction ROM (holds up to 32,768 16-bit instructions)
 * - Dirty screen word tracking for high-performance canvas updates
 */

export interface CpuState {
  pc: number;
  a: number;
  d: number;
  kbd: number;
  currentInstruction: string;
  cycles: number;
  lastWrittenAddress: number | null;
  lastWrittenValue: number | null;
  modifiedScreenAddresses: number[];
}

export class HackCpuEmulator {
  // Registers
  public a: number = 0; // 16-bit A-register
  public d: number = 0; // 16-bit D-register
  public pc: number = 0; // 15-bit Program Counter
  public cycles: number = 0;

  // Memory
  // RAM 32K: 0..16383 = RAM16K, 16384..24575 = SCREEN, 24576 = KBD
  public memory: Int16Array = new Int16Array(24577);

  // Instruction ROM (32K words)
  public rom: Uint16Array = new Uint16Array(32768);
  public romRaw: string[] = [];

  // Dirty screen tracking
  public screenDirty: boolean = true;
  public dirtyWords: Set<number> = new Set();
  public modifiedAddresses: Set<number> = new Set();

  // Diagnostics
  public lastWrittenAddress: number | null = null;
  public lastWrittenValue: number | null = null;

  constructor() {
    this.reset();
  }

  /**
   * Resets CPU registers, PC, cycles, and clears RAM/Screen
   */
  public reset(): void {
    this.a = 0;
    this.d = 0;
    this.pc = 0;
    this.cycles = 0;
    this.memory.fill(0);
    this.screenDirty = true;
    this.dirtyWords.clear();
    this.modifiedAddresses.clear();
    this.lastWrittenAddress = null;
    this.lastWrittenValue = null;
  }

  /**
   * Loads 16-bit binary machine instructions into ROM
   */
  public loadProgram(binaryInstructions: string[]): void {
    this.rom.fill(0);
    this.romRaw = [...binaryInstructions];

    for (let i = 0; i < binaryInstructions.length && i < 32768; i++) {
      const code = binaryInstructions[i].trim();
      if (code.length === 16) {
        this.rom[i] = parseInt(code, 2);
      }
    }

    this.reset();
  }

  /**
   * Sets the keyboard register (RAM[24576])
   */
  public setKeyboard(code: number): void {
    this.memory[24576] = code & 0xffff;
  }

  /**
   * Simulates the Hack ALU operation
   * Control bits: zx, nx, zy, ny, f, no
   * Inputs: 16-bit x, 16-bit y
   * Outputs: 16-bit out, zr (zero flag), ng (negative flag)
   */
  private alu(
    x: number,
    y: number,
    zx: number,
    nx: number,
    zy: number,
    ny: number,
    f: number,
    no: number
  ): { out: number; zr: boolean; ng: boolean } {
    let xVal = x & 0xffff;
    let yVal = y & 0xffff;

    // zx: zero x
    if (zx) xVal = 0;
    // nx: negate x
    if (nx) xVal = (~xVal) & 0xffff;

    // zy: zero y
    if (zy) yVal = 0;
    // ny: negate y
    if (ny) yVal = (~yVal) & 0xffff;

    // f: function (1 -> x + y, 0 -> x & y)
    let out: number;
    if (f) {
      out = (xVal + yVal) & 0xffff;
    } else {
      out = (xVal & yVal) & 0xffff;
    }

    // no: negate output
    if (no) {
      out = (~out) & 0xffff;
    }

    // Compute flags (in 16-bit two's complement, bit 15 is sign bit)
    const zr = out === 0;
    const ng = (out & 0x8000) !== 0;

    return { out, zr, ng };
  }

  /**
   * Executes a single Hack CPU clock cycle
   */
  public step(): boolean {
    if (this.pc >= this.romRaw.length && this.pc >= 32768) {
      return false;
    }

    const instruction = this.rom[this.pc] || 0;
    const isCInstruction = (instruction & 0x8000) !== 0; // Bit 15: 1=C-inst, 0=A-inst

    let nextPC = (this.pc + 1) & 0x7fff;

    if (!isCInstruction) {
      // -----------------------------------------------------------------------
      // A-INSTRUCTION: 0vvv vvvv vvvv vvvv
      // Loads 15-bit constant into A-register
      // -----------------------------------------------------------------------
      this.a = instruction & 0x7fff;
    } else {
      // -----------------------------------------------------------------------
      // C-INSTRUCTION: 111 a c1..c6 d1..d3 j1..j3
      // -----------------------------------------------------------------------
      const aBit = (instruction >> 12) & 1;
      const cBits = (instruction >> 6) & 0x3f;
      const zx = (cBits >> 5) & 1;
      const nx = (cBits >> 4) & 1;
      const zy = (cBits >> 3) & 1;
      const ny = (cBits >> 2) & 1;
      const f  = (cBits >> 1) & 1;
      const no = (cBits >> 0) & 1;

      const d1 = (instruction >> 5) & 1; // Load A
      const d2 = (instruction >> 4) & 1; // Load D
      const d3 = (instruction >> 3) & 1; // Write to Memory (writeM)

      const j1 = (instruction >> 2) & 1; // Jump if out < 0
      const j2 = (instruction >> 1) & 1; // Jump if out == 0
      const j3 = (instruction >> 0) & 1; // Jump if out > 0

      // ALU Inputs: x = D-register; y = A-register (aBit=0) or inM (aBit=1)
      const xInput = this.d;
      let yInput: number;

      const memAddr = this.a & 0x7fff;
      if (aBit === 1) {
        // Read from memory: RAM[A]
        if (memAddr <= 24576) {
          yInput = this.memory[memAddr];
        } else {
          yInput = 0;
        }
      } else {
        // Read from A-register
        yInput = this.a;
      }

      // Execute ALU computation
      const aluResult = this.alu(xInput, yInput, zx, nx, zy, ny, f, no);
      const outM = aluResult.out;

      // Destination Bit 3 (d3): write to Memory M
      if (d3) {
        if (memAddr < 24576) {
          // Can write to RAM16K or SCREEN (Keyboard at 24576 is read-only)
          this.memory[memAddr] = outM;
          this.lastWrittenAddress = memAddr;
          this.lastWrittenValue = outM;

          if (memAddr >= 16384 && memAddr < 24576) {
            // Write to Screen Memory!
            this.screenDirty = true;
            this.dirtyWords.add(memAddr - 16384);
            this.modifiedAddresses.add(memAddr);
          }
        }
      }

      // Destination Bit 2 (d2): load into D-register
      if (d2) {
        this.d = outM;
      }

      // Destination Bit 1 (d1): load into A-register
      if (d1) {
        this.a = outM & 0x7fff;
      }

      // Jump Condition Evaluation
      const zr = aluResult.zr;
      const ng = aluResult.ng;
      const pos = !zr && !ng;

      const passJLT = j1 && ng;
      const passJEQ = j2 && zr;
      const passJGT = j3 && pos;

      if (passJLT || passJEQ || passJGT) {
        nextPC = this.a & 0x7fff;
      }
    }

    this.pc = nextPC;
    this.cycles++;
    return true;
  }

  /**
   * Executes multiple clock cycles in a burst (for fluid real-time simulation)
   */
  public stepCycles(cycleCount: number): number {
    let executed = 0;
    for (let i = 0; i < cycleCount; i++) {
      this.step();
      executed++;
    }
    return executed;
  }

  /**
   * Renders the 512 x 256 pixel Hack screen to an HTML5 Canvas 2D context
   * using direct pixel manipulation on ImageData.
   */
  public renderScreen(
    ctx: CanvasRenderingContext2D,
    colorOn: [number, number, number] = [41, 50, 31],   // Deep Forest Black/Olive
    colorOff: [number, number, number] = [243, 238, 216] // Warm Cream
  ): void {
    const width = 512;
    const height = 256;

    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;

    let wordIdx = 16384;

    for (let row = 0; row < height; row++) {
      for (let wordCol = 0; wordCol < 32; wordCol++) {
        const wordVal = this.memory[wordIdx++];

        const basePixelX = wordCol * 16;
        const rowOffset = row * width * 4;

        // In Nand2Tetris, Bit 0 (LSB) is the leftmost pixel of the word;
        // Bit 15 (MSB) is the rightmost pixel of the word.
        for (let b = 0; b < 16; b++) {
          const isPixelOn = (wordVal & (1 << b)) !== 0;
          const pixelX = basePixelX + b;
          const idx = rowOffset + pixelX * 4;

          const [r, g, bColor] = isPixelOn ? colorOn : colorOff;
          data[idx + 0] = r;
          data[idx + 1] = g;
          data[idx + 2] = bColor;
          data[idx + 3] = 255; // Full opacity
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
    this.screenDirty = false;
    this.dirtyWords.clear();
  }

  /**
   * Retrieves current diagnostic state for UI inspectors
   */
  public getState(): CpuState {
    const currentCode = this.romRaw[this.pc] || '0000000000000000';
    return {
      pc: this.pc,
      a: this.a,
      d: this.d,
      kbd: this.memory[24576] & 0xffff,
      currentInstruction: currentCode,
      cycles: this.cycles,
      lastWrittenAddress: this.lastWrittenAddress,
      lastWrittenValue: this.lastWrittenValue,
      modifiedScreenAddresses: Array.from(this.modifiedAddresses).sort((a, b) => a - b),
    };
  }
}
