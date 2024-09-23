/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import { Dashboard } from "./Dashboard";
import Title from "./Ttitle";
import Deposit from "./Deposit";
import { Withdraw } from "./Withdraw";

const AppLayout: React.FC = () => {
  const [currentPage, setCurrentPage] = useState("dashboard");

  const NavItem = ({
    href,
    icon,
    label,
  }: {
    href: string;
    icon: string;
    label: string;
  }) => {
    const isActive = currentPage === href;

    return (
      <li
        className={`flex flex-col flex-grow min-w-14 py-2 items-center justify-center hover:bg-gray-700 hover:border-b-2 lg:hover:border-b-0 lg:hover:border-l-2 border-cyan-500 ${
          isActive ? "bg-gray-700 border-b-2 lg:border-b-0 lg:border-l-2" : ""
        }`}
        onClick={() => setCurrentPage(href)}
      >
        <img src={`./svg/${icon}.svg`} alt={label} className="w-7 h-7" />
        <p className="font-work-sans text-xs transform scale-75">{label}</p>
      </li>
    );
  };

  const getTitle = () => {
    switch (currentPage) {
      case "dashboard":
        return "Dashboard";
      case "deposit":
        return "Deposit";
      case "withdraw":
        return "Withdraw";
      case "history":
        return "History";
      default:
        return currentPage.charAt(0).toUpperCase() + currentPage.slice(1);
    }
  };

  const renderContent = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard setCurrentPage={setCurrentPage} />;
      case "deposit":
        return <Deposit />;
      case "withdraw":
        return <Withdraw setCurrentPage={setCurrentPage} />;
      // case 'history':
      //   return <History />;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row lg:h-screen bg-gray-950 text-white">
      <aside className="bg-gray-950 px-8 lg:px-0 lg:py-8 border-b lg:border-b-0 lg:border-r border-white-200 flex lg:flex-col items-stretch">
        <div className="mr-6 lg:mr-0 lg:mb-6 flex justify-center items-center">
          <img src="./svg/plain-icon.svg" alt="logo" className="w-12 h-12" />
        </div>
        <nav className="flex items-stretch">
          <ul className="flex gap-2 lg:flex-col items-stretch">
            <NavItem href="dashboard" icon="home" label="Dashboard" />
            <NavItem href="deposit" icon="deposit" label="Deposit" />
            <NavItem href="withdraw" icon="withdraw" label="Redeem" />
          </ul>
        </nav>
      </aside>
      <main className="flex-1 flex flex-col py-8 px-4 lg:px-8 overflow-auto">
        <Title>{getTitle()}</Title>
        {renderContent()}
      </main>
    </div>
  );
};

export default AppLayout;
