# NAND TO TETRIS CAPSTONE — VIVA PREPARATION GUIDE
**Student Name:** Prithvi Saini  
**Roll Number:** 2501730041  
**Personal Parameter K:** 41 ($K \bmod 3 = 2$, $K \bmod 4 = 1$)  
**Course:** ETCNTC301 / ETCCNT301 — Nand to Tetris – I  
**University:** School of Engineering & Technology, K.R. Mangalam University  

---

## SECTION A — HACK COMPUTER ARCHITECTURE

### 1. What is a Hack computer?
**Answer:** The Hack computer is a 16-bit Von Neumann computer architecture designed in the Nand to Tetris course. It contains a CPU, an instruction memory (`ROM32K`), and a unified data memory (`Memory`) mapped to 16K of RAM, 8K of display Screen, and 1 Keyboard input register. It executes two types of 16-bit instructions: A-instructions (addressing) and C-instructions (computation and branching).

### 2. What is the function of `CPU.hdl`?
**Answer:** `CPU.hdl` is the central execution unit. It fetches a 16-bit instruction from ROM, decodes whether it is an A-instruction or C-instruction, directs data between registers and the ALU, performs arithmetic/logic operations, computes condition flags (`zr` and `ng`), writes results to Memory when required, and determines the next instruction address for the Program Counter (`PC`).

### 3. What is the function of `Memory.hdl`?
**Answer:** `Memory.hdl` implements the complete 32K data address space using address decoding:
- `0` to `16383` (`0x0000` to `0x3FFF`): General purpose Data RAM (`RAM16K`).
- `16384` to `24575` (`0x4000` to `0x5FFF`): Memory-mapped display buffer (`Screen`).
- `24576` (`0x6000`): Memory-mapped keyboard register (`Keyboard`).
It ensures write operations only alter the addressed device (and never write to the read-only Keyboard), while reading is multiplexed using address bits `address[13..14]`.

### 4. Why do we need `Computer.hdl`?
**Answer:** `Computer.hdl` is the top-level chip that interconnects the CPU, ROM32K, and Memory into a functional system. It routes the CPU's `pc` to the ROM address bus, feeds the fetched `instruction` into the CPU, and connects data lines (`outM`, `inM`, `addressM`, `writeM`) between CPU and Memory. It also exposes the master `reset` input.

### 5. What is the role of the ALU?
**Answer:** The Arithmetic Logic Unit (ALU) performs 16-bit arithmetic (addition, increment, negation) and logical (AND, OR, NOT) operations on two inputs: $x$ (from the D-register) and $y$ (from either the A-register or external memory `inM`). It is controlled by 6 control bits (`zx, nx, zy, ny, f, no`) and emits two status flags: `zr` (1 if output is zero) and `ng` (1 if output is negative).

### 6. What is the role of the A and D registers?
**Answer:** 
- **D-Register (Data Register):** Stores intermediate data values exclusively for ALU operations.
- **A-Register (Address/Data Register):** Dual-purpose register. It can store a 15-bit constant, an address pointer to access RAM/Screen (`inM = RAM[A]`), or a jump target address for the Program Counter (`PC`).

### 7. What does the Program Counter (PC) do?
**Answer:** The Program Counter keeps track of the ROM address of the next instruction to fetch and execute. In each cycle:
- If `reset == 1`: PC is set to 0.
- Else if `load == 1` (jump condition met): PC loads the address stored in the A-register.
- Else (`inc == 1`): PC increments by 1 for normal sequential execution.

### 8. How do jump instructions work?
**Answer:** C-instructions have 3 jump bits (`j1, j2, j3`). The CPU compares these bits against the ALU output flags:
- `j1` checks if output is negative (`ng == 1`).
- `j2` checks if output is zero (`zr == 1`).
- `j3` checks if output is positive (`!zr && !ng == 1`).
If the condition evaluates to true on a C-instruction, `loadPC` is asserted, causing `PC` to load the value currently in register `A`.

---

## SECTION B — PYTHON ASSEMBLER (`assembler.py`)

### 1. What is an assembler?
**Answer:** An assembler is a software translator that converts human-readable symbolic assembly code (`.asm`) into binary machine language code (`.hack`) that can be executed directly by hardware logic.

### 2. What is machine code?
**Answer:** Machine code is a sequence of binary instructions composed purely of `0`s and `1`s. In Hack, each machine instruction is exactly 16 bits wide.

### 3. Why do we use two passes?
**Answer:** We need two passes to resolve **forward references** (jumping forward to a label defined later in the code). In a single pass, when the assembler sees `@LOOP` before `(LOOP)` has appeared, it does not know what ROM address `LOOP` will have. The first pass records all label addresses; the second pass can then translate all instructions knowing every target address.

### 4. What happens during the first pass?
**Answer:** 
1. Strips comments (`//...`) and whitespace, ignoring blank lines.
2. Tracks original source line numbers for diagnostic reporting.
3. Keeps a ROM instruction counter starting at 0.
4. When encountering a label like `(LOOP)`, it maps `LOOP -> current ROM address` in the symbol table.
5. Checks for duplicate label declarations ($K \bmod 3 = 2$ feature).
6. Labels do not advance the ROM counter.

