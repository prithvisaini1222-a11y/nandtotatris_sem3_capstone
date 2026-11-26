#!/usr/bin/env python3
"""
Hack Computer Assembler (Nand to Tetris)
Course: ETCCNT301 - Nand to Tetris - I
University: K.R. Mangalam University
Student Roll Number: 2501730041
Personal Number K = 41 (K mod 3 = 2 -> Duplicate Label Detection)

This assembler translates Hack assembly language programs (.asm) into
16-bit binary machine code (.hack) in two passes:
- Pass 1: Strips comments/whitespace, tracks source line numbers, builds
          the symbol table for label definitions (LABEL), and detects duplicate
          labels with warnings (K mod 3 = 2 requirement).
- Pass 2: Encodes A-instructions and C-instructions into 16-bit binary,
          allocating variables starting at RAM[16].
"""

import sys
import os
import re

# =============================================================================
# 1. PREDEFINED SYMBOLS & INSTRUCTION ENCODING TABLES
# =============================================================================

INITIAL_SYMBOL_TABLE = {
    'SP': 0,
    'LCL': 1,
    'ARG': 2,
    'THIS': 3,
    'THAT': 4,
    'SCREEN': 16384,
    'KBD': 24576,
    'R0': 0, 'R1': 1, 'R2': 2, 'R3': 3,
    'R4': 4, 'R5': 5, 'R6': 6, 'R7': 7,
    'R8': 8, 'R9': 9, 'R10': 10, 'R11': 11,
    'R12': 12, 'R13': 13, 'R14': 14, 'R15': 15,
}

# Computation bit patterns: comp_mnemonic -> (a_bit, c1..c6)
# Concatenated string of 7 bits: 'a' + 'c1c2c3c4c5c6'
COMP_TABLE = {
    # a = 0 (ALU operations with register A)
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

    # a = 1 (ALU operations with memory input M)
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
}

# Destination bit patterns: d1 d2 d3 (A D M)
DEST_TABLE = {
    None:  '000',
    '':    '000',
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
}

# Jump bit patterns: j1 j2 j3 (<0, =0, >0)
JUMP_TABLE = {
    None:  '000',
    '':    '000',
    'JGT': '001',
    'JEQ': '010',
    'JGE': '011',
    'JLT': '100',
    'JNE': '101',
    'JLE': '110',
    'JMP': '111',
}


# =============================================================================
# 2. LINE CLEANING & NORMALIZATION
# =============================================================================

def clean_lines(raw_lines):
    """
    Strips inline comments (//...), leading/trailing whitespace, and ignores blank lines.
    Preserves 1-based original source line numbers for diagnostic error and warning reporting.
    
    Returns a list of tuples: (cleaned_line, original_line_number)
    """
    cleaned = []
    for line_idx, raw_line in enumerate(raw_lines, start=1):
        # Strip comments
        code = raw_line.split('//')[0].strip()
        # Remove inner whitespace that might disrupt tokens
        code = re.sub(r'\s+', '', code)
        if code:
            cleaned.append((code, line_idx))
    return cleaned


# =============================================================================
# 3. FIRST PASS: LABEL PROCESSING & DUPLICATE-LABEL DETECTION (K mod 3 = 2)
# =============================================================================

