
import type { Metadata } from "next";
import { Space_Grotesk } from 'next/font/google';
import "../styles/globals.css";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from '@clerk/nextjs';

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk',
});

export const metadata: Metadata = {
  title: "Biomechanics",
  description: "Biomechanics Website",
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={spaceGrotesk.variable} suppressHydrationWarning style={{ backgroundColor: '#000000' }}>
        <head>
          {/* Aquí puedes agregar meta tags adicionales si es necesario */}
        </head>
        <body suppressHydrationWarning className={`${spaceGrotesk.className} antialiased`} style={{ backgroundColor: '#000000', color: '#E6E7E8' }}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
