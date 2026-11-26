'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Cpu, Menu, X, Play } from 'lucide-react';
import { PROJECT_CONFIG, getConfiguredRollNumber } from '@/config/project';
import { calculateK } from '@/lib/kCalculator';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const rollInfo = getConfiguredRollNumber();
  const defaultK = calculateK(PROJECT_CONFIG.rollNumber).K;

  const navLinks = [
    { name: 'HOME', href: '/' },
    { name: 'PART A', href: '/part-a' },
    { name: 'PART B', href: '/part-b' },
    { name: 'PART C', href: '/part-c' },
    { name: 'SUBMISSION', href: '/submission' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-olive-dark/95 backdrop-blur-md border-b border-gold/25 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          
          {/* Brand & Editorial Title */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="w-10 h-10 rounded-xl bg-cream border border-gold flex items-center justify-center text-olive-dark shadow-editorial group-hover:scale-105 transition-transform">
              <Cpu className="w-5 h-5 text-olive-dark" />
            </div>
            <div>
              <span className="font-serif text-lg tracking-wide text-cream font-bold block leading-none">
                HACK COMPUTER LAB
              </span>
              <span className="text-[11px] text-sage font-medium tracking-wider uppercase mt-1 block">
                Nand to Tetris &bull; {PROJECT_CONFIG.courseCode} &bull; {PROJECT_CONFIG.universityShortName}
              </span>
            </div>
          </Link>

          {/* Compact Desktop Navigation: HOME | PART A | PART B | PART C | SUBMISSION */}
          <div className="hidden md:flex items-center space-x-1.5 p-1 rounded-pill bg-olive/40 border border-gold/20">
            {navLinks.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-4 py-1.5 rounded-pill text-xs font-semibold tracking-wider transition-all ${
                    isActive
                      ? 'bg-cream text-olive-dark shadow-sm font-bold border border-gold'
                      : 'text-cream/80 hover:text-cream hover:bg-olive-light/30'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Student K-Badge & Demo Quick Action */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-xl bg-ivory/10 border border-gold/30 text-right">
              <div className="text-[10px] text-sage font-medium uppercase tracking-wider">
                Roll {rollInfo.isPlaceholder ? 'Unset' : rollInfo.value}
              </div>
              <div className="text-xs font-mono font-bold text-gold">Parameter K = {defaultK}</div>
            </div>
            <Link
              href="/part-c"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cream hover:bg-ivory text-olive-dark text-xs font-bold transition-all shadow-editorial border border-gold"
            >
              <Play className="w-3.5 h-3.5 fill-olive-dark" />
              Box Emulator
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-cream hover:text-gold hover:bg-olive/40 focus:outline-none"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-olive-dark border-b border-gold/30 px-4 pt-2 pb-6 space-y-2">
          {navLinks.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wider transition-all ${
                  isActive
                    ? 'bg-cream text-olive-dark font-bold'
                    : 'text-cream hover:bg-olive/40'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
          <div className="pt-3 border-t border-gold/20 flex items-center justify-between px-2">
            <span className="text-xs text-sage">
              Roll: {rollInfo.isPlaceholder ? 'Unset' : rollInfo.value} (K={defaultK})
            </span>
            <Link
              href="/part-c"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs text-gold font-bold underline"
            >
              Open Emulator &rarr;
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