def first_pass(cleaned_lines):
    """
    Performs the first pass over cleaned assembly instructions:
    - Identifies label declarations of the form `(LABEL)`.
    - Maps each label to the current ROM instruction address.
    - Labels themselves do not increment the ROM address.
    - Detects duplicate labels (K mod 3 = 2 requirement):
      Prints a clear warning showing the duplicate line number and first definition line.
      Maintains the first definition address (does not overwrite).
    
    Returns:
    - symbol_table: dict containing predefined symbols and resolved label addresses
    - instruction_lines: list of (line, original_line_number) containing only actual instructions
    - label_stats: dict with count of unique labels and warnings
    """
    symbol_table = dict(INITIAL_SYMBOL_TABLE)
    label_decl_lines = {}  # label_name -> first_seen_original_line_number
    duplicate_warnings = []

    rom_address = 0
    instruction_lines = []

    for code, line_num in cleaned_lines:
        if code.startswith('(') and code.endswith(')'):
            label = code[1:-1]
            if not label:
                raise ValueError(f"Line {line_num}: Empty label declaration '()'")

            # Duplicate label detection check (K mod 3 = 2)
            if label in label_decl_lines:
                first_line = label_decl_lines[label]
                warning_msg = (
                    f"Warning: Duplicate label '{label}' found at line {line_num}. "
                    f"First definition is at line {first_line}."
                )
                print(warning_msg)
                duplicate_warnings.append(warning_msg)
                # Policy: Retain the first definition, do not overwrite symbol_table
            else:
                label_decl_lines[label] = line_num
                symbol_table[label] = rom_address
        else:
            # Normal instruction (A-instruction or C-instruction)
            instruction_lines.append((code, line_num))
            rom_address += 1

    label_stats = {
        'unique_labels': len(label_decl_lines),
        'duplicate_warnings': duplicate_warnings,
        'rom_instructions': rom_address
    }

    return symbol_table, instruction_lines, label_stats


# =============================================================================
# 4. ENCODING HELPERS
# =============================================================================

def encode_comp(comp_mnemonic, line_num):
    """Encodes computation mnemonic into 7 bits (a + c1..c6)."""
    if comp_mnemonic not in COMP_TABLE:
        raise ValueError(f"Line {line_num}: Invalid computation mnemonic '{comp_mnemonic}'")
    return COMP_TABLE[comp_mnemonic]


def encode_dest(dest_mnemonic, line_num):
    """Encodes destination mnemonic into 3 bits (d1 d2 d3)."""
    if dest_mnemonic not in DEST_TABLE:
        raise ValueError(f"Line {line_num}: Invalid destination mnemonic '{dest_mnemonic}'")
    return DEST_TABLE[dest_mnemonic]


def encode_jump(jump_mnemonic, line_num):
    """Encodes jump mnemonic into 3 bits (j1 j2 j3)."""
    if jump_mnemonic not in JUMP_TABLE:
        raise ValueError(f"Line {line_num}: Invalid jump mnemonic '{jump_mnemonic}'")
    return JUMP_TABLE[jump_mnemonic]


def resolve_symbol(symbol, symbol_table, var_context, line_num):
    """
    Resolves a symbol to its numerical address:
    - If non-negative integer constant: return int.
    - If already in symbol_table (predefined, label, or previously allocated variable): return address.
    - Otherwise: allocate new variable starting at RAM address 16, sequentially incrementing.
    """
    if symbol.isdigit():
        val = int(symbol)
        if val > 32767:
            raise ValueError(f"Line {line_num}: Constant @{val} exceeds Hack 15-bit address limit (0-32767)")
        return val

    # Identifier check
    if not re.match(r'^[a-zA-Z_.$:][a-zA-Z0-9_.$:]*$', symbol):
        raise ValueError(f"Line {line_num}: Invalid symbol name '{symbol}'")

    if symbol not in symbol_table:
        addr = var_context['next_var_address']
        symbol_table[symbol] = addr
        var_context['next_var_address'] += 1
        var_context['allocated_variables'][symbol] = addr

    return symbol_table[symbol]


# =============================================================================
# 5. INSTRUCTION PARSING (SECOND PASS)
# =============================================================================

def parse_a_instruction(instruction, symbol_table, var_context, line_num):
    """
    Parses and translates an A-instruction (@value) into 16-bit binary code:
    Format: 0vvv vvvv vvvv vvvv
    """
    symbol = instruction[1:]
    address = resolve_symbol(symbol, symbol_table, var_context, line_num)
    # Format as 16-bit binary with leading 0
    return f"{address:016b}"


