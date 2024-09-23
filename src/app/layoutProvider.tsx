"use client";

import { ccc } from "@ckb-ccc/connector-react";
import { NotificationProvider } from "@/context/NotificationProvider";
import Notification from "@/app/components/Notification";
import { CSSProperties } from "react";

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  return (
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
  );
}