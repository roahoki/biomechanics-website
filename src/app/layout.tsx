import type { Metadata } from "next";
import "../styles/globals.css";
import Navbar from "@/components/Navbar";
import { DM_Sans } from "next/font/google";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});


export const metadata: Metadata = {
  title: "Biomechanics DJ",
  description: "Biomechanics DJ is the professional portfolio of Biomechanics DJ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans} flex flex-col items-center justify-center h-screen p-4 bg-gradient-to-b from-[#111111] to-[#000000] text-white`}>
        <Navbar/>
        {children}
      </body>
    </html>
  );
}
