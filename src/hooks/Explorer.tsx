import { ccc } from "@ckb-ccc/connector-react";
import Link from "next/link";

export function useGetExplorerLink() {
  const { client } = ccc.useCcc();

  const prefix =
    client.addressPrefix === "ckb"
      ? "https://explorer.nervos.org"
      : "https://pudge.explorer.nervos.org";

  return {
    index: prefix,
    explorerAddress: (addr: string, display?: string) => {
      return (
        <Link
          className="underline"
          href={`${prefix}/address/${addr}`}
          target="_blank"
        >
          {display ?? addr}
        </Link>
      );
    },
    explorerTransaction: (txHash: string, display?: string) => {
      return (
        <Link
          className="underline"
          href={`${prefix}/transaction/${txHash}`}
          target="_blank"
        >
          {display ?? txHash}
        </Link>
      );
    },
  };
}