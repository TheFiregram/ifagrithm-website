import type { Metadata } from "next";
import "./globals.css";

const title = "IFAGRITHM | Web3 Research & Intelligence";
const description = "User behaviour, market research and competitor intelligence for Web3 teams making product and growth decisions.";

export const metadata: Metadata = {
  metadataBase: new URL(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL || "ifagrithm-seven.vercel.app"}`),
  title,
  description,
  alternates: { canonical: "/" },
  openGraph: { title, description, type: "website", url: "/" },
  twitter: { card: "summary", title, description },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" data-theme="dark"><body>{children}</body></html>;
}
