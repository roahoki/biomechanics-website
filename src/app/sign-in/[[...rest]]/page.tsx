"use client";

import { SignIn } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import React from "react";

export default function SignInPage() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect_url");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="flex flex-col items-center w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Biomechanics Admin</h1>
          <p className="mt-2 text-gray-600">Inicia sesión para acceder al panel de administración</p>
        </div>
        
        <SignIn 
          path="/sign-in" 
          routing="path" 
          signUpUrl="/sign-up" 
          afterSignInUrl={redirectUrl || "/admin"}
          appearance={{
            elements: {
              formButtonPrimary: "bg-primary hover:bg-primary-dark",
              card: "shadow-lg rounded-xl border-0"
            }
          }}
        />
      </div>
    </div>
  );
}
