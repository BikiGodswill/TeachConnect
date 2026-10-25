import './globals.css';
import { Plus_Jakarta_Sans, Inter } from 'next/font/google';
import AppProviders from '@/providers/AppProviders';

const heading = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['600', '700', '800'], variable: '--font-heading' });
const body = Inter({ subsets: ['latin'], variable: '--font-body' });

export const metadata = {
  title: 'Teacher Connect — Find the Right Teacher. Learn Better.',
  description: 'Connect with qualified, verified teachers for personalized online and in-person learning.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable}`}>
      <body><AppProviders>{children}</AppProviders></body>
    </html>
  );
}
