# NAND TO TETRIS CAPSTONE - BOX PROGRAM EXECUTION EVIDENCE
Course: ETCCNT301 - Nand to Tetris - I
University: K.R. Mangalam University
Student Roll Number: 2501730041 (K = 41)

## 1. Box Specifications & Calculated Coordinates
- Roll Number: `2501730041`
- Personal Parameter K: `41`
- K mod 4: `41 mod 4 = 1`
- Starting Row: `Row 41`
- Height: `20 rows` (Row 41 through Row 60)
- Box Width in Pixels: `16 * ((K mod 4) + 1) = 32 pixels` (Columns 0 to 31)
- 16-bit Words per Row: `2 words`
- Starting Screen Address: `SCREEN + 32 * 41 = 16384 + 1312 = 17696`
- Ending Screen Address: `SCREEN + 32 * 60 + 1 = 16384 + 1920 + 1 = 18305`

## 2. Memory State Verification Table

| Screen Memory Address | Location Description | Key Released (RAM=0) | Key Pressed (RAM=-1) | Status |
| :--- | :--- | :---: | :---: | :--- |
| RAM[17695] | Row 40, Word 31 (Row Above) | 0 | 0 | PASS (Unchanged) |
| RAM[17696] | Row 41, Word 0 (Box Top-Left) | 0 | -1 | PASS (Drawn) |
| RAM[17697] | Row 41, Word 1 (Box Top-Right)| 0 | -1 | PASS (Drawn) |
| RAM[17698] | Row 41, Word 2 (Row 41 Outside)| 0 | 0 | PASS (Unchanged) |
| RAM[18304] | Row 60, Word 0 (Box Bot-Left) | 0 | -1 | PASS (Drawn) |
| RAM[18305] | Row 60, Word 1 (Box Bot-Right)| 0 | -1 | PASS (Drawn) |
| RAM[18306] | Row 60, Word 2 (Row 60 Outside)| 0 | 0 | PASS (Unchanged) |
| RAM[18307] | Row 61, Word 0 (Row Below) | 0 | 0 | PASS (Unchanged) |

## 3. Keyboard Dynamic Behavior
1. When KBD = 0 (no key pressed): Program loops in `MAIN_LOOP`, writes `color = 0` to all 40 words, leaving the screen clean.
2. When KBD != 0 (key held): Program sets `color = -1` (0xFFFF), filling rows 41 through 60 with 32 consecutive black pixels.
3. When key is released: KBD immediately reads 0, causing the program to write 0 into all 40 words, cleanly erasing the box.
4. All memory addresses outside the box boundary (17696..18305) remain exactly 0.

## 4. Visual Evidence Artifacts Generated
- `evidence/box/box_key_pressed.png`: Full Hack display (1024x512) with box drawn black at Row 41.
- `evidence/box/box_key_released.png`: Full Hack display cleared (all white pixels).
- `evidence/box/box_zoomed_detail.png`: 16x pixel magnification showing pixel-exact 32x20 rectangular boundary in red.
- `BoxTest.tst` & `BoxTest.out`: Automated CPU Emulator test script and comparison verification output.
