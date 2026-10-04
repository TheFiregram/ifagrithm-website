import { Suspense } from "react";
import type { Metadata } from "next";
import CardStudio from "@/components/CardStudio";

export const metadata: Metadata = {
  title: "Card Studio — IFAGRITHM Research Network",
  description: "Create your approved IFAGRITHM research network member card.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/network" },
};

export default function NetworkPage() {
  return (
    <Suspense fallback={null}>
      <CardStudio />
    </Suspense>
  );
}
