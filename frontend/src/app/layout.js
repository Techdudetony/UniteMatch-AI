import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import StickyNav from "./components/StickyNav";
import { OptimizerProvider } from "@/context/OptimizerContext"; 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "UniteMatch AI",
  description: "Optimize your Pokémon Unite team",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#480ad8] text-white`}
      >
        <StickyNav />
        <OptimizerProvider>
          <main>{children}</main>
        </OptimizerProvider>
      </body>
    </html>
  );
}
