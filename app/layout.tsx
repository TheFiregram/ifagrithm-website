import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
});
const body = Inter({ subsets: ["latin"], variable: "--font-body" });

const title = "IFAGRITHM — Web3 Research & Intelligence";
const description = "User behaviour, market research and competitor intelligence for Web3 teams making product and growth decisions.";

export const metadata: Metadata = {
  metadataBase: new URL("https://ifagrithm-website.vercel.app"),
  title,
  description,
  alternates: { canonical: "/" },
  openGraph: { title, description, type: "website", url: "/" },
  twitter: { card: "summary", title, description },
};

// Dark is the brand look; applied before first paint so there is no flash.
const themeScript = `document.documentElement.dataset.theme="dark"`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning className={`${display.variable} ${body.variable}`}>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body>{children}</body>
    </html>
  );
}
