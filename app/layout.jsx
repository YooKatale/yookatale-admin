import "./globals.css";
import { Inter } from "next/font/google";
import Providers from "./provider";
import SidebarWithHeader from "@components/Sidenav";
import Navbar from "@components/Navbar";
import { Suspense } from "react";
const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });

export const metadata = {
  title: "Admin",
  description: "Admin panel",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className} style={{ fontFamily: 'Inter, sans-serif' }}>
        <Providers>
          <Suspense>
          <SidebarWithHeader>
            {children}
          </SidebarWithHeader>
          </Suspense>
          </Providers>
      </body>
      
    </html>
  );
}