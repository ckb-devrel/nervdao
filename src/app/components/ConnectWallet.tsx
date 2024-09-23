/* eslint-disable @next/next/no-img-element */
import React from "react";
import { ccc } from "@ckb-ccc/connector-react";

const ConnectWallet: React.FC = () => {
  const { open } = ccc.useCcc();

  return (
    <div className="flex flex-col lg:flex-row items-stretch h-dvh bg-black text-white">
      <div className="h-[33dvh] lg:h-full p-6 flex-1 flex">
        <div className="rounded-lg overflow-hidden h-full flex-1 flex items-stretch justify-center">
          <img
            src="./svg/none-login-bg.svg"
            alt="nervdao"
            className="w-full lg:w-auto lg:h-full object-cover"
          />
        </div>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center p-6">
        <img src="./svg/icon-text.svg" alt="nervdao" width={346} height={88} />
        <p className="font-work-sans text-white-50 mt-6 mb-12 text-center">
          A Universal Wallet-Interfaced Nervos DAO Portal
        </p>
        <button
          onClick={open}
          className="font-bold bg-btn-gradient text-gray-800 text-body-2 py-3 px-8 rounded-lg hover:bg-btn-gradient-hover transition duration-200"
        >
          Connect Wallet
        </button>
      </div>
    </div>
  );
};

export default ConnectWallet;
