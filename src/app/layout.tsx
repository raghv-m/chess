import './globals.css';
import type { Metadata } from 'next';
import { Fraunces, Hanken_Grotesk } from 'next/font/google';

const display = Fraunces({ subsets: ['latin'], variable: '--font-display', axes: ['opsz'] });
const body = Hanken_Grotesk({ subsets: ['latin'], variable: '--font-body' });

export const metadata: Metadata = {
  title: '3D Chess',
  description: 'Play three-layer 3D chess against the computer or friends online.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="font-[var(--font-body)] bg-ink text-bone antialiased">{children}</body>
    </html>
  );
}
