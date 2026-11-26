/**
 * Pure TypeScript Implementation of the Hack Two-Pass Assembler
 * Course: ETCNTC301 - Nand to Tetris - I
 * University: K.R. Mangalam University
 * Personal Parameter: K = 41 (K mod 3 = 2 -> Duplicate Label Detection & Warning)
 *
 * Implements:
 * Pass 1: Comments removal, whitespace normalization, symbol table initialization,
 *         label discovery (LABEL), ROM address tracking, and duplicate label diagnostics.
 * Pass 2: A-instruction encoding, C-instruction encoding, variable allocation from RAM[16],
 *         symbol address resolution, and 16-bit binary instruction generation.
 */

export interface AssemblyResult {
  success: boolean;
  binaryInstructions: string[];
  machineCode: string; // newline-separated
  symbolTable: Record<string, number>;
  labels: Record<string, { address: number; line: number }>;
  variables: Record<string, number>;
  warnings: string[];
  errors: string[];
  stats: {
    sourceLines: number;
    instructionCount: number;
    labelCount: number;
    variableCount: number;
    warningCount: number;
  };
}

// 1. PREDEFINED SYMBOL TABLE
export const INITIAL_SYMBOLS: Record<string, number> = {
  SP: 0,
  LCL: 1,
  ARG: 2,
  THIS: 3,
  THAT: 4,
  SCREEN: 16384,
  KBD: 24576,
  R0: 0,
  R1: 1,
  R2: 2,
  R3: 3,
  R4: 4,
  R5: 5,
  R6: 6,
  R7: 7,
  R8: 8,
  R9: 9,
  R10: 10,
  R11: 11,
  R12: 12,
  R13: 13,
  R14: 14,
  R15: 15,
};

// 2. COMP ENCODING TABLE (a + c1..c6 = 7 bits)
export const COMP_TABLE: Record<string, string> = {
  // a = 0 (ALU operations using register A)
  '0':   '0101010',
  '1':   '0111111',
  '-1':  '0111010',
  'D':   '0001100',
  'A':   '0110000',
  '!D':  '0001101',
  '!A':  '0110001',
  '-D':  '0001111',
  '-A':  '0110011',
  'D+1': '0011111',
  'A+1': '0110111',
  'D-1': '0001110',
  'A-1': '0110010',
  'D+A': '0000010',
  'D-A': '0010011',
  'A-D': '0000111',
  'D&A': '0000000',
  'D|A': '0010101',

  // a = 1 (ALU operations using memory input M)
  'M':   '1110000',
  '!M':  '1110001',
  '-M':  '1110011',
  'M+1': '1110111',
  'M-1': '1110010',
  'D+M': '1000010',
  'D-M': '1010011',
  'M-D': '1000111',
  'D&M': '1000000',
  'D|M': '1010101',
};

// 3. DEST ENCODING TABLE (d1 d2 d3: A D M)
export const DEST_TABLE: Record<string, string> = {
  '':    '000',
  'null':'000',
  'M':   '001',
  'D':   '010',
  'MD':  '011',
  'DM':  '011',
  'A':   '100',
  'AM':  '101',
  'MA':  '101',
  'AD':  '110',
  'DA':  '110',
  'AMD': '111',
  'ADM': '111',
};

// 4. JUMP ENCODING TABLE (j1 j2 j3: <0, =0, >0)
export const JUMP_TABLE: Record<string, string> = {
  '':    '000',
  'null':'000',
  'JGT': '001',
  'JEQ': '010',
  'JGE': '011',
  'JLT': '100',
  'JNE': '101',
  'JLE': '110',
  'JMP': '111',
};

