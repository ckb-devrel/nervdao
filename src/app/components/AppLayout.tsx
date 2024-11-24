/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import { Dashboard } from "./Dashboard";
import Title from "./Ttitle";
import Deposit from "./Deposit";
import { icons, Info, Menu } from "lucide-react";
import { useGetExplorerLink } from "@/hooks/Explorer";
import Ickb from "./Ickb";
import { Tooltip } from "react-tooltip";
import ReactDOMServer from "react-dom/server";
import IckbInfo from "./IckbInfo";

function NavItem({
  icon,
  label,
  isActive,
  onClick,
  iconName
}: {
  icon: keyof typeof icons;
  iconName?: string;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}) {
  const Icon = icons[icon]
  return (
    <li
      className={`flex flex-col cursor-pointer flex-grow min-w-14 py-2 items-center  justify-center hover:bg-gray-700 hover:border-b-2 lg:border-l-2 lg:hover:border-b-0 lg:hover:border-l-2 hover:border-cyan-500 ${isActive ? "bg-gray-700 border-b-2 lg:border-b-0 lg:border-l-2 border-cyan-500" : "border-gray-950"
        }`}
      onClick={onClick}
    >
      {iconName ? <img src={"/svg/icon-" + iconName + ".svg"} alt="ickb" className="w-7 h-7" /> : <Icon className="w-7 h-7" />}

      <p className="font-work-sans text-xs transform scale-75">{label}</p>
    </li>
  );
}

function NavItemMobile({
  iconName,
  icon,
  label,
  isActive,
  onClick,
}: {
  iconName?: string;
  icon: keyof typeof icons;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}) {
  const Icon = icons[icon];

  return (
    <li
      className={`flex flex-grow cursor-pointer min-w-14 pl-6 py-2 items-center border-cyan-500 ${isActive ? "bg-gray-700 border-b-2 lg:border-b-0 lg:border-l-2" : ""
        }`}
      onClick={onClick}
    >
      {iconName ? <img src={"/svg/icon-" + iconName + ".svg"} alt="ickb" className="w-7 h-7" /> : <Icon className="w-7 h-7" />}
      <p className="font-work-sans transform scale-75">{label}</p>
    </li>
  );
}

const AppLayout: React.FC = () => {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [isOpen, setIsOpen] = useState(false);
  const { index } = useGetExplorerLink();

  const getTitle = () => {
    switch (currentPage) {
      case "dashboard":
        return 'Dashboard';
      case "deposit":
        return "Deposit";
      case "ickb":
        return <>
          iCKB
          <a
            data-tooltip-id="top-tooltip"
            className="hidden sm:block "
            data-tooltip-html={ReactDOMServer.renderToStaticMarkup(IckbInfo())}
          >
            <Info className="w-5 h-5 cursor-pointer ml-1 inline-block" />
          </a>
        </>;
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
      case "ickb":
        return <Ickb />;
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:h-screen bg-gray-950 text-white">
      <aside className="bg-gray-950 px-0 pt-8 pb-4 border-r border-white-200 sm:flex flex-col items-stretch hidden">
        <div className="mb-6 flex justify-center items-center">
          <img src="./svg/plain-icon.svg" alt="logo" className="w-12 h-12" />
        </div>
        <nav className="flex items-stretch flex-grow">
          <ul className="flex gap-2 flex-col items-stretch justify-between flex-grow">
            <div className="flex flex-col items-stretch gap-2">
              <NavItem
                icon="House"
                label="Dashboard"
                isActive={currentPage === "dashboard"}
                onClick={() => setCurrentPage("dashboard")}
              />
              <NavItem
                icon="Download"
                label="Deposit"
                isActive={currentPage === "deposit"}
                onClick={() => setCurrentPage("deposit")}
              />
              <NavItem
                iconName="ickb"
                icon="ChartBarBig"
                label="iCKB"
                isActive={currentPage === "ickb"}
                onClick={() => setCurrentPage("ickb")}
              />
              <NavItem
                icon="ChartBarBig"
                label="Explore"
                onClick={() => window.open(`${index}/nervosdao`, "_blank")}
              />
            </div>
            <div className="flex flex-col items-stretch gap-2">
              <NavItem
                icon="Twitter"
                label="About us"
                onClick={() => window.open("https://x.com/CKBDevrel", "_blank")}
              />
              <NavItem
                icon="Github"
                label="Source"
                onClick={() => window.open("https://github.com/ckb-ecofund/nervdao", "_blank")}
              />
            </div>
          </ul>
        </nav>
      </aside>
      <aside className="bg-gray-950 border-b border-white-200 flex flex-col items-stretch sm:hidden">
        <div className="mx-4 py-2 flex justify-between items-center">
          <img src="./svg/plain-icon.svg" alt="logo" className="w-10 h-10" />
          <Menu
            className="w-8 h-8 cursor-pointer"
            onClick={() => setIsOpen(!isOpen)}
          />
        </div>
        {isOpen ? (
          <nav className="flex items-stretch flex-grow py-2">
            <ul className="flex gap-2 flex-col items-stretch justify-between flex-grow">
              <NavItemMobile
                icon="House"
                label="Dashboard"
                isActive={currentPage === "dashboard"}
                onClick={() => setCurrentPage("dashboard")}
              />
              <NavItemMobile
                icon="Download"
                label="Deposit"
                isActive={currentPage === "deposit"}
                onClick={() => setCurrentPage("deposit")}
              />
               <NavItemMobile
                iconName="ickb"
                icon="ChartBarBig"
                label="iCKB"
                isActive={currentPage === "ickb"}
                onClick={() => setCurrentPage("ickb")}
              />
              <NavItemMobile
                icon="ChartBarBig"
                label="Explore"
                onClick={() => window.open(`${index}/nervosdao`, "_blank")}
              />
              <NavItemMobile
                icon="Twitter"
                label="About us"
                onClick={() => window.open("https://x.com/CKBDevrel", "_blank")}
              />
              <NavItemMobile
                icon="Github"
                label="Source"
                onClick={() => window.open("https://x.com/CKBDevrel", "_blank")}
              />
            </ul>
          </nav>
        ) : undefined}
      </aside>
      <main className="flex-1 flex flex-col py-8 px-4 lg:px-8 overflow-auto">
        <Title>{getTitle()}</Title>
        {renderContent()}
      </main>
      <Tooltip id="top-tooltip"
        events={['click']}
        place={"bottom-start"}
        style={{
          color: "#fff",
          borderRadius: '8px',
          borderWidth: '1px',
          borderColor: '#FFFFFF33',
          pointerEvents: 'inherit',
          boxShadow: ' 0px 4px 6px -2px #88888814,0px 10px 15px -3px #8888881F',
        }}
      />
    </div>
  );
};

export default AppLayout;
