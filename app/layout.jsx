import { Provider } from "react-redux";
import "./globals.css";
import { Inter } from "next/font/google";
import Providers from "./provider";
import { Toaster } from "@components/ui/toaster";
import { ChakraProvider } from '@chakra-ui/react'
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
        <ChakraProvider>
        <Providers>
          <Suspense>
          <SidebarWithHeader>
            {children}
          </SidebarWithHeader>
          </Suspense>
          </Providers>
        <Toaster />
        </ChakraProvider>
      </body>
      
    </html>
  );
}