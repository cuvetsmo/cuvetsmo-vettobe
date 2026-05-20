import type { Metadata } from "next";
import { cookies } from "next/headers";
import { IBM_Plex_Sans_Thai, Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { SiteHeader, SiteFooter } from "@/components/Brand";
import { EcosystemBar } from "@/components/EcosystemBar";
import { MobileBottomNav } from "@/components/MobileBottomNav";

const THEME_BOOTSTRAP = `(function(){try{var c=document.cookie.match(/(?:^|;\\s*)vettobe-theme=(light|dark)/);var t=c?c[1]:(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme='light';}})();`;

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const ibmPlexSansThai = IBM_Plex_Sans_Thai({
  variable: "--font-ibm-plex-sans-thai",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://vettobe.cuvetsmo.com"),
  title: {
    default: "Vet to be — ศูนย์รวมโครงการ Vet to be CUVET",
    template: "%s — Vet to be",
  },
  description:
    "ศูนย์รวมโครงการ Vet to be ของคณะสัตวแพทย์ จุฬาฯ — ค้นหาประสบการณ์ฝึกงานย้อนหลัง รีวิวแผนก และจัดการรอบฝึกใหม่ในที่เดียว",
  applicationName: "Vet to be",
  keywords: [
    "vet to be",
    "cuvet",
    "chulalongkorn vet",
    "veterinary internship",
    "ฝึกงานสัตวแพทย์",
    "โรงพยาบาลสัตว์เล็ก จุฬาฯ",
    "cuvetsmo",
  ],
  authors: [{ name: "CUVETSMO" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Vet to be — ศูนย์รวมโครงการ Vet to be CUVET",
    description:
      "ค้นหาประสบการณ์ฝึก Vet to be ย้อนหลัง รีวิวแผนก และจัดการรอบฝึกใหม่ ในที่เดียว",
    type: "website",
    locale: "th_TH",
    alternateLocale: ["en_US"],
    url: "https://vettobe.cuvetsmo.com",
    siteName: "Vet to be",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vet to be — ศูนย์รวมโครงการ Vet to be CUVET",
    description: "ค้นหาประสบการณ์ฝึกย้อนหลัง รีวิวแผนก จัดการรอบฝึกใหม่",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Read theme cookie SSR-side so [data-theme] is correct in initial HTML.
  // If absent (first visit), default to "light" and let the inline script
  // upgrade to prefers-color-scheme before paint.
  const cookieStore = await cookies();
  const ssrTheme = cookieStore.get("vettobe-theme")?.value === "dark" ? "dark" : "light";

  return (
    <html
      lang="th"
      data-theme={ssrTheme}
      className={`${inter.variable} ${ibmPlexSansThai.variable} ${sourceSerif.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
      </head>
      <body className="min-h-full flex flex-col pb-16 md:pb-0">
        <EcosystemBar />
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <MobileBottomNav />
      </body>
    </html>
  );
}
