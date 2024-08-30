import { Provider } from "react-redux";
import "./globals.css";
import { Cabin } from "next/font/google";
import Providers from "./provider";
import { Toaster } from "@components/ui/toaster";
import { ChakraProvider } from '@chakra-ui/react'
import SidebarWithHeader from "@components/Sidenav";
const cabin = Cabin({ subsets: ["latin"] });

export const metadata = {
  title: "Admin",
  description: "Admin panel",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={cabin.className}>
        <ChakraProvider>
        <Providers>
          <SidebarWithHeader >
          {children}
          </SidebarWithHeader>
          </Providers>
        <Toaster />
        </ChakraProvider>
      </body>
    </html>
  );
}
