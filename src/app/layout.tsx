
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={spaceGrotesk.variable} suppressHydrationWarning>
        <head>
          {/* Aquí puedes agregar meta tags adicionales si es necesario */}
        </head>
        <body suppressHydrationWarning className={`${spaceGrotesk.className} antialiased`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
