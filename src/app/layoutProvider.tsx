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

function LoadingScreen() {
  return (
    <div
      className="flex h-dvh flex-col items-stretch bg-black text-white lg:flex-row"
      aria-busy="true"
    >
      <div className="flex h-[33dvh] flex-1 p-6 lg:h-full">
        <div className="flex h-full flex-1 items-stretch justify-center overflow-hidden rounded-lg">
          <img
            src="./svg/none-login-bg.svg"
            alt=""
            className="w-full object-cover lg:h-full lg:w-auto"
          />
        </div>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center p-6">
        <img src="./svg/icon-text.svg" alt="NervDAO" width={346} height={88} />
        <div
          className="mt-12 flex items-center gap-3 text-white/60"
          role="status"
          aria-live="polite"
        >
          <span
            className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-cyan-400"
            aria-hidden="true"
          />
          <span className="font-work-sans text-body-2">Loading...</span>
        </div>
      </div>
    </div>
  );
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
    return <LoadingScreen />;
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
