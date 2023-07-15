import { Provider } from "react-redux";
import "./globals.css";
import { Cabin } from "next/font/google";
import Providers from "./provider";
import { Toaster } from "@components/ui/toaster";

const cabin = Cabin({ subsets: ["latin"] });

export const metadata = {
  title: "Admin",
  description: "Admin panel",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={cabin.className}>
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
