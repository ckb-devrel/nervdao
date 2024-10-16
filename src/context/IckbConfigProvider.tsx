 
import { createContext, useContext } from 'react'
import {
    I8Script,
    addWitnessPlaceholder,
    lockExpanderFrom,
  } from "@ickb/lumos-utils";
  import { ccc } from "@ckb-ccc/connector-react";

export const IckbContext = createContext<Promise<any> | null>(null)
 
export function IckbConfigProvider({
  children,
  walletConfig,
}: {
  children: React.ReactNode
  walletConfig: any
}) {
    console.log(walletConfig)
    
  return (
    <IckbContext.Provider value={walletConfig}>{children}</IckbContext.Provider>
  )
}
 
export function useIckbContext() {
  let context = useContext(IckbContext)
  if (!context) {
    throw new Error('useIckbContext must be used within a IckbConfigProvider')
  }
  return context
}