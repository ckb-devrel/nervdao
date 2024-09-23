import "./globals.css";
import { Work_Sans, Play } from "next/font/google";
import { Metadata } from "next";
import { LayoutProvider } from "./layoutProvider";

export const metadata: Metadata = {
  title: "NervDAO",
  description: "A Universal Wallet-Interfaced Nervos DAO Portal",
  icons: "/favicon.svg",
};

const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-work-sans",
});

const play = Play({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-play",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${workSans.variable} ${play.variable}`}>
        <LayoutProvider>{children}</LayoutProvider>
      </body>
    </html>
  );
}
