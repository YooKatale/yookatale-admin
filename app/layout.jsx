import "./globals.css";
import { Inter } from "next/font/google";
import Providers from "./provider";
import SidebarWithHeader from "@components/Sidenav";
import { Suspense } from "react";
import { Toaster } from "@components/ui/toaster";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: "Admin",
  description: "Admin panel",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} style={{ fontFamily: 'Inter, sans-serif' }} suppressHydrationWarning>
        <Providers>
          <Suspense>
            <SidebarWithHeader>
              {children}
            </SidebarWithHeader>
          </Suspense>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
