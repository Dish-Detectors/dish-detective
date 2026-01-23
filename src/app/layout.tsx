import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import ThemeRegistry from "@/components/ThemeRegistry";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { I18nProvider } from "@/components/I18nProvider";
import { getServerLang } from "@/utils/i18nServer";

export const metadata: Metadata = {
  title: "Dish Detective",
  description: "Live student canteen food information",
  appleWebApp: {
    title: "Dish",
    statusBarStyle: "default",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Next 15/16: headers()/cookies() are async, so language lookup is async too.
  // Layouts can be async server components.
  const lang = await getServerLang();
  const htmlLang = lang === "HR" ? "hr" : "en";

  return (
    <ClerkProvider>
      <html lang={htmlLang} suppressHydrationWarning>
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
            <I18nProvider initialLang={lang}>
              <div className="dd-app-shell">
                <Header />
                <main className="dd-app-main">{children}</main>
                <Footer />
              </div>
            </I18nProvider>
          </ThemeRegistry>
        </body>
      </html>
    </ClerkProvider>
  );
}