### 5. How are labels resolved?
**Answer:** A label `(MY_LABEL)` points to the ROM address of the very next actual instruction. In the second pass, any A-instruction referring to `@MY_LABEL` is replaced by `@ROM_ADDR`, which is encoded as a 15-bit binary number with a leading 0.

### 6. How are variables allocated?
**Answer:** In the second pass, if an A-instruction `@symbol` is neither a decimal number, nor a predefined symbol, nor an existing label, it is treated as a variable. New variables are assigned free sequential RAM addresses starting at address **16** (`RAM[16]`, `RAM[17]`, `RAM[18]`, etc.).

### 7. How does the assembler encode C-instructions?
**Answer:** A C-instruction `dest=comp;jump` is encoded into 16 bits:
- Bits 15–13: Fixed opcode `111`.
- Bits 12–6: 1 bit for `a` and 6 bits for `c1..c6` (from `COMP_TABLE`).
- Bits 5–3: 3 bits for `d1..d3` (from `DEST_TABLE`).
- Bits 2–0: 3 bits for `j1..j3` (from `JUMP_TABLE`).

### 8. What is my K-based additional feature?
**Answer:** My personal roll number is `2501730041`, so $K = 41$ and $41 \pmod 3 = 2$.
The feature is **Duplicate Label Detection**:
- If a label declaration like `(LOOP)` appears more than once, the assembler prints a warning:
  `Warning: Duplicate label 'LOOP' found at line 13. First definition is at line 6.`
- The assembler retains the original address definition (avoiding silent overwrites) and continues safe assembly without crashing.

---

## SECTION C — SCREEN MEMORY & DISPLAY

### 1. What is SCREEN?
**Answer:** `SCREEN` is a predefined Hack symbol with value **16384** (`0x4000`). It represents the starting address of the memory-mapped display buffer in RAM.

### 2. Why does screen memory start at 16384?
**Answer:** Because the lower 16K words (`0` to `16383`) are allocated for general-purpose Data RAM (`RAM16K`). Address 16384 is the first address where bit 14 is `1` (`0100 0000 0000 0000`), cleanly separating I/O devices from data memory.

### 3. Why are there 32 words in one screen row?
**Answer:** The Hack screen resolution is **512 pixels wide × 256 pixels high**. Each memory word holds 16 bits, representing 16 horizontal pixels. Therefore, one screen row requires:
$$\frac{512 \text{ pixels}}{16 \text{ pixels/word}} = 32 \text{ words per row}$$

### 4. Why does each word represent 16 pixels?
**Answer:** The Hack computer has a 16-bit word length. In the screen memory map, each bit directly maps to one pixel on the screen: bit 0 is the leftmost pixel of that 16-pixel chunk, and bit 15 is the rightmost.

### 5. What does `-1` do?
**Answer:** In 16-bit two's complement arithmetic, `-1` has the binary representation `1111 1111 1111 1111` (`0xFFFF`). Writing `-1` turns all 16 pixels in that memory word completely **black**.

### 6. What does `0` do?
**Answer:** `0` has the binary representation `0000 0000 0000 0000`. Writing `0` turns all 16 pixels in that memory word completely **white** (clearing/erasing the pixels).

### 7. How is the box starting address calculated?
**Answer:** For roll number `2501730041`, $K = 41$. The box starts at row 41 from the extreme left edge (offset 0):
$$\text{Starting Address} = \text{SCREEN} + (32 \times K) = 16384 + (32 \times 41) = 16384 + 1312 = \mathbf{17696}$$

---

## SECTION D — BOX PROGRAM (`Box.asm`)

### 1. How does keyboard checking work?
**Answer:** The program reads memory location `KBD` (`RAM[24576]`). If no key is pressed, hardware sets `RAM[KBD] = 0`. If any key is pressed, it contains that key's non-zero ASCII code. The code executes:
```assembly
@KBD
D=M
@KEY_PRESSED
D;JNE
```
If `D != 0`, it branches to set `color = -1`; if `D == 0`, it sets `color = 0`.

### 2. How is the box drawn?
**Answer:** 
1. `color` is set to `-1` (`0xFFFF`).
2. `row_addr` is initialized to `17696` (Row 41).
3. `rows_left` is initialized to `20`.
4. In `ROW_LOOP`, it writes `color` to `RAM[row_addr]` (Word 0: cols 0..15) and `RAM[row_addr + 1]` (Word 1: cols 16..31).
5. It advances `row_addr = row_addr + 32` and decrements `rows_left = rows_left - 1`.
6. Repeats until all 20 rows are filled with 32 black pixels.

### 3. How is the box erased?
**Answer:** Exactly the same loop runs, but `color` is set to `0`. Writing `0` to words at `row_addr` and `row_addr + 1` across all 20 rows restores the pixels back to white.

