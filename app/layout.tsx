import type { Metadata } from "next";
import { Inter, Cairo } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { LanguageProvider } from "@/contexts/language-context";
import { getServerLocale } from "@/lib/server-i18n";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Lumière Jewelry - Timeless Elegance",
    template: "%s | Lumière Jewelry",
  },
  description:
    "Discover our exquisite collection of handcrafted jewelry. From diamond engagement rings to pearl necklaces — timeless pieces for every occasion.",
  keywords: ["jewelry", "diamonds", "rings", "necklaces", "earrings", "gold", "luxury"],
  authors: [{ name: "Lumière Jewelry" }],
  creator: "Lumière Jewelry",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "Lumière Jewelry",
    title: "Lumière Jewelry - Timeless Elegance",
    description:
      "Discover our exquisite collection of handcrafted jewelry. Timeless pieces for every occasion.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lumière Jewelry",
    description: "Timeless handcrafted jewelry for every occasion.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getServerLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body className={`${inter.variable} ${cairo.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider initialLocale={locale}>
            {children}
            <Toaster richColors position="top-right" />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
