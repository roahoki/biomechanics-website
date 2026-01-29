import React from 'react';
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from '@clerk/nextjs';
import { ClerkWrapper } from '../clerk-wrapper';

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkWrapper>
      <div className="relative min-h-screen">
        <header className="absolute top-4 right-4 z-[9999]">
          <div className="flex items-center justify-end">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="bg-white/90 hover:bg-white backdrop-blur-sm rounded-full p-2 shadow-lg transition-all duration-200 hover:shadow-xl">
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <div className="bg-white/90 hover:bg-white backdrop-blur-sm rounded-full p-1 shadow-lg transition-all duration-200 hover:shadow-xl">
                <UserButton 
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "w-8 h-8",
                      userButtonPopoverCard: "bg-white shadow-xl border border-gray-200",
                      userButtonPopoverActionButton: "hover:bg-gray-50"
                    }
                  }}
                />
              </div>
            </SignedIn>
          </div>
        </header>
        
        {/* Contenido principal */}
        {children}
      </div>
    </ClerkWrapper>
  );
}
