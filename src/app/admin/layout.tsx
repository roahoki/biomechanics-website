import React from 'react';
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from '@clerk/nextjs';
import { AdminSidebar } from '@/components/features/admin';

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <header className="flex justify-between items-center p-4 gap-4 h-16 bg-white shadow-sm z-20 fixed top-0 left-0 right-0">
        <div className="flex items-center">
          <h1 className="text-lg font-bold text-gray-800">Biomechanics Admin</h1>
        </div>
        <div className="flex items-center gap-4">
          <SignedOut>
            <SignInButton mode="modal"/>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </header>
      <div className="pt-16 min-h-screen bg-gray-50">
        <AdminSidebar />
        <main className="md:pl-[72px]">
          {children}
        </main>
      </div>
    </>
  );
}
