import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./globals.css";
import "./styles/cosmetic-theme.css";
import ClientLayout from "./ClientLayout";
import NavbarComponent from './components/Navbar';
import PayPalProvider from "./components/paypalProvider";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://tienda-papers.vercel.app/'),
  title: {
    default: "Tiffanys - Tienda de Suministros y variedades",
    template: "%s | Tiffany's"
  },
  description: "Descubre los mejores suministros de oficina en Tiffany's, cosmeticos, productos orgánicos y mucho más.",
  keywords: [
    "tienda de suministros de oficina",
    "papelería online",
    "material de oficina",
    "accesorios de escritorio",
    "organización",
    "escritorio",
    "papelería",
    "material de oficina",
    "accesorios de escritorio",
    "organización",
    "cosmeticos",
    "bisuteria"
  ],
  authors: [{ name: "Nexel" }],
  creator: "Nexel",
  publisher: "Nexel",
  applicationName: "Tiffany's",
  category: "E-commerce",
  classification: "Office supplies and many more",
  manifest: '/manifest.json',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://tienda-papers.vercel.app",
    siteName: "Tiffany's",
    title: "Tiffanys - Tienda de Suministros y variedades",
    description: "Descubre los mejores suministros de oficina en Tiffany's. Hechos de la mejor calidad para tu espacio de trabajo.",
    images: [
      {
        url: "/logoShop1.png",
        width: 1200,
        height: 630,
        alt: "Tiffanys - Tienda de Suministros y variedades",
        type: "image/png",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@tienda-papers",
    creator: "@tiffanys",
    title: "Tiffanys - Tienda de Suministros y variedades",
    description: "Descubre los mejores suministros en Tiffany's. Hechos de la mejor calidad para tu espacio de trabajo, y mucho más.",
    images: ["/logoShop1.png"],
  },
  verification: {
    google: "google-site-verification-code", // Reemplazar con tu código real
    // yandex: "yandex-verification-code",
    // yahoo: "yahoo-site-verification-code",
  },
  alternates: {
    canonical: "https://tienda-papers.vercel.app/",
    languages: {
      'es-ES': 'https://tienda-papers.vercel.app/',
    },
  },
  other: {
    'theme-color': '#000000',
    'color-scheme': 'light',
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'Tyffanys',
    'format-detection': 'telephone=no',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/logoShop1.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/logoShop1.png" />
        <link rel="shortcut icon" href="/logoShop1.png" type="image/png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/logoShop1.png" />
        <meta name="theme-color" content="#000000" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-TileImage" content="/logoShop1.png" />
        <meta name="description" content= "Descubre los mejores suministros de oficina en Tiffany's, cosmeticos, productos orgánicos y mucho más" />

      </head>
      <body  className={`${geistSans.variable} ${geistMono.variable}`}>
          <ClientLayout>
            <NavbarComponent />
            <PayPalProvider>
              {children}
            </PayPalProvider>
          </ClientLayout>

      </body>
    </html>
  );
}
