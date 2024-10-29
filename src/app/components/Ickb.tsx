'use client'
import React, { useEffect, useState } from "react";
import IckbForm from "./IckbForm";
import IckbStatus from "./IckbStatus";
import { ccc } from "@ckb-ccc/connector-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { setupWalletConfig, type WalletConfig } from "@/cores/config";
import IckbRecentOrders from "./IckbRecentOrders";

const Ickb: React.FC = () => {
  const [walletConfig, setWalletConfig] = useState<WalletConfig>();
  const queryClient = new QueryClient()
  const signer = ccc.useSigner()
  useEffect(() => {
    if (!signer) return;

    (async () => {
      const walletConfig = await setupWalletConfig(signer)

      const setupConfig = {
        ...walletConfig,
        queryClient: queryClient
      }
      //@ts-expect-error '0xstring&&string'
      setWalletConfig(setupConfig)

    })();
  }, [signer]);
  return (
    <QueryClientProvider client={queryClient}>
      {walletConfig &&
        <div className="flex flex-col flex-grow lg:flex-row lg:items-stretch gap-6">
          <div className="space-y-6 flex flex-col flex-1">
            <IckbForm  walletConfig={walletConfig}  />
          </div>
          <div className="flex-1 flex-row">
            <IckbStatus  walletConfig={walletConfig}  />
            <IckbRecentOrders walletConfig={walletConfig}  />
          </div>
        </div>}
    </QueryClientProvider>
  );
};

export default Ickb;
