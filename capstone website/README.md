# NAND TO TETRIS CAPSTONE PROJECT: MAKE THE COMPUTER DRAW A BOX
**Course:** Nand to Tetris – I (ETCNTC301 / ETCCNT301)  
**University:** School of Engineering & Technology, K.R. Mangalam University  
**Student Name:** Prithvi Saini  
**University Roll Number:** 2501730041  
**Personal Parameter K:** 41  

---

## 1. Project Overview

This repository contains the complete, tested, and demonstrative implementation of the Nand to Tetris Capstone Project. The project builds a complete computing stack in three integrated milestones:
1. **Hardware Implementation (HDL):** Working implementations of `CPU.hdl`, `Memory.hdl`, and `Computer.hdl`.
2. **Software Toolchain (Python):** An independent two-pass Hack Assembler (`assembler.py`) supporting predefined symbols, label resolution, sequential RAM variable allocation from address 16, and an automated K-dependent feature ($K \bmod 3 = 2$: Duplicate Label Detection).
3. **Application Program (Hack Assembly):** `Box.asm`, an interactive Hack assembly program that continuously monitors keyboard input (`KBD = 24576`) to draw a 32×20 black box starting at Row 41 while a key is held, and erases it when released.

---

## 2. Directory Structure

```text
capstone/
├── HDL/
│   ├── CPU.hdl                     # Complete Hack Central Processing Unit
│   ├── Memory.hdl                  # 32K memory space (RAM16K + Screen + Keyboard)
│   ├── Computer.hdl                # Top-level Hack Computer integration
│   ├── CPU.tst, CPU.cmp            # Official CPU test script & comparison
│   ├── Memory.tst, Memory.cmp      # Official interactive Memory test script
│   ├── MemoryRAM.tst, MemoryRAM.cmp# Automated Memory RAM/Screen test script
│   ├── ComputerAdd.tst, .cmp       # Computer integration test with Add.hack
│   ├── ComputerMax.tst, .cmp       # Computer integration test with Max.hack
│   └── ComputerRect.tst, .cmp      # Computer integration test with Rect.hack
│
├── assembler.py                    # Independent Python two-pass Hack Assembler
│
├── Box.asm                         # Hack Assembly program for the interactive box
├── Box.hack                        # 16-bit binary machine code assembled by assembler.py
├── BoxTest.tst                     # Automated CPU Emulator test script for Box.hack
├── BoxTest.cmp                     # Expected comparison output for Box.hack
├── BoxTest.out                     # Actual CPU Emulator execution log
│
├── test_programs/
│   ├── Add.asm, Add.hack           # Benchmark test 1 (6 instructions)
│   ├── Max.asm, Max.hack           # Benchmark test 2 (16 instructions)
│   ├── Rect.asm, Rect.hack         # Benchmark test 3 (25 instructions)
│   ├── Pong.asm, Pong.hack         # Benchmark test 4 (27,483 instructions)
│   └── DuplicateLabelTest.asm      # Verification program for K mod 3 = 2 feature
│
├── evidence/
│   ├── hdl/                        # HDL simulation logs & comparison outputs
│   ├── assembler/                  # Assembler bit-for-bit comparison reports
│   └── box/                        # Visual screenshots and CPU Emulator logs
│
├── PROJECT_REPORT.md               # 4-page formal project report for ZOSIMA
├── VIVA_PREPARATION.md             # Complete 5-minute viva question & answer guide
└── README.md                       # Comprehensive setup and usage instructions
```

---

## 3. Personal Parameter Calculations ($K = 41$)

- **University Roll Number:** `2501730041`
- **$K$ (last two digits):** `41`
- **$K \bmod 3$:** $41 \bmod 3 =$ **`2`** $\rightarrow$ **Feature:** Duplicate Label Detection with line numbers and warning
- **$K \bmod 4$:** $41 \bmod 4 =$ **`1`**
- **Box Starting Row:** $K =$ **`Row 41`**
- **Box Height:** **`20 screen rows`** (Row 41 through Row 60)
- **Box Width in Pixels:** $16 \times ((K \bmod 4) + 1) = 16 \times (1 + 1) =$ **`32 pixels`** (Columns 0 to 31)
- **16-bit Words per Row:** $(K \bmod 4) + 1 =$ **`2 words`**
- **Starting Screen Memory Address:** $\text{SCREEN} + (32 \times K) = 16384 + (32 \times 41) =$ **`17696`**
- **Ending Screen Row:** $K + 19 = 41 + 19 =$ **`Row 60`**
- **Ending Screen Memory Address:** $\text{SCREEN} + (32 \times 60) + 1 = 16384 + 1920 + 1 =$ **`18305`**

---

## 4. How to Test HDL Chips

You can test the HDL chips using the Nand2Tetris Hardware Simulator:

### Interactive Testing (GUI Mode)
1. Open the Hardware Simulator:
   ```cmd
   T:\nandtotertris\official_nand2tetris\tools\HardwareSimulator.bat
   ```
2. Click **File -> Load Script** and navigate to `capstone/HDL/CPU.tst` (or `Memory.tst`, `ComputerAdd.tst`).
3. Set the animation speed slider to fast and click **Run**.
4. When running `Memory.tst`, hold down the 'K' and 'Y' keys when prompted to verify the Keyboard register.

