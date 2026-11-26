'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { PROJECT_CONFIG, getConfiguredRollNumber } from '@/config/project';

interface IntroAnimationProps {
  reducedMotion: boolean;
  isExiting: boolean;
  onSkip: () => void;
}

interface CpuRamFiringBackdropProps {
  reducedMotion?: boolean;
  variant?: 'intro' | 'hero';
}

// Deterministic floating micro-particles to avoid hydration drift and keep layout minimal
const GOLD_PARTICLES = [
  { id: 'p1', left: '12%', top: '22%', size: 3, delay: 0.15, drift: -22 },
  { id: 'p2', left: '24%', top: '74%', size: 2, delay: 0.32, drift: -16 },
  { id: 'p3', left: '36%', top: '16%', size: 2, delay: 0.25, drift: -18 },
  { id: 'p4', left: '52%', top: '84%', size: 3, delay: 0.45, drift: -24 },
  { id: 'p5', left: '68%', top: '20%', size: 2, delay: 0.2, drift: -14 },
  { id: 'p6', left: '84%', top: '34%', size: 3, delay: 0.4, drift: -20 },
  { id: 'p7', left: '88%', top: '76%', size: 2, delay: 0.55, drift: -18 },
  { id: 'p8', left: '16%', top: '48%', size: 2, delay: 0.62, drift: -15 },
  { id: 'p9', left: '76%', top: '58%', size: 2, delay: 0.48, drift: -16 },
  { id: 'p10', left: '44%', top: '12%', size: 2, delay: 0.38, drift: -14 },
];

// 6x4 Screen grid coordinates forming a crisp rectangular box in the Screen node
const SCREEN_BOX_CELLS = [
  false, false, false, false, false, false,
  false, true, true, true, true, false,
  false, true, true, true, true, false,
  false, false, false, false, false, false,
];

// 8x5 Screen grid coordinates inside the background SCREEN hardware block
const BG_SCREEN_PIXELS = [
  false, false, false, false, false, false, false, false,
  false, false, true, true, true, true, false, false,
  false, false, true, true, true, true, false, false,
  false, false, true, true, true, true, false, false,
  false, false, false, false, false, false, false, false,
];

const RAM_CELLS = Array.from({ length: 16 }, (_, idx) => ({
  idx,
  row: Math.floor(idx / 4),
  col: idx % 4,
  label: idx < 10 ? `R0${idx}` : `R${idx}`,
  delay: (idx % 4) * 0.22 + Math.floor(idx / 4) * 0.35,
}));

const FIRING_BUSES_DESKTOP = [
  {
    id: 'bus-write',
    d: 'M 325 360 H 445 V 78 H 1045 V 185 H 1115',
    dash: '82 1500',
    startOffset: 90,
    endOffset: -1490,
    duration: 1.55,
    delay: 0.15,
    stroke: '#C6AD68',
    width: 2.2,
  },
  {
    id: 'bus-addr',
    d: 'M 325 395 H 415 V 108 H 1015 V 250 H 1115',
    dash: '64 1500',
    startOffset: 75,
    endOffset: -1470,
    duration: 1.85,
    delay: 0.65,
    stroke: '#F3EED8',
    width: 1.8,
  },
  {
    id: 'bus-read',
    d: 'M 1115 335 H 1045 V 775 H 405 V 535 H 325',
    dash: '76 1650',
    startOffset: 90,
    endOffset: -1620,
    duration: 1.75,
    delay: 0.45,
    stroke: '#A7B28A',
    width: 2.0,
  },
  {
    id: 'bus-screen',
    d: 'M 268 560 H 368 V 815 H 1065 V 560 H 1115',
    dash: '88 1650',
    startOffset: 100,
    endOffset: -1600,
    duration: 1.65,
    delay: 0.95,
    stroke: '#C6AD68',
    width: 2.4,
  },
];

const FIRING_BUSES_MOBILE = [
  {
    id: 'm-bus-left',
    d: 'M 95 165 H 36 V 715 H 95',
    dash: '58 800',
    startOffset: 65,
    endOffset: -740,
    duration: 1.5,
    delay: 0.2,
    stroke: '#C6AD68',
  },
  {
    id: 'm-bus-right',
    d: 'M 325 165 H 384 V 715 H 325',
    dash: '58 800',
    startOffset: 65,
    endOffset: -740,
    duration: 1.7,
    delay: 0.75,
    stroke: '#F3EED8',
  },
];

const ARCH_STAGES = [
  { id: 'gates', label: 'LOGIC GATES', sub: 'NAND • MUX' },
  { id: 'cpu', label: 'CPU', sub: 'ALU • A/D • PC' },
  { id: 'memory', label: 'MEMORY', sub: 'RAM16K • I/O' },
  { id: 'screen', label: 'SCREEN', sub: '512 × 256' },
] as const;

