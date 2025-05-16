import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import StickyNav from "./components/StickyNav";
import { OptimizerProvider } from "@/context/OptimizerContext"; 
import { Toaster } from "react-hot-toast";

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
          <Toaster
            position="bottom-center"
            toastOptions={{
              duration: 5000,
              style: {
                background: "#333",
                color: "#ff",
                borderRadius: "12px",
                padding: "14px",
              },
            }}
          />
        </OptimizerProvider>
      </body>
    </html>
  );
}
