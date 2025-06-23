
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
        <body className={`${spaceGrotesk.className} antialiased {}`} suppressHydrationWarning>
          <header className="flex justify-end items-center p-4 gap-4 h-16 bg-primary">
            <SignedOut>
              <SignInButton mode="modal"/>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
