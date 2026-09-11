"use client";

import { ccc } from "@ckb-ccc/connector-react";
import { NotificationProvider } from "@/context/NotificationProvider";
import Notification from "@/app/components/Notification";
import { CSSProperties, useEffect, useState } from "react";
import { I18nProvider } from "@/i18n/I18nProvider";

interface ClientOption {
  name: string;
  client: ccc.Client;
}

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [clientOptions, setClientOptions] = useState<ClientOption[]>();

  useEffect(() => {
    const owner = ccc.OwnerAggregated.from([
      ccc.ClientPublicTestnet.open(),
      ccc.ClientPublicMainnet.open(),
    ] as const);
    const [testnet, mainnet] = owner.value;

    setClientOptions([
      { name: "CKB Testnet", client: testnet },
      { name: "CKB Mainnet", client: mainnet },
    ]);

    return () => {
      void owner.dispose().catch(() => {});
    };
  }, []);

  if (!clientOptions) {
    return null;
  }

  const defaultClient =
    clientOptions[process.env.NEXT_PUBLIC_IS_MAINNET === "true" ? 1 : 0].client;

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
          "--icon-primary": "#FFFFFF",
          "--icon-secondary": "rgba(255, 255, 255, 0.6)",
          color: "#ffffff",
          "--tip-color": "#666",
        } as CSSProperties,
      }}
      defaultClient={defaultClient}
      clientOptions={clientOptions}
    >
      <I18nProvider>
        <NotificationProvider>
          {children}
          <Notification />
        </NotificationProvider>
      </I18nProvider>
    </ccc.Provider>
  );
}
