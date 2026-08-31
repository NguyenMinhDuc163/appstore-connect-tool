import type { Metadata } from "next";
import { Fira_Code, Fira_Sans } from "next/font/google";
import "./globals.css";
const sans=Fira_Sans({variable:"--font-sans",subsets:["latin"],weight:["400","500","600","700"]});
const mono=Fira_Code({variable:"--font-mono",subsets:["latin"]});
export const metadata:Metadata={title:{default:"Apple Ops",template:"%s · Apple Ops"},description:"A focused operations console for App Store Connect."};
const themeScript=`try{document.documentElement.dataset.theme=localStorage.getItem("apple-ops-theme")||"system"}catch{}`;
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" className={`${sans.variable} ${mono.variable}`} suppressHydrationWarning><head><script dangerouslySetInnerHTML={{__html:themeScript}}/></head><body>{children}</body></html>}