export function assembleHack(asmSource: string): AssemblyResult {
  const warnings: string[] = [];
  const errors: string[] = [];
  const symbolTable: Record<string, number> = { ...INITIAL_SYMBOLS };
  const labels: Record<string, { address: number; line: number }> = {};
  const variables: Record<string, number> = {};

  const rawLines = asmSource.split(/\r?\n/);

  // ---------------------------------------------------------------------------
  // PASS 1: CLEANING, LABEL IDENTIFICATION & DUPLICATE LABEL WARNINGS
  // ---------------------------------------------------------------------------
  interface CleanedLine {
    code: string;
    lineNum: number;
  }

  const instructionLines: CleanedLine[] = [];
  let romAddress = 0;

  for (let i = 0; i < rawLines.length; i++) {
    const lineNum = i + 1;
    // Strip inline comments
    let code = rawLines[i].split('//')[0].trim();
    // Strip inner whitespaces
    code = code.replace(/\s+/g, '');

    if (!code) continue;

    // Check for label: (LABEL)
    if (code.startsWith('(') && code.endsWith(')')) {
      const label = code.slice(1, -1);
      if (!label) {
        errors.push(`Line ${lineNum}: Empty label definition '()'`);
        continue;
      }

      // K mod 3 = 2 requirement: detect duplicate label definition
      if (label in labels) {
        const firstLine = labels[label].line;
        warnings.push(
          `Warning: Duplicate label '${label}' detected at line ${lineNum}. First definition is at line ${firstLine}. Preserving original ROM address ${labels[label].address}.`
        );
      } else {
        labels[label] = { address: romAddress, line: lineNum };
        symbolTable[label] = romAddress;
      }
    } else {
      // Normal instruction (A-instruction or C-instruction)
      instructionLines.push({ code, lineNum });
      romAddress++;
    }
  }

  // ---------------------------------------------------------------------------
  // PASS 2: INSTRUCTION PARSING & BINARY GENERATION
  // ---------------------------------------------------------------------------
  let nextVarAddress = 16;
  const binaryInstructions: string[] = [];

  for (const { code, lineNum } of instructionLines) {
    try {
      if (code.startsWith('@')) {
        // A-INSTRUCTION: @value
        const symbol = code.substring(1);

        if (!symbol) {
          errors.push(`Line ${lineNum}: Empty A-instruction '@'`);
          continue;
        }

        let address: number;

        if (/^\d+$/.test(symbol)) {
          address = parseInt(symbol, 10);
          if (address > 32767) {
            errors.push(
              `Line ${lineNum}: Constant @${address} exceeds Hack 15-bit address limit (0-32767)`
            );
            continue;
          }
        } else {
          // Identifier check: must start with letter/symbol
          if (!/^[a-zA-Z_.$:][a-zA-Z0-9_.$:]*$/.test(symbol)) {
            errors.push(`Line ${lineNum}: Invalid symbol identifier '${symbol}'`);
            continue;
          }

          if (!(symbol in symbolTable)) {
            // Allocate new variable starting at RAM[16]
            symbolTable[symbol] = nextVarAddress;
            variables[symbol] = nextVarAddress;
            nextVarAddress++;
          }
          address = symbolTable[symbol];
        }

        // Format as 16-bit binary with leading 0
        const binary = address.toString(2).padStart(16, '0');
        binaryInstructions.push(binary);
      } else {
        // C-INSTRUCTION: dest=comp;jump
        let destMnemonic = '';
        let compMnemonic = '';
        let jumpMnemonic = '';
        let remaining = code;

        if (remaining.includes('=')) {
          const parts = remaining.split('=');
          destMnemonic = parts[0];
          remaining = parts[1];
        }

        if (remaining.includes(';')) {
          const parts = remaining.split(';');
          compMnemonic = parts[0];
          jumpMnemonic = parts[1];
        } else {
          compMnemonic = remaining;
        }

        // Validate Comp
        if (!(compMnemonic in COMP_TABLE)) {
          errors.push(
            `Line ${lineNum}: Invalid ALU computation mnemonic '${compMnemonic}' in '${code}' (Note: Hack ALU inputs are asymmetric; e.g. use D+M, not M+D)`
          );
          continue;
        }
        const compBits = COMP_TABLE[compMnemonic];

        // Validate Dest
        if (!(destMnemonic in DEST_TABLE)) {
          errors.push(
            `Line ${lineNum}: Invalid destination mnemonic '${destMnemonic}' in '${code}'`
          );
          continue;
        }
        const destBits = DEST_TABLE[destMnemonic];

        // Validate Jump
        if (!(jumpMnemonic in JUMP_TABLE)) {
          errors.push(
            `Line ${lineNum}: Invalid jump mnemonic '${jumpMnemonic}' in '${code}'`
          );
          continue;
        }
        const jumpBits = JUMP_TABLE[jumpMnemonic];

        // Hack C-instruction format: 111 + 7-bit comp + 3-bit dest + 3-bit jump = 16 bits
        const binary = '111' + compBits + destBits + jumpBits;
        binaryInstructions.push(binary);
      }
    } catch (e: any) {
      errors.push(`Line ${lineNum}: Assembly exception - ${e.message || e}`);
    }
  }

  const success = errors.length === 0;

  return {
    success,
    binaryInstructions,
    machineCode: binaryInstructions.join('\n'),
    symbolTable,
    labels,
    variables,
    warnings,
    errors,
    stats: {
      sourceLines: rawLines.length,
      instructionCount: binaryInstructions.length,
      labelCount: Object.keys(labels).length,
      variableCount: Object.keys(variables).length,
      warningCount: warnings.length,
    },
  };
}
