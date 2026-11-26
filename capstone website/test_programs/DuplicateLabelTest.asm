// Test Program for K mod 3 = 2: Duplicate Label Detection
// Student Roll Number: 2501730041 (K = 41, K mod 3 = 2)

@10
D=A
(LOOP)
@i
M=D
@LOOP
D=D-1
@END
D;JEQ
(LOOP)
@counter
M=M+1
@LOOP
0;JMP
(END)
@100
D=A
(END)
@0
0;JMP
