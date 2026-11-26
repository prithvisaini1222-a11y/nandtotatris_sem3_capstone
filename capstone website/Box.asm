// =============================================================================
// Nand to Tetris - Capstone Project
// MAKE THE COMPUTER DRAW A BOX
// Course: ETCCNT301 - Nand to Tetris - I
// University: K.R. Mangalam University
// Student Roll Number: 2501730041
//
// PARAMETERS CALCULATED FROM ROLL NUMBER:
// - University Roll Number: 2501730041
// - K (last two digits): 41
// - K mod 3: 41 mod 3 = 2 (Duplicate Label Detection in Assembler)
// - K mod 4: 41 mod 4 = 1
//
// BOX SPECIFICATIONS:
// - Starting row: K = 41
// - Height: 20 rows (rows 41 to 60)
// - Width in pixels: 16 * ((K mod 4) + 1) = 16 * (1 + 1) = 32 pixels
// - Words per row: (K mod 4) + 1 = 2 words (16 bits each = 32 bits total)
// - Horizontal alignment: Left edge of screen (word offset 0 and 1)
// - Starting screen address: SCREEN + (32 * K) = 16384 + (32 * 41) = 17696
// - Ending screen row: 41 + 19 = 60
// - Ending screen address: SCREEN + (32 * 60) + 1 = 16384 + 1920 + 1 = 18305
//
// BEHAVIOUR:
// - Continuously monitors keyboard input at address KBD (24576).
// - While any key is pressed (RAM[KBD] != 0), the box is drawn black (-1).
// - When the key is released (RAM[KBD] == 0), the box is erased to white (0).
// =============================================================================

(MAIN_LOOP)
    // -------------------------------------------------------------------------
    // Step 1: Check keyboard input
    // -------------------------------------------------------------------------
    @KBD
    D=M                 // D = current key code from keyboard register (RAM[24576])
    @KEY_PRESSED
    D;JNE               // If D != 0 (key is pressed), jump to KEY_PRESSED

(KEY_RELEASED)
    // Key is released -> set color to white (0)
    @color
    M=0                 // color = 0 (white / erase)
    @DRAW_BOX
    0;JMP

(KEY_PRESSED)
    // Key is pressed -> set color to black (-1 = 0xFFFF)
    @color
    M=-1                // color = -1 (black / draw all 16 pixels per word)

(DRAW_BOX)
    // -------------------------------------------------------------------------
    // Step 2: Initialize box parameters
    // Starting row address = SCREEN + (32 * 41) = 17696
    // Row count = 20
    // -------------------------------------------------------------------------
    @17696
    D=A
    @row_addr
    M=D                 // row_addr = 17696 (starting address of box at row 41)

    @20
    D=A
    @rows_left
    M=D                 // rows_left = 20 (height of box)

(ROW_LOOP)
    // -------------------------------------------------------------------------
    // Step 3: Check if all 20 rows are completed
    // -------------------------------------------------------------------------
    @rows_left
    D=M
    @MAIN_LOOP
    D;JLE               // If rows_left <= 0, return to main keyboard check loop

    // -------------------------------------------------------------------------
    // Step 4: Draw current row (Words per row = 2, total 32 pixels wide)
    // Word 0: columns 0 to 15 (at row_addr)
    // Word 1: columns 16 to 31 (at row_addr + 1)
    // -------------------------------------------------------------------------
    @color
    D=M                 // D = fill color (-1 for black, 0 for white)

    // Write Word 0
    @row_addr
    A=M
    M=D                 // RAM[row_addr] = color (pixels 0..15)

    // Write Word 1
    @row_addr
    A=M+1
    M=D                 // RAM[row_addr + 1] = color (pixels 16..31)

    // -------------------------------------------------------------------------
    // Step 5: Advance to the next row
    // Each screen row consists of 32 words (512 pixels / 16 = 32 words)
    // row_addr = row_addr + 32
    // rows_left = rows_left - 1
    // -------------------------------------------------------------------------
    @32
    D=A
    @row_addr
    M=D+M               // row_addr = row_addr + 32 (Hack ALU uses D+M)

    @rows_left
    M=M-1               // rows_left = rows_left - 1

    @ROW_LOOP
    0;JMP               // Continue loop for next row
