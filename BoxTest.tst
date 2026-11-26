// CPU Emulator automated test script for Box.hack
// Course: ETCCNT301 - Nand to Tetris - I
// Student Roll Number: 2501730041 (K = 41)

load Box.hack,
output-file BoxTest.out,
compare-to BoxTest.cmp,
output-list RAM[24576]%D2.5.2 RAM[17695]%D2.5.2 RAM[17696]%D2.5.2 RAM[17697]%D2.5.2 RAM[17698]%D2.5.2 RAM[18304]%D2.5.2 RAM[18305]%D2.5.2 RAM[18306]%D2.5.2;

// Case 1: Key released (KBD = 0) -> Box is white (0)
set RAM[24576] 0;
repeat 800 {
  ticktock;
}
output;

// Case 2: Key pressed (KBD = 75, 'K') -> Box is black (-1)
set RAM[24576] 75;
repeat 800 {
  ticktock;
}
output;

// Case 3: Key released (KBD = 0) -> Box is erased (0)
set RAM[24576] 0;
repeat 800 {
  ticktock;
}
output;

// Case 4: Key pressed again (KBD = 89, 'Y') -> Box reappears black (-1)
set RAM[24576] 89;
repeat 800 {
  ticktock;
}
output;