### Automated Testing (Command Line)
To execute tests directly in batch mode and verify comparison results:
```powershell
cd T:\nandtotertris\official_nand2tetris\tools
java -cp "C:\Users\saini\.gemini\antigravity\brain\0607bb33-baa7-4f87-9b70-7c69cf082c72\scratch;.;bin\classes;bin\lib\*" RunHW "T:\nandtotertris\capstone\HDL\CPU.tst"
java -cp "C:\Users\saini\.gemini\antigravity\brain\0607bb33-baa7-4f87-9b70-7c69cf082c72\scratch;.;bin\classes;bin\lib\*" RunHW "T:\nandtotertris\capstone\HDL\MemoryRAM.tst"
java -cp "C:\Users\saini\.gemini\antigravity\brain\0607bb33-baa7-4f87-9b70-7c69cf082c72\scratch;.;bin\classes;bin\lib\*" RunHW "T:\nandtotertris\capstone\HDL\ComputerAdd.tst"
java -cp "C:\Users\saini\.gemini\antigravity\brain\0607bb33-baa7-4f87-9b70-7c69cf082c72\scratch;.;bin\classes;bin\lib\*" RunHW "T:\nandtotertris\capstone\HDL\ComputerMax.tst"
java -cp "C:\Users\saini\.gemini\antigravity\brain\0607bb33-baa7-4f87-9b70-7c69cf082c72\scratch;.;bin\classes;bin\lib\*" RunHW "T:\nandtotertris\capstone\HDL\ComputerRect.tst"
```
**Expected Output:** Each test displays `End of script - Comparison ended successfully`.

---

## 5. How to Run the Python Assembler

The assembler is an independent Python script requiring no external libraries (pure standard Python 3):

```powershell
# Basic usage (outputs .hack next to source file)
python capstone/assembler.py capstone/Box.asm

# Explicit output file
python capstone/assembler.py capstone/test_programs/Add.asm capstone/test_programs/Add.hack

# Test the K mod 3 = 2 Duplicate Label Detection feature:
python capstone/assembler.py capstone/test_programs/DuplicateLabelTest.asm
```

**Terminal Output Example:**
```text
==================================================
 Hack Two-Pass Assembler
 Student Roll No: 2501730041 | K = 41 (K mod 3 = 2)
 Duplicate Label Detection Enabled
==================================================
Input file: capstone/test_programs/DuplicateLabelTest.asm
Warning: Duplicate label 'LOOP' found at line 13. First definition is at line 6.
Warning: Duplicate label 'END' found at line 21. First definition is at line 18.
--------------------------------------------------
Source lines:          23
Machine instructions:  16
Unique labels:         2
Duplicate warnings:    2
Variables allocated:   2
Output saved to:       capstone/test_programs/DuplicateLabelTest.hack
Status:                SUCCESS
==================================================
```

---

## 6. How to Run and Test `Box.asm`

### Step 1: Assemble `Box.asm` into `Box.hack`
```powershell
cd T:\nandtotertris\capstone
python assembler.py Box.asm Box.hack
```

### Step 2: Run in CPU Emulator (GUI)
1. Open the CPU Emulator:
   ```cmd
   T:\nandtotertris\official_nand2tetris\tools\CPUEmulator.bat
   ```
2. Click **File -> Load Program** and open `capstone/Box.hack`.
3. Set **Animate** to "No animation" and speed to Fast.
4. Click the **Run** button.
5. Click on the **Keyboard** icon in the emulator:
   - Hold down any keyboard key: A 32×20 black rectangular box appears at row 41 on the left edge.
   - Release the key: The box immediately disappears.

### Step 3: Run the Automated Verification Script
Run the automated test script that verifies screen memory addresses and keyboard reactions:
```powershell
cd T:\nandtotertris\official_nand2tetris\tools
java -cp "C:\Users\saini\.gemini\antigravity\brain\0607bb33-baa7-4f87-9b70-7c69cf082c72\scratch;.;bin\classes;bin\lib\*" RunCPU "T:\nandtotertris\capstone\BoxTest.tst"
```
**Result:** Displays `End of script - Comparison ended successfully`.

---

## 7. Verification Summary

| Component | Test Case | Target / Reference | Result | Status |
| :--- | :--- | :--- | :--- | :---: |
| **CPU** | `CPU.tst` | `CPU.cmp` | Exact match | **PASS** |
| **Memory** | `MemoryRAM.tst` | `MemoryRAM.cmp` | Exact match | **PASS** |
| **Computer** | `ComputerAdd.tst` | `ComputerAdd.cmp` | Exact match | **PASS** |
| **Computer** | `ComputerMax.tst` | `ComputerMax.cmp` | Exact match | **PASS** |
| **Computer** | `ComputerRect.tst` | `ComputerRect.cmp` | Exact match | **PASS** |
| **Assembler** | `Add.asm` (6 instrs) | Official `Add.hack` | Bit-for-bit match | **PASS** |
| **Assembler** | `Max.asm` (16 instrs) | Official `Max.hack` | Bit-for-bit match | **PASS** |
| **Assembler** | `Rect.asm` (25 instrs) | Official `Rect.hack` | Bit-for-bit match | **PASS** |
| **Assembler** | `Pong.asm` (27,483 instrs)| Official `Pong.hack` | Bit-for-bit match | **PASS** |
| **Feature** | `DuplicateLabelTest.asm` | Line warnings | Warning emitted, safe | **PASS** |
| **Box Program** | `BoxTest.tst` | `BoxTest.cmp` | Exact memory match | **PASS** |

---

## 8. Required Software & Tools

- **Java Runtime Environment (JRE/JDK):** Java 11 or higher (OpenJDK / Oracle JDK) for running the Nand2Tetris Hardware Simulator and CPU Emulator.
- **Python:** Python 3.8 or higher for running `assembler.py`.
- **Operating System:** Windows, macOS, or Linux.
