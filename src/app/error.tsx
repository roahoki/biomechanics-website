"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Opcionalmente, registrar el error en un servicio de análisis
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4 bg-gradient-to-b from-gray-900 to-black text-white">
      <h1 className="text-6xl font-bold mb-4">¡Ups!</h1>
      <h2 className="text-2xl font-semibold mb-8">Algo salió mal</h2>
      <p className="mb-8 max-w-md opacity-75">
        Ha ocurrido un error al procesar tu solicitud. Nuestro equipo ha sido notificado.
      </p>
      <button
        onClick={() => reset()}
        className="px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-opacity-90 transition-all"
      >
        Intentar de nuevo
      </button>
    </div>
  );
}
