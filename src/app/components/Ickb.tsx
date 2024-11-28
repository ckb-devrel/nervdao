'use client'
import React, { useEffect, useState } from "react";
import IckbForm from "./IckbForm";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Tooltip } from "react-tooltip";
import { setupWalletConfig, WalletConfig } from "@/cores/config";
import { ccc } from "@ckb-ccc/connector-react";
import { MutatingDots } from "react-loader-spinner";

const Ickb: React.FC = () => {
  const [walletConfig, setWalletConfig] = useState<WalletConfig>();
  const queryClient = new QueryClient()
  const signer = ccc.useSigner()
  useEffect(() => {
    if (!signer || !queryClient) return;
    (async () => {
      const walletConfig = await setupWalletConfig(signer, queryClient)
      setWalletConfig(walletConfig)
    })();
  }, [signer,queryClient]);
  return (
    <QueryClientProvider client={queryClient}>

      <div className="flex flex-col flex-grow lg:flex-row lg:items-stretch gap-6">

        {walletConfig ? <IckbForm walletConfig={walletConfig} /> : <div className="h-full w-full flex  items-center justify-center">
          <MutatingDots
            visible={true}
            height="120"
            color="rgba(71,255,246,1)"
            secondaryColor="rgba(71,255,246,0.8)"

            width="120"
            ariaLabel="fidget-spinner-loading"
            wrapperStyle={{}}
            wrapperClass="fidget-spinner-wrapper"
          />
        </div>
        }

      </div>
      <Tooltip id="my-tooltip" />
      <Tooltip id="order-tooltip"
        events={['click']}
        place={"bottom"}
        style={{
          color: "#fff",
          borderRadius: '8px',
          borderWidth: '1px',
          borderColor: '#FFFFFF33',
          pointerEvents: 'inherit',
          boxShadow: ' 0px 4px 6px -2px #88888814,0px 10px 15px -3px #8888881F',
        }} />
      

    </QueryClientProvider>
  )
}

export default Ickb;
