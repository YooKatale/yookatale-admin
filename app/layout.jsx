import "./globals.css";
import Providers from "./provider";
import SidebarWithHeader from "@components/Sidenav";
import { Suspense } from "react";
import { Toaster } from "@components/ui/toaster";

export const metadata = {
  title: "Yookatale Admin",
  description: "Yookatale Admin Dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body style={{ fontFamily: "'Bricolage Grotesque', 'Inter', system-ui, sans-serif" }} suppressHydrationWarning>
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
