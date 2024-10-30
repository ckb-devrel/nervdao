'use client'
import React, { useEffect, useState } from "react";
import IckbForm from "./IckbForm";
import IckbStatus from "./IckbStatus";
import { ccc } from "@ckb-ccc/connector-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { setupWalletConfig, type WalletConfig } from "@/cores/config";
import IckbRecentOrders from "./IckbRecentOrders";
import { Tooltip } from "react-tooltip";

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
  }, [signer, walletConfig, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>

      <div className="flex flex-col flex-grow lg:flex-row lg:items-stretch gap-6">
        
          {walletConfig && <IckbForm walletConfig={walletConfig} />}
        
      </div>
      <Tooltip id="my-tooltip" />

    </QueryClientProvider>
  );
};

export default Ickb;
