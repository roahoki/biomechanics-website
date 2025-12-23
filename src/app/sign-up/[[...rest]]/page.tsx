"use client";

import { SignUp } from "@clerk/nextjs";
import React from "react";

export default function SignUpPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Biomechanics Admin</h1>
          <p className="mt-2 text-gray-600">Crea una cuenta de administrador</p>
        </div>
        
        <SignUp 
          path="/sign-up" 
          routing="path" 
          signInUrl="/sign-in"
          afterSignUpUrl="/admin"
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
