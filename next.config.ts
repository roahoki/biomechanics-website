import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async redirects() {
    return [
      {
        source: '/',
        destination: '/links',
        permanent: true, // Cambia a false si no es una redirección permanente
      },
    ];
  },
};

export default nextConfig;
