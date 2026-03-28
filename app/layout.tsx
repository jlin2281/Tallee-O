import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Tallee-o - Split Bills Easily',
  description: 'A simple and elegant bill splitting app for friends and groups',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body className={`${inter.className} min-h-screen bg-gray-50 dark:bg-gray-900`}>
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}