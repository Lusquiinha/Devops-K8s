import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "../contexts/AuthContext";
import "./globals.css";
import Navbar from "../components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Plataforma de Consultoria",
  description: "Tire as suas dúvidas com os nossos consultores",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body className={`${inter.className} bg-gray-900 text-white font-sans`}>
        <AuthProvider>
            <Navbar />
            <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}