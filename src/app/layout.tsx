import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { LangSync } from "@/components/eswen/lang-sync";
import { SiteConfigProvider } from "@/lib/eswen/site-config-context";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const siteUrl = "https://eswenmedica.id";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Eswen Medica — Health • Wellness • Confidence | Premium Medical Clinic in Bali",
    template: "%s | Eswen Medica",
  },
  description:
    "Eswen Medica is a premium medical clinic in Bali offering comprehensive healthcare, dermatology, wellness, and preventive care for international guests, expats, and locals. Smart booking, secure deposit, AI triage assistant, and trusted specialists.",
  keywords: [
    "Medical Clinic Bali",
    "Health Clinic Bali",
    "Dermatology Bali",
    "Skin Clinic Bali",
    "Medical Check-up Bali",
    "Travel Medicine Bali",
    "Doctor Bali",
    "General Practitioner Bali",
    "Preventive Care Bali",
    "Medical Tourism Bali",
    "Eswen Medica",
    "Bali expat clinic",
  ],
  authors: [{ name: "Eswen Medica" }],
  creator: "Eswen Medica",
  publisher: "Eswen Medica",
  alternates: {
    canonical: siteUrl,
    languages: {
      en: siteUrl,
      id: `${siteUrl}/id`,
    },
  },
  openGraph: {
    title: "Eswen Medica — Health • Wellness • Confidence",
    description:
      "Premium medical and wellness care in Bali, delivered by trusted professionals with modern technology and international standards.",
    url: siteUrl,
    siteName: "Eswen Medica",
    locale: "en_US",
    alternateLocale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Eswen Medica — Health • Wellness • Confidence",
    description:
      "Premium medical and wellness care in Bali, delivered by trusted professionals with international standards.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/logo.svg",
  },
  category: "health",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Schema.org MedicalClinic + LocalBusiness structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "MedicalClinic",
              name: "Eswen Medica",
              description:
                "Premium medical clinic in Bali offering comprehensive healthcare, dermatology, wellness, and preventive care for international guests and locals.",
              url: siteUrl,
              telephone: "+62-361-XXX-XXXX",
              email: "hello@eswenmedica.id",
              address: {
                "@type": "PostalAddress",
                streetAddress: "Jl. Sunset Road No. 88",
                addressLocality: "Kuta",
                addressRegion: "Bali",
                postalCode: "80361",
                addressCountry: "ID",
              },
              geo: {
                "@type": "GeoCoordinates",
                latitude: -8.6855,
                longitude: 115.1669,
              },
              openingHoursSpecification: [
                {
                  "@type": "OpeningHoursSpecification",
                  dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                  opens: "08:00",
                  closes: "20:00",
                },
              ],
              priceRange: "$$",
              areaServed: ["Bali", "Indonesia"],
              medicalSpecialty: ["GeneralPractice", "Dermatology", "PublicHealth", "Physician"],
            }),
          }}
        />
      </head>
      <body
        className={`${jakarta.variable} font-sans antialiased bg-background text-foreground`}
      >
        <SiteConfigProvider>
          <LangSync />
          {children}
        </SiteConfigProvider>
        <Toaster />
      </body>
    </html>
  );
}
