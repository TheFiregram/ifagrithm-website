import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title:"IFAGRITHM — Web3 Data & Research", description:"IFAGRITHM investigates the questions behind Web3 business decisions using data, research and behavioural analysis.", openGraph:{title:"IFAGRITHM — Web3 Data & Research",description:"We investigate the questions behind business decisions.",type:"website"}, twitter:{card:"summary_large_image",title:"IFAGRITHM — Web3 Data & Research",description:"From behaviour to decisions."} };
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
