import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { IntroProvider } from '@/components/intro/IntroScreen';
import { PROJECT_CONFIG } from '@/config/project';

export const metadata: Metadata = {
  title: 'HACK COMPUTER LAB | Nand to Tetris Capstone',
  description: `University Capstone Project: ${PROJECT_CONFIG.projectTitle}. Course: ${PROJECT_CONFIG.courseCode}, ${PROJECT_CONFIG.universityName}. HDL Computer, Two-Pass Python Assembler, and Software CPU Emulator.`,
};

const INTRO_PRE_PAINT_SCRIPT = `(function(){try{if(window.location.pathname==='/'){document.documentElement.setAttribute('data-intro-pending','1');setTimeout(function(){document.documentElement.removeAttribute('data-intro-pending');},2500);}}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: INTRO_PRE_PAINT_SCRIPT }} />
      </head>
      <body className="min-h-screen flex flex-col bg-olive-dark text-forest-text antialiased selection:bg-gold selection:text-olive-dark">
        <IntroProvider>
          <div id="site-shell" className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </IntroProvider>
      </body>
    </html>
  );
}
