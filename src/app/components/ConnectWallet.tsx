/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { ccc } from "@ckb-ccc/connector-react";

const ConnectWallet: React.FC = () => {
  const { open } = ccc.useCcc();

  return (
    <div className="flex items-center min-h-screen bg-black text-white">
      <div className='max-h-screen p-6 flex items-center justify-center'>
        <img 
          src="./svg/none-login-bg.svg" 
          alt="nervdao" 
          className='max-h-[calc(100vh-3rem)] w-auto object-contain'
        />
      </div>
      <div className='flex flex-1 flex-col items-center justify-center'>
        <img src="./svg/icon-text.svg" alt="nervdao" width={346} height={88} />
        <p className='font-work-sans text-white-50 mt-6 mb-12'>A Universal Wallet-Interfaced Nervos DAO Portal</p>
        <button onClick={open} className='bg-gray-900 hover:bg-gray-700 w-[426px] h-14 rounded'>Connect Wallet</button>
      </div>
    </div>
  );
}

export default ConnectWallet;
