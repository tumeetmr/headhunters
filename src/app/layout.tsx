import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { LanguageProvider } from "@/providers/language-provider";
import { SessionProvider } from "@/providers/session-provider";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "Headhunting | Ламбда - Мэргэжлийн Headhunting үйлчилгээ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${manrope.variable} antialiased`}
        style={{ fontFamily: "var(--font-manrope), sans-serif" }}
      >
        <SessionProvider>
          <LanguageProvider>
            <Navbar />
            {children}
            <Footer />
          </LanguageProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
