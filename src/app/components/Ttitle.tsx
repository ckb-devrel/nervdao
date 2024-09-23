import { truncateAddress } from "@/utils/stringUtils";
import { ccc } from "@ckb-ccc/connector-react";
import { Wallet } from "lucide-react";
import React, { useEffect, useState } from "react";

interface TitleProps {
  children: React.ReactNode;
  className?: string;
}

const Title: React.FC<TitleProps> = ({ children, className = "" }) => {
  const signer = ccc.useSigner();
  const { open } = ccc.useCcc();

  const [internalAddress, setInternalAddress] = useState("");

  useEffect(() => {
    (async () => {
      if (!signer) {
        return;
      }
      setInternalAddress(await signer.getInternalAddress());
    })();
  }, [signer]);

  return (
    <div
      className={`font-play text-white w-full flex justify-between items-center mb-4 ${className}`}
    >
      <h1 className="text-2xl font-bold">{children}</h1>
      <button
        className="bg-gray-900 border-white/20 border rounded-full p-2 px-4 flex gap-2"
        onClick={open}
      >
        <Wallet />
        {truncateAddress(internalAddress)}
      </button>
    </div>
  );
};

export default Title;