### 4. How are the loops implemented?
**Answer:** 
- `MAIN_LOOP`: An infinite polling loop that continuously reads `KBD`, sets the color, calls the box draw/erase routine, and jumps back to `MAIN_LOOP`.
- `ROW_LOOP`: A counted loop using variable `rows_left`. When `rows_left <= 0` (`D;JLE`), the loop terminates and branches back to `MAIN_LOOP`.

### 5. On-the-spot viva modification: How can the box be moved down?
**Answer:** To move the box down, change the starting row address in `Box.asm`.
- For example, to move the box down by 10 rows (from row 41 to row 51):
  $$\text{New Address} = \text{SCREEN} + (32 \times 51) = 16384 + 1632 = \mathbf{18016}$$
- In code, change:
  ```assembly
  @17696      // Change this
  D=A
  ```
  to:
  ```assembly
  @18016      // New starting row address
  D=A
  ```

### 6. On-the-spot viva modification: How can the box width be changed?
**Answer:** 
- To make the box 48 pixels wide instead of 32 (3 words instead of 2):
  Add a write to Word 2 inside `ROW_LOOP`:
  ```assembly
  @row_addr
  A=M+1
  A=A+1       // row_addr + 2
  M=D         // Word 2 (cols 32..47)
  ```
- Or write a nested loop that iterates a `words_left` counter for each row.

---

## SECTION E — 10 LIKELY VIVA QUESTIONS & CONFIDENT ANSWERS

#### Q1: "Show me where K is used in your HDL."
**Answer:** "Sir/Ma'am, $K$ is a software and application parameter, not a hardware chip parameter. The Hack hardware platform (`CPU.hdl`, `Memory.hdl`, `Computer.hdl`) is general-purpose. $K$ is used in my Python assembler feature ($K \bmod 3 = 2$ for duplicate label detection) and in `Box.asm` where $K = 41$ sets the starting row and address (`17696`)."

#### Q2: "Why did you use `RAM16K` instead of building custom RAM from individual bits?"
**Answer:** "The Hack architecture builds hierarchical memory (`Bit` $\rightarrow$ `Register` $\rightarrow$ `RAM8` $\rightarrow$ `RAM64` $\rightarrow$ `RAM512` $\rightarrow$ `RAM4K` $\rightarrow$ `RAM16K`). In Project 5, `RAM16K` is loaded via the official built-in chip so the hardware simulator can run fast simulations without simulating 262,144 individual flip-flop gates."

#### Q3: "What happens if someone presses two keys at once on the Hack keyboard?"
**Answer:** "The Hack keyboard hardware register only holds the scan code of a single pressed key at address 24576. In our program, we only test whether `RAM[KBD] != 0`. Any key press produces a non-zero value, so pressing any key or multiple keys draws the box."

#### Q4: "Why did your assembler fail when you originally wrote `M=M+D`?"
**Answer:** "Because the Hack ALU has asymmetric inputs: the $x$ input is hardwired to the D-register and the $y$ input comes from A or M. The Hack machine instruction set defines the computation mnemonic as `D+M` ($x+y$), not `M+D`. The assembler caught this as an invalid mnemonic, which I diagnosed and corrected to `M=D+M`."

#### Q5: "How does your assembler detect duplicate labels?"
**Answer:** "In `first_pass()`, I maintain a dictionary `label_decl_lines` that maps each label to the source line number where it was first declared. If a label is seen again, I issue a warning displaying both line numbers (`Warning: Duplicate label '...' at line X. First definition is at line Y.`), and I preserve the first address so the symbol table isn't corrupted."

#### Q6: "Why does the box start from column 0?"
**Answer:** "The specification defines the box starting from the extreme left edge of the screen. Since row 41 begins at address 17696, writing into word 0 (17696) and word 1 (17697) draws the box precisely in pixels 0 to 31, aligning with the left border."

#### Q7: "What is the difference between `@17696` and `@row_addr`?"
**Answer:** "`@17696` is a constant address pointing directly to screen memory. `@row_addr` is a variable allocated in data RAM at address 17. The program stores the value `17696` inside `RAM[row_addr]`, and uses pointer dereferencing (`A=M`) to access the screen word."

#### Q8: "How does the computer know whether an address refers to RAM or Screen?"
**Answer:** "Through address decoding in `Memory.hdl`. Address bit 14 acts as the selector: if `address[14] == 0`, it accesses RAM (addresses 0..16383). If `address[14] == 1` and `address[13] == 0`, it accesses the Screen (addresses 16384..24575)."

#### Q9: "Why does your assembler allocate variables starting at address 16?"
**Answer:** "Because RAM addresses 0 through 15 are reserved for predefined virtual registers: `R0` through `R15`, which also alias `SP` (0), `LCL` (1), `ARG` (2), `THIS` (3), and `THAT` (4). User variables must begin at `RAM[16]` according to the Hack specification."

#### Q10: "If you want to make the box taller, say 40 rows instead of 20, what single line would you change?"
**Answer:** "In `Box.asm`, change `@20` under `(DRAW_BOX)` to `@40` (`@40; D=A; @rows_left; M=D`). The row loop will then run for 40 consecutive rows."
