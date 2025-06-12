
import type { Metadata } from "next";
import "../styles/globals.css";
import AdminBadge from '@/app/components/AdminBadge';
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from '@clerk/nextjs';

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
      <html lang="en">
        <head>
          {/* Aquí puedes agregar meta tags adicionales si es necesario */}
        </head>
        <body>
          <header className="flex justify-end items-center p-4 gap-4 h-16 bg-primary">
            <SignedOut>
              <SignInButton />
              <SignUpButton />
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
