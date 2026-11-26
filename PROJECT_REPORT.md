# NAND TO TETRIS CAPSTONE PROJECT REPORT
## MAKE THE COMPUTER DRAW A BOX

---

### PAGE 1 — PROJECT OVERVIEW

#### Course Information
- **Course Name:** Nand to Tetris – I
- **Course Code:** ETCNTC301 / ETCCNT301
- **Institution:** School of Engineering & Technology, K.R. Mangalam University
- **Assessment Scheme:** Capstone Project (10 Marks, Individual Work)
- **Academic Semester:** Odd Semester 2026–2027

#### Student Information
- **Student Name:** Prithvi Saini
- **University Roll Number:** 2501730041
- **Personal Number K:** **41** (Calculated as the last two digits of University Roll Number `2501730041`)

#### Personal Parameter Calculations
| Parameter | Formula | Calculated Value |
| :--- | :--- | :--- |
| **Roll Number** | Given Roll Number | `2501730041` |
| **Personal Number K** | Last two digits of Roll Number | **41** |
| **K mod 3** | $41 \pmod 3$ | **2** (Feature: Duplicate Label Detection) |
| **K mod 4** | $41 \pmod 4$ | **1** |
| **Box Starting Row** | $K$ | **Row 41** |
| **Box Height** | Fixed Specification | **20 screen rows** (Rows 41 to 60) |
| **Box Width in Pixels** | $16 \times ((K \bmod 4) + 1)$ | $16 \times (1 + 1) =$ **32 pixels** (Cols 0 to 31) |
| **16-bit Words per Row** | $(K \bmod 4) + 1$ | **2 words** |
| **Starting Screen Address** | $\text{SCREEN} + (32 \times K)$ | $16384 + (32 \times 41) =$ **17696** |
| **Ending Screen Row** | $K + 19$ | $41 + 19 =$ **Row 60** |
| **Ending Screen Address** | $\text{SCREEN} + (32 \times 60) + 1$ | $16384 + 1920 + 1 =$ **18305** |

#### Project Objective
The objective of this Capstone Project is to design, construct, integrate, and verify a complete working computer system from fundamental logic gates up to an interactive assembly language application. The project encompasses three primary milestones:
1. **Part A (Hardware Layer):** Building and verifying the Hack Computer platform in Hardware Description Language (HDL), integrating `CPU.hdl`, `Memory.hdl`, and `Computer.hdl`.
2. **Part B (Software Toolchain Layer):** Developing an independent, fully-featured two-pass Hack Assembler in Python (`assembler.py`) supporting predefined symbols, label resolution, dynamic variable allocation starting at RAM[16], and a customized diagnostic feature ($K \bmod 3 = 2$: Duplicate Label Detection).
3. **Part C (Application Layer):** Authoring `Box.asm` in Hack Assembly Language to continuously monitor the keyboard register (`KBD`, RAM[24576]), dynamically drawing a 32×20 black box starting at Row 41 while any key is pressed, and cleanly erasing it when released.

#### The Hack Computer Architecture
The Hack computer is a 16-bit Von Neumann architecture consisting of a Central Processing Unit (CPU), an instruction memory (ROM32K), and a unified data memory space (Memory, 32K words) encompassing 16K of General RAM, 8K of Memory-Mapped Screen space (256 rows × 512 pixels), and a Memory-Mapped Keyboard input register.

---

### PAGE 2 — COMPUTER ARCHITECTURE AND ASSEMBLER

#### 1. Hardware Architecture Implementation

##### A. CPU.hdl
The Hack CPU integrates an Arithmetic Logic Unit (ALU), two programmer-visible 16-bit registers (A-register and D-register), a 15-bit Program Counter (PC), and comprehensive decoding logic.
- **Instruction Decoding:** Bit 15 determines the instruction class. A `0` indicates an A-instruction (`@value`), loading a 15-bit constant into the A-register. A `1` signifies a C-instruction (`111accccccdddjjj`), controlling the ALU operation (`c1..c6`), source selection (`a`), destinations (`d1..d3`), and jump conditions (`j1..j3`).
- **ALU and Multiplexing:** The ALU computes operations between the D-register (x-input) and either the A-register or external memory `inM` (y-input, selected by bit 12).
- **Control Flags and Program Counter:** Destination bits route results to `outM` (writeM if d3=1), `D-register` (load if d2=1), and `A-register` (load if d1=1 or A-instruction). Jump logic checks ALU zero (`zr`) and negative (`ng`) status against jump bits (`j1, j2, j3`), setting `PC.load=1` upon taken branch; otherwise, `PC.inc=1`. Reset asserts `PC=0`.

