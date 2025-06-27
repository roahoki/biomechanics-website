"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4 bg-gradient-to-b from-gray-900 to-black text-white">
      <h1 className="text-9xl font-bold mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-8">Página no encontrada</h2>
      <p className="mb-8 max-w-md opacity-75">
        La página que estás buscando no existe o ha sido movida.
      </p>
      <Link 
        href="/"
        className="px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-opacity-90 transition-all"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
