"use client";

import "./globals.css";
import { Work_Sans, Play } from "next/font/google";
import { ccc } from "@ckb-ccc/connector-react";
import { NotificationProvider } from "@/context/NotificationProvider";
import Notification from "@/app/components/Notification";
import { CSSProperties } from "react";

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
        <ccc.Provider
          connectorProps={{
            style: {
              "--background": "#232323",
              "--divider": "rgba(255, 255, 255, 0.1)",
              "--btn-primary": "#2D2F2F",
              "--btn-primary-hover": "#515151",
              "--btn-secondary": "#2D2F2F",
              "--btn-secondary-hover": "#515151",
              color: "#ffffff",
              "--tip-color": "#666",
            } as CSSProperties,
          }}
        >
          <NotificationProvider>
            {children}
            <Notification />
          </NotificationProvider>
        </ccc.Provider>
      </body>
    </html>
  );
}
