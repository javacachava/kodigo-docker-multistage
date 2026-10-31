import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart/cart-context";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/auth/dal";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kodigo Store",
  description: "Frontend Next.js para la API de e-commerce de Kodigo.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();

  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <CartProvider>
          <SiteHeader user={user} />
          <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
        </CartProvider>
      </body>
    </html>
  );
}
