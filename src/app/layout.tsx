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
      <html lang="hr" suppressHydrationWarning>
        <head>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  try {
                    var localValue = localStorage.getItem('themeMode');
                    var supportDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches === true;
                    if (localValue === 'dark' || (!localValue && supportDarkMode)) {
                      document.documentElement.classList.add('dark');
                    } else {
                      document.documentElement.classList.remove('dark');
                    }
                  } catch (e) {}
                })();
              `,
            }}
          />
        </head>
        <body suppressHydrationWarning={true}>
          <ThemeRegistry>
            <Header />
            {children}
            <Footer />
          </ThemeRegistry>
        </body>
      </html>
    </ClerkProvider>
  );
}