const EASE_OUT_EXPO: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function CpuRamFiringBackdrop({
  reducedMotion,
  variant = 'intro',
}: CpuRamFiringBackdropProps) {
  const systemReducedMotion = useReducedMotion() ?? false;
  const isReduced = reducedMotion ?? systemReducedMotion;
  const isHero = variant === 'hero';

  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 overflow-hidden pointer-events-none select-none ${
        isHero ? 'opacity-45' : 'opacity-90'
      }`}
    >
      {/* DESKTOP WIDESCREEN CPU <-> RAM <-> SCREEN FIRING SCHEMATIC */}
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio={isHero ? 'xMidYMid meet' : 'xMidYMid slice'}
        className="hidden md:block w-full h-full"
      >
        <defs>
          <filter id={`bus-glow-${variant}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Static Bus Traces */}
        <g fill="none" stroke="#A7B28A" strokeOpacity={isHero ? 0.16 : 0.22} strokeWidth="1.2">
          <path d="M 185 235 V 290" />
          <path d="M 215 235 V 290" />
          <path d="M 1248 390 V 445" />
          {FIRING_BUSES_DESKTOP.map((bus) => (
            <path key={`track-${bus.id}`} d={bus.d} />
          ))}
        </g>

        {/* ROM 32K MODULE (Top-Left) */}
        <motion.g
          initial={{ opacity: isReduced ? 0.65 : 0 }}
          animate={{ opacity: isHero ? 0.55 : 0.72 }}
          transition={{ duration: 0.7, delay: isHero ? 0 : 0.1 }}
        >
          <rect
            x="58"
            y="110"
            width="266"
            height="125"
            rx="10"
            fill="#29321F"
            fillOpacity="0.45"
            stroke="#C6AD68"
            strokeOpacity="0.35"
            strokeWidth="1.2"
          />
          <text
            x="76"
            y="134"
            fill="#C6AD68"
            fontSize="10"
            fontFamily="monospace"
            letterSpacing="1.6"
            opacity="0.85"
          >
            ROM 32K • INSTRUCTION FETCH
          </text>
          {['0110000000000000', '1111110000010000', '0100010100100000', '1110101010000111'].map(
            (bits, idx) => (
              <motion.text
                key={bits}
                x="76"
                y={158 + idx * 18}
                fill={idx === 1 ? '#F3EED8' : '#A7B28A'}
                fontSize="11"
                fontFamily="monospace"
                letterSpacing="1.2"
                animate={
                  isReduced
                    ? { opacity: 0.55 }
                    : { opacity: [0.28, 0.9, 0.3] }
                }
                transition={{
                  duration: 1.4,
                  delay: idx * 0.32,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                {bits}
              </motion.text>
            )
          )}
        </motion.g>

        {/* Vertical Instruction Fetch Firing Pulses (ROM -> CPU) */}
        {!isReduced && (
          <>
            <motion.path
              d="M 185 235 V 290"
              fill="none"
              stroke="#C6AD68"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeDasharray="16 80"
              filter={`url(#bus-glow-${variant})`}
              animate={{ strokeDashoffset: [20, -76] }}
              transition={{ duration: 0.75, repeat: Infinity, ease: 'linear' }}
            />
            <motion.path
              d="M 215 235 V 290"
              fill="none"
              stroke="#F3EED8"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeDasharray="14 80"
              animate={{ strokeDashoffset: [20, -76] }}
              transition={{ duration: 0.75, delay: 0.36, repeat: Infinity, ease: 'linear' }}
            />
          </>
        )}

        {/* HACK CPU MODULE (Bottom-Left) */}
        <motion.g
          initial={{ opacity: isReduced ? 0.7 : 0 }}
          animate={{ opacity: isHero ? 0.6 : 0.78 }}
          transition={{ duration: 0.7, delay: isHero ? 0 : 0.18 }}
        >
          <rect
            x="58"
            y="290"
            width="266"
            height="368"
            rx="12"
            fill="#29321F"
            fillOpacity="0.48"
            stroke="#C6AD68"
            strokeOpacity="0.4"
            strokeWidth="1.4"
          />
          <text
            x="76"
            y="316"
            fill="#C6AD68"
            fontSize="11"
            fontFamily="monospace"
            fontWeight="bold"
            letterSpacing="1.8"
          >
            HACK CPU • 16-BIT CORE
          </text>

          {/* Registers: PC, A-REG, D-REG, DECODE */}
          {[
            { x: 76, y: 334, label: 'PC [15]', val: '0x001A', delay: 0 },
            { x: 198, y: 334, label: 'A-REG', val: '17696', delay: 0.35 },
            { x: 76, y: 396, label: 'D-REG', val: '0xFFFF', delay: 0.7 },
            { x: 198, y: 396, label: 'CTRL', val: 'writeM', delay: 1.05 },
          ].map((reg) => (
            <g key={reg.label}>
              <motion.rect
                x={reg.x}
                y={reg.y}
                width="108"
                height="48"
                rx="6"
                fill="#3F4B25"
                stroke="#C6AD68"
                strokeWidth="1"
                animate={
                  isReduced
                    ? { fillOpacity: 0.45, strokeOpacity: 0.4 }
                    : {
                        fillOpacity: [0.35, 0.78, 0.35],
                        strokeOpacity: [0.3, 0.85, 0.3],
                      }
                }
                transition={{
                  duration: 1.5,
                  delay: reg.delay,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              <text
                x={reg.x + 10}
                y={reg.y + 18}
                fill="#A7B28A"
                fontSize="9"
                fontFamily="monospace"
              >
                {reg.label}
              </text>
              <text
                x={reg.x + 10}
                y={reg.y + 36}
                fill="#F3EED8"
                fontSize="11"
                fontFamily="monospace"
                fontWeight="bold"
              >
                {reg.val}
              </text>
            </g>
          ))}

          {/* Chamfered ALU Core + Firing Energy Ring */}
          <polygon
            points="106,472 172,472 191,498 210,472 276,472 246,574 136,574"
            fill="#3F4B25"
            fillOpacity="0.6"
            stroke="#C6AD68"
            strokeOpacity="0.55"
            strokeWidth="1.5"
          />
          <text
            x="191"
            y="534"
            textAnchor="middle"
            fill="#F3EED8"
            fontSize="14"
            fontFamily="monospace"
            fontWeight="bold"
            letterSpacing="2.4"
          >
            ALU
          </text>
          <text
            x="191"
            y="606"
            textAnchor="middle"
            fill="#A7B28A"
            fontSize="9.5"
            fontFamily="monospace"
            letterSpacing="1.2"
          >
            outM[16] • zr • ng • writeM
          </text>
          <text
            x="191"
            y="632"
            textAnchor="middle"
            fill="#C6AD68"
            fontSize="9"
            fontFamily="monospace"
            opacity="0.75"
          >
            CLK SYNC ACTIVE
          </text>

          {!isReduced && (
            <motion.circle
              cx="191"
              cy="528"
              r="24"
              fill="none"
              stroke="#C6AD68"
              strokeWidth="1.8"
              initial={{ scale: 0.7, opacity: 0.85 }}
              animate={{ scale: [0.65, 1.85], opacity: [0.85, 0] }}
              transition={{
                duration: 1.35,
                repeat: Infinity,
                ease: 'easeOut',
              }}
              style={{ transformOrigin: '191px 528px' }}
            />
          )}
        </motion.g>

        {/* RAM 16K MEMORY MATRIX (Top-Right) */}
        <motion.g
          initial={{ opacity: isReduced ? 0.7 : 0 }}
          animate={{ opacity: isHero ? 0.58 : 0.76 }}
          transition={{ duration: 0.7, delay: isHero ? 0 : 0.2 }}
        >
          <rect
            x="1115"
            y="110"
            width="266"
            height="280"
            rx="12"
            fill="#29321F"
            fillOpacity="0.48"
            stroke="#C6AD68"
            strokeOpacity="0.4"
            strokeWidth="1.4"
          />
          <text
            x="1134"
            y="136"
            fill="#C6AD68"
            fontSize="11"
            fontFamily="monospace"
            fontWeight="bold"
            letterSpacing="1.6"
          >
            RAM 16K • MEMORY CELLS
          </text>

          {RAM_CELLS.map((cell) => {
            const x = 1134 + cell.col * 59;
            const y = 154 + cell.row * 54;
            return (
              <g key={cell.idx}>
                <motion.rect
                  x={x}
                  y={y}
                  width="50"
                  height="42"
                  rx="5"
                  fill="#C6AD68"
                  stroke="#C6AD68"
                  strokeWidth="1"
                  animate={
                    isReduced
                      ? { fillOpacity: 0.14, strokeOpacity: 0.35 }
                      : {
                          fillOpacity: [0.06, 0.42, 0.08],
                          strokeOpacity: [0.25, 0.9, 0.25],
                        }
                  }
                  transition={{
                    duration: 1.6,
                    delay: cell.delay,
                    repeat: Infinity,
                    repeatDelay: 0.6,
                    ease: 'easeInOut',
                  }}
                />
                <text
                  x={x + 25}
                  y={y + 25}
                  textAnchor="middle"
                  fill="#F3EED8"
                  fontSize="9.5"
                  fontFamily="monospace"
                  opacity="0.8"
                >
                  {cell.label}
                </text>
              </g>
            );
          })}
        </motion.g>

        {/* RAM -> SCREEN SYNC PULSE */}
        {!isReduced && (
          <motion.path
            d="M 1248 390 V 445"
            fill="none"
            stroke="#C6AD68"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeDasharray="16 80"
            filter={`url(#bus-glow-${variant})`}
            animate={{ strokeDashoffset: [20, -76] }}
            transition={{ duration: 0.85, delay: 0.3, repeat: Infinity, ease: 'linear' }}
          />
        )}

        {/* SCREEN MEMORY-MAPPED DISPLAY (Bottom-Right) */}
        <motion.g
          initial={{ opacity: isReduced ? 0.7 : 0 }}
          animate={{ opacity: isHero ? 0.58 : 0.76 }}
          transition={{ duration: 0.7, delay: isHero ? 0 : 0.25 }}
        >
          <rect
            x="1115"
            y="445"
            width="266"
            height="213"
            rx="12"
            fill="#29321F"
            fillOpacity="0.48"
            stroke="#C6AD68"
            strokeOpacity="0.4"
            strokeWidth="1.4"
          />
          <text
            x="1134"
            y="471"
            fill="#C6AD68"
            fontSize="11"
            fontFamily="monospace"
            fontWeight="bold"
            letterSpacing="1.6"
          >
            SCREEN • RAM[17696]
          </text>

          <rect
            x="1142"
            y="486"
            width="212"
            height="136"
            rx="6"
            fill="#1D2415"
            fillOpacity="0.7"
            stroke="#A7B28A"
            strokeOpacity="0.35"
          />

          {/* 8x5 Pixel Matrix forming the Box */}
          {BG_SCREEN_PIXELS.map((isBox, idx) => {
            const col = idx % 8;
            const row = Math.floor(idx / 8);
            const px = 1158 + col * 23;
            const py = 500 + row * 22;
            return (
              <motion.rect
                key={idx}
                x={px}
                y={py}
                width="18"
                height="17"
                rx="2"
                fill={isBox ? '#C6AD68' : '#A7B28A'}
                animate={
                  isReduced
                    ? { fillOpacity: isBox ? 0.8 : 0.12 }
                    : isBox
                      ? { fillOpacity: [0.15, 0.92, 0.82, 0.25] }
                      : { fillOpacity: 0.1 }
                }
                transition={{
                  duration: 2.6,
                  delay: isBox ? row * 0.18 + col * 0.08 : 0,
                  repeat: Infinity,
                  repeatDelay: 0.8,
                  ease: 'easeInOut',
                }}
              />
            );
          })}
          <text
            x="1248"
            y="644"
            textAnchor="middle"
            fill="#A7B28A"
            fontSize="9"
            fontFamily="monospace"
            letterSpacing="1.2"
          >
            32×20 PIXEL BOX • ROW 41
          </text>
        </motion.g>

        {/* HIGH-SPEED FIRING BUS PULSES & IMPACT FLARES */}
        {!isReduced &&
          FIRING_BUSES_DESKTOP.map((bus) => (
            <motion.path
              key={bus.id}
              d={bus.d}
              fill="none"
              stroke={bus.stroke}
              strokeWidth={bus.width}
              strokeLinecap="round"
              strokeDasharray={bus.dash}
              filter={`url(#bus-glow-${variant})`}
              animate={{ strokeDashoffset: [bus.startOffset, bus.endOffset] }}
              transition={{
                duration: bus.duration,
                delay: bus.delay,
                repeat: Infinity,
                repeatDelay: 0.35,
                ease: 'linear',
              }}
            />
          ))}

        {/* Impact Firing Rings at RAM, SCREEN, and CPU Pins */}
        {!isReduced &&
          [
            { cx: 1115, cy: 185, delay: 1.55 },
            { cx: 1115, cy: 250, delay: 2.35 },
            { cx: 1115, cy: 560, delay: 2.45 },
            { cx: 325, cy: 535, delay: 2.05 },
          ].map((node, idx) => (
            <motion.circle
              key={idx}
              cx={node.cx}
              cy={node.cy}
              r="5"
              fill="none"
              stroke="#F3EED8"
              strokeWidth="1.5"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: [0.5, 2.8], opacity: [0.9, 0] }}
              transition={{
                duration: 0.8,
                delay: node.delay,
                repeat: Infinity,
                repeatDelay: 1.15,
                ease: 'easeOut',
              }}
              style={{ transformOrigin: `${node.cx}px ${node.cy}px` }}
            />
          ))}
      </svg>

      {/* MOBILE COMPACT CPU & RAM FIRING SCHEMATIC */}
      <svg
        viewBox="0 0 420 840"
        preserveAspectRatio="xMidYMid slice"
        className="block md:hidden w-full h-full"
      >
        <g fill="none" stroke="#A7B28A" strokeOpacity="0.2" strokeWidth="1.1">
          {FIRING_BUSES_MOBILE.map((bus) => (
            <path key={`m-track-${bus.id}`} d={bus.d} />
          ))}
        </g>

        {/* Top Mobile CPU Block */}
        <g opacity="0.65">
          <rect
            x="95"
            y="42"
            width="230"
            height="136"
            rx="10"
            fill="#29321F"
            fillOpacity="0.52"
            stroke="#C6AD68"
            strokeOpacity="0.4"
          />
          <text x="112" y="64" fill="#C6AD68" fontSize="9" fontFamily="monospace" letterSpacing="1.4">
            HACK CPU • ALU • PC • A/D
          </text>
          <polygon
            points="160,82 198,82 210,98 222,82 260,82 242,142 178,142"
            fill="#3F4B25"
            fillOpacity="0.65"
            stroke="#C6AD68"
            strokeOpacity="0.55"
          />
          <text x="210" y="118" textAnchor="middle" fill="#F3EED8" fontSize="11" fontFamily="monospace" fontWeight="bold">
            ALU
          </text>
        </g>

        {/* Bottom Mobile RAM & Screen Block */}
        <g opacity="0.65">
          <rect
            x="95"
            y="675"
            width="230"
            height="122"
            rx="10"
            fill="#29321F"
            fillOpacity="0.52"
            stroke="#C6AD68"
            strokeOpacity="0.4"
          />
          <text x="112" y="698" fill="#C6AD68" fontSize="9" fontFamily="monospace" letterSpacing="1.4">
            RAM 16K • SCREEN[17696]
          </text>
          {Array.from({ length: 8 }, (_, idx) => (
            <motion.rect
              key={idx}
              x={112 + (idx % 4) * 52}
              y={712 + Math.floor(idx / 4) * 34}
              width="42"
              height="24"
              rx="4"
              fill="#C6AD68"
              stroke="#C6AD68"
              animate={
                isReduced
                  ? { fillOpacity: 0.16, strokeOpacity: 0.35 }
                  : { fillOpacity: [0.08, 0.45, 0.1], strokeOpacity: [0.25, 0.85, 0.25] }
              }
              transition={{ duration: 1.4, delay: idx * 0.2, repeat: Infinity }}
            />
          ))}
        </g>

        {!isReduced &&
          FIRING_BUSES_MOBILE.map((bus) => (
            <motion.path
              key={bus.id}
              d={bus.d}
              fill="none"
              stroke={bus.stroke}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeDasharray={bus.dash}
              animate={{ strokeDashoffset: [bus.startOffset, bus.endOffset] }}
              transition={{
                duration: bus.duration,
                delay: bus.delay,
                repeat: Infinity,
                repeatDelay: 0.3,
                ease: 'linear',
              }}
            />
          ))}
      </svg>
    </div>
  );
}

