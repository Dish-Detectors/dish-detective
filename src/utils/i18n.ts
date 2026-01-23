"use client";

type SupportedLang = "HR" | "EN";

const translations = {
  HR: {
    welcome: "Dobrodošli!",
    login: "Prijava",
    heroTitle: "Poboljšaj svoje iskustvo u menzi",
    heroSubtitle: "Real-time jelovnik u restoranima",
    cardRealTimeMeni: "Real-time meni",
    cardOverview: "Jednostavan pregled menzi",
    cardNotifications: "Obavijesti u stvarnom vremenu",
    student: "Student",
    employee: "Radnik u menzi",
    // Add more strings here
  },
  EN: {
    welcome: "Welcome!",
    login: "Login",
    heroTitle: "Improve your canteen experience",
    heroSubtitle: "Real-time menu in restaurants",
    cardRealTimeMeni: "Real-time menu",
    cardOverview: "Simple canteen overview",
    cardNotifications: "Real-time notifications",
    student: "Student",
    employee: "Canteen Employee",
    // Add more strings here
  },
};

export function getTranslation(lang: SupportedLang = "HR") {
  return translations[lang] || translations.HR;
}

export function getCurrentLang(): SupportedLang {
  if (typeof document === "undefined") return "HR";

  const cookies = document.cookie.split("; ");
  const langCookie = cookies
    .find((c) => c.startsWith("dd_lang="))
    ?.split("=")[1];

  if (langCookie === "EN" || langCookie === "HR") {
    return langCookie;
  }

  return navigator.language.startsWith("hr") ? "HR" : "EN";
}