def parse_c_instruction(instruction, line_num):
    """
    Parses and translates a C-instruction (dest=comp;jump) into 16-bit binary code:
    Format: 111 a c1 c2 c3 c4 c5 c6 d1 d2 d3 j1 j2 j3
    """
    code = instruction
    dest_mnemonic = None
    jump_mnemonic = None

    # Parse dest
    if '=' in code:
        dest_mnemonic, code = code.split('=', 1)

    # Parse jump
    if ';' in code:
        comp_mnemonic, jump_mnemonic = code.split(';', 1)
    else:
        comp_mnemonic = code

    comp_bits = encode_comp(comp_mnemonic, line_num)
    dest_bits = encode_dest(dest_mnemonic, line_num)
    jump_bits = encode_jump(jump_mnemonic, line_num)

    # Prefix 111 + 7-bit comp + 3-bit dest + 3-bit jump = 16 bits
    return '111' + comp_bits + dest_bits + jump_bits


def second_pass(instruction_lines, symbol_table):
    """
    Performs the second pass over instruction lines:
    Translates every instruction into a 16-bit binary machine instruction.
    Variables are allocated starting at RAM address 16.
    
    Returns:
    - binary_lines: list of 16-bit string instructions
    - var_stats: dict of newly allocated variables
    """
    binary_lines = []
    var_context = {
        'next_var_address': 16,
        'allocated_variables': {}
    }

    for code, line_num in instruction_lines:
        if code.startswith('@'):
            binary_code = parse_a_instruction(code, symbol_table, var_context, line_num)
        else:
            binary_code = parse_c_instruction(code, line_num)

        if len(binary_code) != 16:
            raise ValueError(f"Line {line_num}: Generated instruction is not 16 bits: '{binary_code}'")

        binary_lines.append(binary_code)

    return binary_lines, var_context['allocated_variables']


# =============================================================================
# 6. ASSEMBLE PIPELINE & CLI INTERFACE
# =============================================================================

def assemble(input_file, output_file=None):
    """
    Assembles a .asm file into a .hack file using two-pass translation.
    """
    if not os.path.exists(input_file):
        raise FileNotFoundError(f"Input assembly file not found: {input_file}")

    if output_file is None:
        base, _ = os.path.splitext(input_file)
        output_file = base + '.hack'

    with open(input_file, 'r', encoding='utf-8', errors='ignore') as f:
        raw_lines = f.readlines()

    # Pass 1: Clean & process labels
    cleaned_lines = clean_lines(raw_lines)
    symbol_table, instruction_lines, label_stats = first_pass(cleaned_lines)

    # Pass 2: Translate instructions into binary
    binary_lines, allocated_vars = second_pass(instruction_lines, symbol_table)

    # Write output .hack file
    with open(output_file, 'w', encoding='utf-8', newline='\n') as f:
        for b in binary_lines:
            f.write(b + '\n')

    stats = {
        'input_file': input_file,
        'output_file': output_file,
        'source_lines': len(raw_lines),
        'assembly_instructions': len(binary_lines),
        'labels': label_stats['unique_labels'],
        'duplicate_warnings': len(label_stats['duplicate_warnings']),
        'variables': len(allocated_vars),
        'status': 'SUCCESS'
    }

    return stats


def main():
    if len(sys.argv) < 2:
        print("Usage: python assembler.py <input.asm> [output.hack]")
        print("Example: python assembler.py Add.asm")
        print("Example: python assembler.py capstone/Box.asm")
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else None

    print("==================================================")
    print(" Hack Two-Pass Assembler")
    print(" Student Roll No: 2501730041 | K = 41 (K mod 3 = 2)")
    print(" Duplicate Label Detection Enabled")
    print("==================================================")
    print(f"Input file: {input_file}")

    try:
        stats = assemble(input_file, output_file)
        print("--------------------------------------------------")
        print(f"Source lines:          {stats['source_lines']}")
        print(f"Machine instructions:  {stats['assembly_instructions']}")
        print(f"Unique labels:         {stats['labels']}")
        print(f"Duplicate warnings:    {stats['duplicate_warnings']}")
        print(f"Variables allocated:   {stats['variables']}")
        print(f"Output saved to:       {stats['output_file']}")
        print(f"Status:                {stats['status']}")
        print("==================================================")
    except Exception as e:
        print(f"\nAssembly FAILED: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()
