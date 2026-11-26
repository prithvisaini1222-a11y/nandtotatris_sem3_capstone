// Hack Computer CPU & System Emulator in TypeScript
// Full 16-bit Von Neumann architecture matching official Nand to Tetris specification.

export interface CpuState {
  A: number;
  D: number;
  PC: number;
  instruction: number;
  inM: number;
  outM: number;
  writeM: boolean;
  addressM: number;
  cycles: number;
  halted: boolean;
  jumpTaken: boolean;
}

export class HackCpuEmulator {
  public ram: Int16Array;
  public rom: Int16Array;
  public A: number = 0;
  public D: number = 0;
  public PC: number = 0;
  public cycles: number = 0;
  public lastInstruction: number = 0;
  public lastOutM: number = 0;
  public lastWriteM: boolean = false;
  public lastAddressM: number = 0;
  public lastJumpTaken: boolean = false;

  constructor() {
    this.ram = new Int16Array(32768);
    this.rom = new Int16Array(32768);
  }

  public reset(): void {
    this.A = 0;
    this.D = 0;
    this.PC = 0;
    this.cycles = 0;
    this.lastInstruction = 0;
    this.lastOutM = 0;
    this.lastWriteM = false;
    this.lastAddressM = 0;
    this.lastJumpTaken = false;
    this.ram.fill(0);
  }

  public loadProgram(machineCode: string[] | number[]): void {
    this.rom.fill(0);
    for (let i = 0; i < machineCode.length && i < 32768; i++) {
      const val = machineCode[i];
      if (typeof val === 'string') {
        this.rom[i] = parseInt(val.trim(), 2);
      } else {
        this.rom[i] = val;
      }
    }
    this.reset();
  }

  public setKeyboard(keyCode: number): void {
    this.ram[24576] = keyCode;
  }

  public getKeyboard(): number {
    return this.ram[24576];
  }

  public step(): CpuState {
    if (this.PC >= this.rom.length) {
      this.PC = 0; // Wrap around or halt
    }

    const inst = this.rom[this.PC] & 0xFFFF;
    this.lastInstruction = inst;
    let nextPC = this.PC + 1;
    this.lastWriteM = false;
    this.lastJumpTaken = false;

    // Check instruction type: MSB bit 15
    if ((inst & 0x8000) === 0) {
      // A-instruction: 0vvvvvvvvvvvvvvv (loads constant into A-register)
      this.A = inst & 0x7FFF;
      this.lastOutM = 0;
    } else {
      // C-instruction: 111 a c1..c6 d1..d3 j1..j3
      const aBit = (inst >> 12) & 1;
      const cBits = (inst >> 6) & 0x3F;
      const dBits = (inst >> 3) & 7;
      const jBits = inst & 7;

      const zx = (cBits >> 5) & 1;
      const nx = (cBits >> 4) & 1;
      const zy = (cBits >> 3) & 1;
      const ny = (cBits >> 2) & 1;
      const f  = (cBits >> 1) & 1;
      const no = cBits & 1;

      let x = this.D & 0xFFFF;
      const memAddr = this.A & 0x7FFF;
      this.lastAddressM = memAddr;
      const inM = this.ram[memAddr] & 0xFFFF;
      let y = aBit ? inM : (this.A & 0xFFFF);

      // ALU operations
      if (zx) x = 0;
      if (nx) x = (~x) & 0xFFFF;
      if (zy) y = 0;
      if (ny) y = (~y) & 0xFFFF;

      let out = f ? ((x + y) & 0xFFFF) : ((x & y) & 0xFFFF);
      if (no) out = (~out) & 0xFFFF;

      // Signed 16-bit interpretation
      const signedOut = out > 32767 ? out - 65536 : out;
      this.lastOutM = signedOut;

      const zr = (out === 0);
      const ng = (signedOut < 0);
      const pos = (!zr && !ng);

      // Destination routing
      // d1 -> A (bit 2 of dBits, i.e., 4)
      // d2 -> D (bit 1 of dBits, i.e., 2)
      // d3 -> M (bit 0 of dBits, i.e., 1)
      if (dBits & 1) {
        if (memAddr < 32768 && memAddr !== 24576) { // Keyboard is read-only
          this.ram[memAddr] = signedOut;
          this.lastWriteM = true;
        }
      }
      if (dBits & 2) {
        this.D = signedOut;
      }
      if (dBits & 4) {
        this.A = out & 0x7FFF;
      }

      // Jump condition evaluation
      let jump = false;
      switch (jBits) {
        case 0: jump = false; break;                 // no jump
        case 1: jump = pos; break;                   // JGT (out > 0)
        case 2: jump = zr; break;                    // JEQ (out == 0)
        case 3: jump = pos || zr; break;             // JGE (out >= 0)
        case 4: jump = ng; break;                    // JLT (out < 0)
        case 5: jump = !zr; break;                   // JNE (out != 0)
        case 6: jump = ng || zr; break;              // JLE (out <= 0)
        case 7: jump = true; break;                  // JMP (unconditional)
      }

      if (jump) {
        nextPC = this.A & 0x7FFF;
        this.lastJumpTaken = true;
      }
    }

    this.PC = nextPC;
    this.cycles++;

    return this.getState();
  }

  public runBatch(stepCount: number): CpuState {
    for (let i = 0; i < stepCount; i++) {
      this.step();
    }
    return this.getState();
  }

  public getState(): CpuState {
    const memAddr = this.A & 0x7FFF;
    return {
      A: this.A,
      D: this.D,
      PC: this.PC,
      instruction: this.lastInstruction,
      inM: this.ram[memAddr] || 0,
      outM: this.lastOutM,
      writeM: this.lastWriteM,
      addressM: this.lastAddressM,
      cycles: this.cycles,
      halted: false,
      jumpTaken: this.lastJumpTaken,
    };
  }

  public renderToCanvas(ctx: CanvasRenderingContext2D, imgData: ImageData): void {
    const d = imgData.data;
    const base = 16384;
    let ptr = 0;

    for (let r = 0; r < 256; r++) {
      const rowBase = base + (r * 32);
      for (let w = 0; w < 32; w++) {
        const word = this.ram[rowBase + w];
        for (let bit = 0; bit < 16; bit++) {
          const isBlack = (word >> bit) & 1;
          const c = isBlack ? 0 : 255;
          d[ptr]     = c; // R
          d[ptr + 1] = c; // G
          d[ptr + 2] = c; // B
          d[ptr + 3] = 255; // Alpha
          ptr += 4;
        }
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }
}
