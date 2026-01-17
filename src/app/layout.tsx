import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import ThemeRegistry from "@/components/ThemeRegistry";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Dish Detective",
  description: "Live student canteen food information",
  appleWebApp: {
    title: "Dish",
    statusBarStyle: "default",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="hr">
        <body suppressHydrationWarning={true}>
          <ThemeRegistry>
            <Header />
            <Footer>{children}</Footer>
          </ThemeRegistry>
        </body>
      </html>
    </ClerkProvider>
  );
}