##### B. Memory.hdl
`Memory.hdl` manages the 32K address space through address decoding:
- `address[14] == 0`: Routes reads/writes to `RAM16K` (0 to 16383 / `0x0000` to `0x3FFF`).
- `address[14..13] == 10`: Routes reads/writes to `Screen` (16384 to 24575 / `0x4000` to `0x5FFF`).
- `address[14..13] == 11`: Routes reads from the `Keyboard` register (24576 / `0x6000`). Keyboard is read-only; write attempts are safely sinked.
- Output multiplexing is performed using `Mux4Way16` driven by `address[13..14]`.

##### C. Computer.hdl
`Computer.hdl` unifies the top-level system:
- `ROM32K` addresses instructions via `CPU.pc` and delivers `instruction` to the CPU.
- `CPU` reads `Memory.out` via `inM`, emits computed values via `outM`, drives memory write enables via `writeM`, and directs addresses via `addressM`.
- System reset pin connects directly to `CPU.reset`, initiating execution from ROM[0].

#### 2. Two-Pass Python Assembler (`assembler.py`)

The assembler converts Hack assembly programs into 16-bit binary machine code without external dependencies:
- **First Pass (Label Resolution):** The assembler strips comments and whitespace while preserving original 1-based source line numbers. When a label `(LABEL)` is encountered, it is bound to the current ROM instruction address without advancing the counter.
- **Second Pass (Code Generation & Variable Allocation):**
  - **A-instructions (`@symbol`):** Constants (e.g., `@17696`) are directly converted to 15-bit binary with a leading `0`. Predefined symbols (`SCREEN`, `KBD`, `R0-R15`, `SP`, `LCL`, `ARG`, `THIS`, `THAT`) and labels are resolved to their mapped addresses. Unseen user symbols are dynamically allocated sequential RAM addresses starting at `RAM[16]`.
  - **C-instructions (`dest=comp;jump`):** Mnemonic fields are parsed and encoded using the standard Hack binary translation tables, prefixed by `111`.

#### 3. Personal K-Based Feature ($K \bmod 3 = 2$: Duplicate Label Detection)
Because $K = 41$ and $41 \pmod 3 = 2$, the assembler implements duplicate label detection:
- During the first pass, every label declaration is registered alongside its source line number in a declaration map.
- If a subsequent declaration of the same label occurs, the assembler issues an explicit warning specifying both line numbers:
  `Warning: Duplicate label 'LOOP' found at line 13. First definition is at line 6.`
- The assembler preserves the initial declaration address in the symbol table (avoiding silent overwrites) and continues safe assembly according to university specifications.

---

### PAGE 3 — BOX PROGRAM (`Box.asm`)

#### 1. Geometric and Memory Calculations for $K = 41$
- **Screen Geometry:** 256 rows × 512 pixels. Each row consists of 32 words (each word represents 16 horizontal pixels).
- **Box Dimensions:**
  - Starting row = $K = 41$.
  - Height = 20 screen rows (Rows 41 to 60 inclusive).
  - Width = $16 \times ((K \bmod 4) + 1) = 16 \times (1 + 1) = 32$ pixels.
  - Words per row = 2 words (Word 0 and Word 1 of each row).
- **Memory Address Mapping:**
  - Row 41 starts at: $\text{SCREEN} + (32 \times 41) = 16384 + 1312 =$ **17696**.
  - Row 60 starts at: $\text{SCREEN} + (32 \times 60) = 16384 + 1920 = 18304$.
  - Ending word of the box (Row 60, Word 1) = $18304 + 1 =$ **18305**.

#### 2. Keyboard Input and Dynamic Display Algorithm
The program executes an infinite real-time polling loop:
```text
                  +-------------------------+
                  |    Read RAM[KBD]        |
                  |     (Addr 24576)        |
                  +------------+------------+
                               |
                        [KBD == 0 ?]
                        /          \
                   YES /            \ NO (Key Pressed)
                      v              v
            +----------------+ +-----------------+
            | Set color = 0  | | Set color = -1  |
            | (White/Erase)  | | (Black/Draw)    |
            +-------+--------+ +--------+--------+
                    \                  /
                     \                /
                      v              v
              +-------------------------------+
              | row_addr = 17696 (Row 41)     |
              | rows_left = 20                |
              +---------------+---------------+
                              |
                     +--------v--------+
            +------->| rows_left <= 0? |----+ YES (Finished Frame)
            |        +--------+--------+    |
            |              NO |             v
            |                 v      +---------------+
            |  RAM[row_addr]     = color     | Jump back to  |
            |  RAM[row_addr + 1] = color     |  MAIN_LOOP    |
            |  row_addr  = row_addr + 32     +---------------+
            |  rows_left = rows_left - 1
            +-----------------+
```

#### 3. Hack Assembly Implementation Highlights
- **Keyboard Detection:**
  ```assembly
  (MAIN_LOOP)
      @KBD
      D=M
      @KEY_PRESSED
      D;JNE
  (KEY_RELEASED)
      @color
      M=0
      @DRAW_BOX
      0;JMP
  (KEY_PRESSED)
      @color
      M=-1
  ```
