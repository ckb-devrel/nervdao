'use client'
import React,{use, useEffect} from "react";
import { DashboardRecentTransactions } from "./DashboardRecentTransactions";
import IckbForm from "./IckbForm";
import IckbStatus from "./IckbStatus";
import { IckbConfigProvider } from "@/context/IckbConfigProvider";

import { useQuery } from "@tanstack/react-query";
import { l1StateOptions } from "@/utils/query";
import { ccc } from "@ckb-ccc/connector-react";
import {
  maxWaitTime,
  txInfoFrom,
  type RootConfig,
  type WalletConfig,
} from "../../utils/utils";
import { useIckbContext } from "@/context/IckbConfigProvider";
import { getIckbScriptConfigs } from "@ickb/v1-core";
import { chainConfigFrom } from "@ickb/lumos-utils";
import { prefetchData } from "../../utils/query";

const Ickb: React.FC =  () => {
  const { wallet, open } = ccc.useCcc();

  return (
    <IckbConfigProvider walletConfig={wallet}>
    <div className="flex flex-col flex-grow lg:flex-row lg:items-stretch gap-6">
      <div className="space-y-6 flex flex-col flex-1">
        <IckbForm />
      </div>
      <div className="flex-1 flex-row">
      <IckbStatus />
      <DashboardRecentTransactions
        isRedeeming={false}
        title="Recent Deposits"
        className="flex-grow"
      />
      </div>
    </div>
    </IckbConfigProvider>
  );
};

export default Ickb;
