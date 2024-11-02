'use client'
import React, { useEffect, useState } from "react";
import IckbForm from "./IckbForm";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Tooltip } from "react-tooltip";
import { setupWalletConfig, WalletConfig } from "@/cores/config";
import { ccc } from "@ckb-ccc/connector-react";
const Ickb: React.FC = () => {
  const [walletConfig, setWalletConfig] = useState<WalletConfig>();
  const queryClient = new QueryClient()
  const signer = ccc.useSigner()
  useEffect(() => {
    if (!signer||!queryClient) return;
    (async () => {
      const walletConfig = await setupWalletConfig(signer,queryClient)
      setWalletConfig(walletConfig)
    })();
  }, []);
  return (
    <QueryClientProvider client={queryClient}>

      <div className="flex flex-col flex-grow lg:flex-row lg:items-stretch gap-6">

        {walletConfig&&<IckbForm walletConfig={walletConfig}  />}

      </div>
      <Tooltip id="my-tooltip" />

    </QueryClientProvider>
  )
}

export default Ickb;