export default function IntroAnimation({
  reducedMotion,
  isExiting,
  onSkip,
}: IntroAnimationProps) {
  const rollInfo = getConfiguredRollNumber();
  const [titleLineOne, titleLineTwo] = PROJECT_CONFIG.projectTitleLines;
  const lineOneWords = titleLineOne.split(' ');
  const lineTwoWords = titleLineTwo.split(' ');

  return (
    <div className="relative w-full h-full min-h-[100dvh] flex flex-col items-center justify-center px-5 sm:px-8 py-10 overflow-hidden select-none bg-olive-dark text-cream">
      {/* =====================================================================
          SCENE 1: DEEP OLIVE RADIAL DEPTH, CPU/RAM FIRING BACKDROP, PARTICLES
         ===================================================================== */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 44%, rgba(89, 107, 53, 0.25) 0%, rgba(63, 75, 37, 0.94) 58%, rgba(41, 50, 31, 1) 100%)',
        }}
      />

      <motion.div
        aria-hidden="true"
        initial={{ opacity: reducedMotion ? 0.35 : 0 }}
        animate={{ opacity: 0.42 }}
        transition={{ duration: reducedMotion ? 0.3 : 0.8, ease: 'easeOut' }}
        className="absolute inset-0 pcb-pattern pointer-events-none"
      />

      {/* Full-Background Hack CPU & RAM Firing Animation */}
      <CpuRamFiringBackdrop reducedMotion={reducedMotion} variant="intro" />

      {/* Soft Center Contrast Scrim so typography over firing buses stays razor-sharp */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 48%, rgba(47, 57, 27, 0.72) 0%, rgba(63, 75, 37, 0.28) 48%, rgba(41, 50, 31, 0) 80%)',
        }}
      />

      {/* Soft Light Sweep (0.05s - 1.4s) */}
      {!reducedMotion && (
        <motion.div
          aria-hidden="true"
          initial={{ x: '-115%', opacity: 0 }}
          animate={{ x: '220%', opacity: [0, 0.24, 0.16, 0] }}
          transition={{ duration: 1.45, delay: 0.08, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute inset-y-[-25%] left-0 w-[44vw] -rotate-12 pointer-events-none blur-2xl will-change-transform"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(198, 173, 104, 0.22) 50%, transparent 100%)',
          }}
        />
      )}

      {/* Corner Architectural Brackets */}
      <motion.div
        aria-hidden="true"
        initial={{ opacity: reducedMotion ? 0.5 : 0 }}
        animate={{ opacity: 0.55 }}
        transition={{ duration: reducedMotion ? 0.25 : 0.7, delay: reducedMotion ? 0 : 0.2 }}
        className="absolute inset-4 sm:inset-7 pointer-events-none"
      >
        <span className="absolute top-0 left-0 w-5 h-5 border-t border-l border-gold/45" />
        <span className="absolute top-0 right-0 w-5 h-5 border-t border-r border-gold/45" />
        <span className="absolute bottom-0 left-0 w-5 h-5 border-b border-l border-gold/45" />
        <span className="absolute bottom-0 right-0 w-5 h-5 border-b border-r border-gold/45" />
      </motion.div>

      {/* Minimal Gold Micro-Particles */}
      {!reducedMotion &&
        GOLD_PARTICLES.map((particle) => (
          <motion.span
            key={particle.id}
            aria-hidden="true"
            style={{
              left: particle.left,
              top: particle.top,
              width: particle.size,
              height: particle.size,
            }}
            initial={{ opacity: 0, y: 8 }}
            animate={{
              opacity: [0, 0.45, 0.28, 0.15],
              y: [8, particle.drift],
            }}
            transition={{
              duration: 4.4,
              delay: particle.delay,
              ease: 'easeOut',
            }}
            className="absolute rounded-full bg-gold pointer-events-none will-change-transform"
          />
        ))}

      {/* =====================================================================
          ARCHITECTURE STAGE PIPELINE (LOGIC GATES -> CPU -> MEMORY -> SCREEN)
         ===================================================================== */}
      <motion.div
        aria-hidden="true"
        initial={{ opacity: reducedMotion ? 0.35 : 0 }}
        animate={{ opacity: isExiting ? 0.18 : 0.4 }}
        transition={{ duration: reducedMotion ? 0.3 : 0.9, delay: reducedMotion ? 0 : 0.8 }}
        className="w-full max-w-3xl mx-auto mb-5 sm:mb-7 relative z-10 pointer-events-none"
      >
        <div className="flex items-center justify-center gap-1 sm:gap-2 px-1 sm:px-4">
          {ARCH_STAGES.map((stage, idx) => (
            <React.Fragment key={stage.id}>
              <div className="flex-1 min-w-0 rounded-lg border border-gold/40 bg-olive-dark/75 px-1.5 py-2 sm:px-3 sm:py-2.5 text-center backdrop-blur-[2px]">
                <div className="text-[7px] sm:text-[10px] font-mono font-semibold tracking-wider text-gold truncate">
                  {stage.label}
                </div>

                {stage.id === 'screen' ? (
                  <div className="mt-1.5 mx-auto w-fit p-1 rounded border border-sage/35 bg-[#29321F]/85">
                    <div className="grid grid-cols-6 gap-[2px]">
                      {SCREEN_BOX_CELLS.map((isBoxCell, cellIdx) => (
                        <motion.span
                          key={cellIdx}
                          className={`block w-1 h-1 sm:w-2 sm:h-2 rounded-[1px] ${
                            isBoxCell ? 'bg-gold' : 'bg-sage/20'
                          }`}
                          initial={{
                            opacity: reducedMotion ? (isBoxCell ? 1 : 0.25) : 0.2,
                            scale: reducedMotion ? 1 : 0.85,
                          }}
                          animate={
                            isBoxCell
                              ? { opacity: 1, scale: 1 }
                              : { opacity: 0.22, scale: 1 }
                          }
                          transition={{
                            duration: reducedMotion ? 0.2 : 0.28,
                            delay: reducedMotion
                              ? 0.15
                              : isBoxCell
                                ? 3.55 + (cellIdx % 6) * 0.09 + Math.floor(cellIdx / 6) * 0.12
                                : 0.5,
                            ease: 'easeOut',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-[6px] sm:text-[9px] font-mono text-sage/85 mt-1 truncate">
                    {stage.sub}
                  </div>
                )}
              </div>

              {idx < ARCH_STAGES.length - 1 && (
                <div className="flex items-center w-3 sm:w-6 md:w-9 shrink-0 relative h-px bg-gold/40">
                  <span className="absolute right-0 -top-[2.5px] w-1.5 h-1.5 border-t border-r border-gold/60 rotate-45" />
                  {!reducedMotion && (
                    <motion.span
                      initial={{ x: 0, opacity: 0 }}
                      animate={{
                        x: [0, 22],
                        opacity: [0, 1, 1, 0],
                      }}
                      transition={{
                        duration: 0.72,
                        delay: 1.5 + idx * 0.58,
                        repeat: 1,
                        repeatDelay: 0.85,
                        ease: 'easeInOut',
                      }}
                      className="hidden sm:block absolute -top-[2.5px] left-0 w-1.5 h-1.5 rounded-full bg-gold shadow-[0_0_8px_rgba(198,173,104,0.85)]"
                    />
                  )}
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </motion.div>

      {/* =====================================================================
          CENTRAL CINEMATIC COMPOSITION (SCENES 2, 3 & 4)
         ===================================================================== */}
      <div className="relative z-10 w-full max-w-3xl mx-auto text-center flex flex-col items-center">
        {/* SCENE 2 — UNIVERSITY IDENTITY (0.8s - 1.8s) */}
        <motion.div
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: reducedMotion ? 0.35 : 0.65,
            delay: reducedMotion ? 0.05 : 0.8,
            ease: EASE_OUT_EXPO,
          }}
          className="space-y-1.5"
        >
          <div className="inline-flex items-center gap-3">
            <span className="hidden sm:block w-6 h-px bg-gold/50" />
            <p className="font-sans text-xs sm:text-sm font-semibold tracking-[0.26em] sm:tracking-[0.32em] text-cream uppercase">
              {PROJECT_CONFIG.universityName}
            </p>
            <span className="hidden sm:block w-6 h-px bg-gold/50" />
          </div>

          <motion.p
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: reducedMotion ? 0.35 : 0.55,
              delay: reducedMotion ? 0.08 : 1.05,
              ease: EASE_OUT_EXPO,
            }}
            className="font-sans text-[10px] sm:text-xs font-medium tracking-[0.2em] sm:tracking-[0.28em] text-sage uppercase"
          >
            {PROJECT_CONFIG.schoolName}
          </motion.p>
        </motion.div>

        {/* SCENE 3 — PROJECT TITLE (1.8s - 3.0s) */}
        <div className="mt-6 sm:mt-8 space-y-2.5 sm:space-y-3">
          <motion.div
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: reducedMotion ? 0.3 : 0.45,
              delay: reducedMotion ? 0.1 : 1.75,
              ease: EASE_OUT_EXPO,
            }}
            className="inline-flex items-center gap-2.5 px-3.5 py-1 rounded-pill border border-gold/35 bg-olive-dark/80 backdrop-blur-sm"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-gold" />
            <span className="font-mono text-[10px] sm:text-xs font-medium tracking-[0.28em] text-gold uppercase">
              {PROJECT_CONFIG.projectCategory}
            </span>
          </motion.div>

          <h1 className="font-serif font-bold tracking-tight leading-[1.04]">
            <span className="block text-3xl sm:text-5xl md:text-6xl lg:text-[4.25rem] text-cream">
              {lineOneWords.map((word, idx) => (
                <span
                  key={`${word}-${idx}`}
                  className="inline-block overflow-hidden align-bottom mr-[0.24em] last:mr-0"
                >
                  <motion.span
                    className="inline-block will-change-transform"
                    initial={reducedMotion ? { opacity: 0 } : { y: '115%', opacity: 0 }}
                    animate={{ y: '0%', opacity: 1 }}
                    transition={{
                      duration: reducedMotion ? 0.3 : 0.52,
                      delay: reducedMotion ? 0.12 : 1.9 + idx * 0.11,
                      ease: EASE_OUT_EXPO,
                    }}
                  >
                    {word}
                  </motion.span>
                </span>
              ))}
            </span>

            <span className="block text-3xl sm:text-5xl md:text-6xl lg:text-[4.25rem] text-gold italic font-medium mt-1 sm:mt-1.5">
              {lineTwoWords.map((word, idx) => (
                <span
                  key={`${word}-${idx}`}
                  className="inline-block overflow-hidden align-bottom mr-[0.24em] last:mr-0"
                >
                  <motion.span
                    className="inline-block will-change-transform"
                    initial={reducedMotion ? { opacity: 0 } : { y: '115%', opacity: 0 }}
                    animate={{ y: '0%', opacity: 1 }}
                    transition={{
                      duration: reducedMotion ? 0.3 : 0.52,
                      delay: reducedMotion ? 0.15 : 2.32 + idx * 0.11,
                      ease: EASE_OUT_EXPO,
                    }}
                  >
                    {word}
                  </motion.span>
                </span>
              ))}
            </span>
          </h1>

          {/* Gold Underline Rule */}
          <motion.div
            aria-hidden="true"
            initial={{ scaleX: reducedMotion ? 1 : 0, opacity: reducedMotion ? 0.65 : 0 }}
            animate={{ scaleX: 1, opacity: 0.7 }}
            transition={{
              duration: reducedMotion ? 0.25 : 0.55,
              delay: reducedMotion ? 0.15 : 2.68,
              ease: EASE_OUT_EXPO,
            }}
            className="mx-auto w-28 sm:w-40 h-px bg-gradient-to-r from-transparent via-gold to-transparent origin-center"
          />
        </div>

        {/* SCENE 4 — STUDENT INFORMATION PLAQUE (3.0s - 4.0s) */}
        <motion.div
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: reducedMotion ? 0.35 : 0.68,
            delay: reducedMotion ? 0.2 : 3.0,
            ease: EASE_OUT_EXPO,
          }}
          className="mt-7 sm:mt-9 w-full max-w-xl rounded-2xl border border-gold/40 bg-[#323C1C]/88 backdrop-blur-md shadow-[0_20px_50px_rgba(24,30,14,0.45)] overflow-hidden"
        >
          {/* Top Gold Hairline */}
          <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-gold/80 to-transparent" />

          <div className="px-5 py-4 sm:px-7 sm:py-5">
            <div className="text-[10px] font-mono tracking-[0.28em] text-sage uppercase">
              Submitted By
            </div>
            <div className="font-serif text-2xl sm:text-3xl font-bold text-cream mt-0.5 tracking-wide">
              {PROJECT_CONFIG.studentName}
            </div>

            <div className="my-3.5 sm:my-4 border-t border-gold/20" />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-center">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-sage block">
                  Course
                </span>
                <span className="text-xs sm:text-sm font-medium text-cream mt-0.5 block">
                  {PROJECT_CONFIG.courseName}
                </span>
              </div>

              <div className="sm:border-x sm:border-gold/20 sm:px-3">
                <span className="text-[10px] font-mono uppercase tracking-wider text-sage block">
                  Course Code
                </span>
                <span className="text-xs sm:text-sm font-mono font-semibold text-gold mt-0.5 block">
                  {PROJECT_CONFIG.courseCode}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-sage block">
                  University Roll Number
                </span>
                <span
                  className={`text-xs sm:text-sm font-mono font-semibold mt-0.5 block ${
                    rollInfo.isPlaceholder
                      ? 'text-cream bg-gold/20 border border-gold/50 rounded px-2 py-0.5'
                      : 'text-gold'
                  }`}
                >
                  {rollInfo.value}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-cream/[0.06] border-t border-gold/20 px-4 py-2 text-[10px] sm:text-[11px] font-mono tracking-[0.16em] text-cream/80 uppercase">
            {PROJECT_CONFIG.submissionType}
          </div>
        </motion.div>
      </div>

      {/* =====================================================================
          SKIP INTRO CONTROL & SUBTLE TIMELINE HAIRLINE
         ===================================================================== */}
      <motion.button
        type="button"
        onClick={onSkip}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35, delay: reducedMotion ? 0.1 : 0.45 }}
        aria-label="Skip intro animation"
        className="absolute bottom-5 right-5 sm:bottom-8 sm:right-8 z-20 inline-flex items-center gap-2 px-4 py-2 rounded-pill border border-gold/45 bg-olive-dark/80 hover:bg-cream hover:text-olive-dark text-cream/90 text-[11px] font-mono tracking-[0.18em] uppercase backdrop-blur-sm transition-colors shadow-editorial focus:outline-none focus:ring-2 focus:ring-gold"
      >
        <span>Skip Intro</span>
        <span aria-hidden="true">&rarr;</span>
      </motion.button>

      {/* Bottom Edge Progress Hairline */}
      <motion.div
        aria-hidden="true"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{
          duration: reducedMotion ? 2.2 : 4.75,
          ease: 'linear',
        }}
        className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-sage/40 via-gold to-cream/80 origin-left pointer-events-none"
      />
    </div>
  );
}
