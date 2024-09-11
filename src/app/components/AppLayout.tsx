/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState } from 'react';
import ConnectWallet from './ConnectWallet';
import Dashboard from './Dashboard';
import { ccc } from '@ckb-ccc/connector-react';
import Title from './Ttitle';
import Deposit from './Deposit';
import Withdraw from './Withdraw';


const AppLayout: React.FC = () => {
  const { wallet } = ccc.useCcc();
  const [currentPage, setCurrentPage] = useState('dashboard');

  const NavItem = ({ href, icon, label }: { href: string; icon: string; label: string }) => {
    const isActive = currentPage === href;

    return (
      <li>
        <div 
          className={`flex flex-col w-full h-14 items-center justify-center hover:bg-gray-700 hover:border-l-2 hover:border-cyan-500 ${
            isActive ? 'bg-gray-700 border-l-2 border-cyan-500' : ''
          }`}
          onClick={() => setCurrentPage(href)}
        >
          <img src={`./svg/${icon}.svg`} alt={label} width={24} height={24} />
          <p className='font-work-sans text-xs transform scale-75'>{label}</p>
        </div>
      </li>
    );
  };
  
  const getTitle = () => {
    switch (currentPage) {
      case 'dashboard':
        return 'Dashboard';
      case 'deposit':
        return 'Deposit';
      case 'withdraw':
        return 'Withdraw';
      case 'history':
        return 'History';
      default:
        return currentPage.charAt(0).toUpperCase() + currentPage.slice(1);
    }
  };

  const renderContent = () => {
    if (!wallet) {
      return <ConnectWallet />;
    }

    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'deposit':
        return <Deposit />;
      case 'withdraw':
        return <Withdraw />;
      // case 'history':
      //   return <History />;
    }
  };
  
  if (!wallet) {
    return <ConnectWallet />;
  }

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      <aside className="w-16 bg-gray-950 py-4 border-r border-white-200">
        <div className="mb-8 flex justify-center">
          <img src="./svg/plain-icon.svg" alt="logo" />
        </div>
        <nav>
          <ul className="flex flex-col gap-2">
            <NavItem href="dashboard" icon="home" label="Dashboard" />
            <NavItem href="deposit" icon="deposit" label="Deposit" />
            <NavItem href="withdraw" icon="withdraw" label="Withdraw" />
            {/* <NavItem href="history" icon="history" label="History" /> */}
          </ul>
        </nav>
      </aside>
      <main className="flex-1 flex flex-col p-8 overflow-auto">
        <Title>{getTitle()}</Title>
        {renderContent()}
      </main>
    </div>
  );
};

export default AppLayout;