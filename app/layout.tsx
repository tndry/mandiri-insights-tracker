import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { MerchantProvider } from '@/contexts/merchant-context';
import { ProductDataProvider } from '@/contexts/product-data-context';
import { ThemeProvider } from '@/components/theme-provider';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "m.it",
  description: "Mandiri Insights Tracker - Analytics Dashboard",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
    other: {
      rel: "icon",
      url: "/icon.png",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ProductDataProvider>
            <MerchantProvider>
              {children}
            </MerchantProvider>
          </ProductDataProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
