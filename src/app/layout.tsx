import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const titleFont = Plus_Jakarta_Sans({
  variable: "--font-title",
  subsets: ["latin"],
});

const bodyFont = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Marketing Digital Top",
  description: "Como Derrotar a Ansiedade na prática, no dia a dia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${titleFont.variable} ${bodyFont.variable} antialiased`}>{children}</body>
    </html>
  );
}