- **Row Drawing & Pointer Arithmetic:**
  ```assembly
  (ROW_LOOP)
      @rows_left
      D=M
      @MAIN_LOOP
      D;JLE
      @color
      D=M
      @row_addr
      A=M
      M=D         // Word 0 (Cols 0..15)
      @row_addr
      A=M+1
      M=D         // Word 1 (Cols 16..31)
      @32
      D=A
      @row_addr
      M=D+M       // Advance by 32 words to next row
      @rows_left
      M=M-1
      @ROW_LOOP
      0;JMP
  ```

---

### PAGE 4 — TESTING, VERIFICATION AND LEARNING

#### 1. HDL Verification Results
All top-level chips were simulated using the official Nand2Tetris Hardware Simulator toolchain. Results are verified against official reference comparison files:

| Target Chip | Test Script | Status | Output Verification Result |
| :--- | :--- | :---: | :--- |
| **CPU.hdl** | `CPU.tst` | **PASS** | `End of script - Comparison ended successfully` |
| **Memory.hdl (RAM & Screen)** | `MemoryRAM.tst` | **PASS** | `End of script - Comparison ended successfully` |
| **Memory.hdl (Interactive)** | `Memory.tst` | **PASS** | Passes interactive keyboard check ('K' and 'Y') in GUI |
| **Computer.hdl (Add)** | `ComputerAdd.tst` | **PASS** | `End of script - Comparison ended successfully` |
| **Computer.hdl (Max)** | `ComputerMax.tst` | **PASS** | `End of script - Comparison ended successfully` |
| **Computer.hdl (Rect)** | `ComputerRect.tst` | **PASS** | `End of script - Comparison ended successfully` |

*Built-in Chip Note:* Standard Project 5 primitive sequential components (`RAM16K`, `Screen`, `Keyboard`, `ROM32K`) were loaded via standard built-in simulator definitions, while `CPU.hdl`, `Memory.hdl`, and `Computer.hdl` represent complete custom HDL implementations.

#### 2. Assembler Bit-for-Bit Verification Results
Our Python assembler was benchmarked against the official Java-based Nand2Tetris assembler across the four benchmark programs:

| Program Name | Generated Instructions | Official Instructions | Bit-for-Bit Match | Status |
| :--- | :---: | :---: | :---: | :--- |
| **Add.asm** | 6 | 6 | **YES** | PASS (100% Match) |
| **Max.asm** | 16 | 16 | **YES** | PASS (100% Match) |
| **Rect.asm** | 25 | 25 | **YES** | PASS (100% Match) |
| **Pong.asm** | 27,483 | 27,483 | **YES** | PASS (100% Match) |

#### 3. Box Program Execution Evidence
- **Automated CPU Emulator Test:** `BoxTest.tst` executed on `Box.hack` in the official Nand2Tetris CPU Emulator:
  - While `KBD = 0`: `RAM[17696]` through `RAM[18305]` are `0`.
  - While `KBD = 75` (Key 'K'): `RAM[17696]` through `RAM[18305]` transition to `-1` (black).
  - While `KBD = 0` (Key released): Words immediately restore to `0` (white).
  - Out-of-bounds boundary words (`RAM[17695]`, `RAM[17698]`, `RAM[18306]`) remain strictly `0`.
  - CPU Emulator comparison reported: `End of script - Comparison ended successfully`.
- **Rendered Visual Evidence:**
  - `evidence/box/box_key_pressed.png`: Demonstrates 32×20 box displayed at row 41.
  - `evidence/box/box_key_released.png`: Demonstrates complete screen blanking upon release.
  - `evidence/box/box_zoomed_detail.png`: Shows pixel-accurate 16× zoom confirming column boundaries [0..31] and row boundaries [41..60].

#### 4. Real Programming Mistake Encountered & Diagnosed
- **Mistake:** During initial drafting of `Box.asm`, row pointer addition was written as:
  ```assembly
  @32
  D=A
  @row_addr
  M=M+D
  ```
- **Symptom & Diagnosis:** When compiling with `assembler.py`, the assembler stopped with a clear diagnostic error:
  `Assembly FAILED: Line 103: Invalid computation mnemonic 'M+D'`
- **Root Cause Analysis:** In the Hack CPU architecture, the ALU hardware accepts `x = D` and `y = A` (or `y = M`). The official ALU computation table explicitly specifies `D+M` (x + y), but does NOT support `M+D` as a valid mnemonic because the hardware multiplexer is asymmetric.
- **Correction:** The instruction was corrected to `M=D+M`. The assembler immediately accepted the line and generated the correct machine instruction (`1111000010001000`).

#### 5. Conclusion
This Capstone Project successfully verified the complete computing stack: from hardware chip design and timing to compiler/assembler construction and machine-level graphics programming. All university acceptance criteria, personal roll number calculations ($K = 41$), and automated test suites passed with 100% accuracy.
