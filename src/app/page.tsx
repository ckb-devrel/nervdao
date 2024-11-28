"use client"

import { ccc } from "@ckb-ccc/connector-react";
import ConnectWallet from "./components/ConnectWallet";
import AppLayout from "./components/AppLayout";
import 'react-tooltip/dist/react-tooltip.css'

export default function Home() {
  const { wallet } = ccc.useCcc();
  return (
    <div className="min-h-screen bg-black text-white">
      {wallet ? (
        <AppLayout />
      ) : (
        <ConnectWallet />
      )}
    </div>
  );
}
