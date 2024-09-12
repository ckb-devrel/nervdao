"use client"

import "./globals.css";
import { Work_Sans, Play } from 'next/font/google';
import { ccc } from '@ckb-ccc/connector-react';
import { NotificationProvider } from "@/context/NotificationProvider";
import Notification from "@/app/components/Notification";

const workSans = Work_Sans({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-work-sans',
})

const play = Play({ 
  subsets: ['latin'], 
  weight: ['400', '700'],
  variable: '--font-play',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${workSans.variable} ${play.variable}`}>
        <ccc.Provider>
         <NotificationProvider>
            <>
              {children}
              <Notification />
            </>
          </NotificationProvider>
        </ccc.Provider>
      </body>
    </html>
  )
}