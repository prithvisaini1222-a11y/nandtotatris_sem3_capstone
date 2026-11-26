// K Calculator & Dynamic Parameter Engine
// Official Capstone Project: Nand to Tetris - I (ETCCNT301)
// School of Engineering & Technology, K.R. Mangalam University

export interface KParameters {
  rollNumber: string;
  K: number;
  kMod3: number;
  kMod4: number;
  boxStartingRow: number;
  boxHeight: number;
  boxWidthPixels: number;
  wordsPerRow: number;
  startingScreenAddress: number;
  endingScreenRow: number;
  endingScreenAddress: number;
  featureDescription: string;
}

export function calculateK(rollNumberInput: string): KParameters {
  const digits = rollNumberInput.replace(/\D/g, '');
  let kVal = 41; // default to student K (Roll: 2501730041 -> K = 41)
  if (digits.length >= 2) {
    kVal = parseInt(digits.slice(-2), 10);
  } else if (digits.length === 1) {
    kVal = parseInt(digits, 10);
  }

  const kMod3 = kVal % 3;
  const kMod4 = kVal % 4;
  const boxStartingRow = kVal;
  const boxHeight = 20;
  const wordsPerRow = kMod4 + 1;
  const boxWidthPixels = 16 * wordsPerRow;
  const startingScreenAddress = 16384 + (32 * kVal);
  const endingScreenRow = kVal + 19;
  const endingScreenAddress = 16384 + (32 * endingScreenRow) + wordsPerRow - 1;

  let featureDescription = '';
  if (kMod3 === 0) {
    featureDescription = 'Case 0: Save all labels and variables with their addresses in symbols.txt.';
  } else if (kMod3 === 1) {
    featureDescription = 'Case 1: Print clear invalid-instruction errors with 1-based original line numbers.';
  } else {
    featureDescription = 'Case 2: Print a warning if the same label is written twice (preserving initial definition).';
  }

  return {
    rollNumber: rollNumberInput || '2501730041',
    K: kVal,
    kMod3,
    kMod4,
    boxStartingRow,
    boxHeight,
    boxWidthPixels,
    wordsPerRow,
    startingScreenAddress,
    endingScreenRow,
    endingScreenAddress,
    featureDescription,
  };
}

export function generateBoxAsm(params: KParameters): string {
  return `// =============================================================================
// Nand to Tetris - Capstone Project
// MAKE THE COMPUTER DRAW A BOX
// Course: ETCCNT301 - Nand to Tetris - I
// University: K.R. Mangalam University
// Student Roll Number: ${params.rollNumber}
// Personal Number K = ${params.K} (K mod 3 = ${params.kMod3}, K mod 4 = ${params.kMod4})
//
// Box Specs: Row ${params.boxStartingRow}, Height 20, Width ${params.boxWidthPixels}px (${params.wordsPerRow} words)
// Starting Address: ${params.startingScreenAddress} | Ending Address: ${params.endingScreenAddress}
// =============================================================================

(MAIN_LOOP)
    @KBD
    D=M                 // Read keyboard register (RAM[24576])
    @KEY_PRESSED
    D;JNE               // If key pressed (D != 0), jump to KEY_PRESSED

(KEY_RELEASED)
    @color
    M=0                 // color = 0 (white / erase)
    @DRAW_BOX
    0;JMP

(KEY_PRESSED)
    @color
    M=-1                // color = -1 (black / draw)

(DRAW_BOX)
    @${params.startingScreenAddress}
    D=A
    @row_addr
    M=D                 // row_addr = ${params.startingScreenAddress}

    @20
    D=A
    @rows_left
    M=D                 // rows_left = 20

(ROW_LOOP)
    @rows_left
    D=M
    @MAIN_LOOP
    D;JLE               // Loop completed, return to keyboard polling

    @color
    D=M

    // Write ${params.wordsPerRow} words for this row
    @row_addr
    A=M
    M=D                 // Word 0 (pixels 0..15)${params.wordsPerRow > 1 ? `

    @row_addr
    A=M+1
    M=D                 // Word 1 (pixels 16..31)` : ''}${params.wordsPerRow > 2 ? `

    @row_addr
    A=M+1
    A=A+1
    M=D                 // Word 2 (pixels 32..47)` : ''}

    // Advance to next row (32 words per row in 512-pixel screen)
    @32
    D=A
    @row_addr
    M=D+M               // row_addr += 32

    @rows_left
    M=M-1

    @ROW_LOOP
    0;JMP
`;
}
