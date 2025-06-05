import type { Metadata } from "next";
import "../styles/globals.css";
import AdminBadge from '@/components/AdminBadge'

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
    <html lang="en">
      <body>
        {children}
        <AdminBadge />
      </body>
    </html>
  );
}
