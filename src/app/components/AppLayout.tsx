/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import { Dashboard } from "./Dashboard";
import Title from "./Ttitle";
import Deposit from "./Deposit";
import { icons, Info, Menu, Globe, Check } from "lucide-react";
import { useGetExplorerLink } from "@/hooks/Explorer";
import Ickb from "./Ickb";
import { Tooltip } from "react-tooltip";
import ReactDOMServer from "react-dom/server";
import IckbInfo from "./IckbInfo";
import { IckbModal } from "./IckbModal";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES, SupportedLanguage } from "@/i18n/config";
import LanguageSwitcher from "./LanguageSwitcher";

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
  const [infoOpen, setInfoOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const currentLang = (Object.keys(SUPPORTED_LANGUAGES).includes(i18n.language) ? i18n.language : "en") as SupportedLanguage;

  const getTitle = () => {
    switch (currentPage) {
      case "dashboard":
        return t("common.dashboard");
      case "deposit":
        return t("common.deposit");
      case "ickb":
        return <>
          iCKB
          <a
            data-tooltip-id="top-tooltip"
            className="hidden sm:inline-block "
            data-tooltip-html={ReactDOMServer.renderToStaticMarkup(IckbInfo({ whatIsIckb: t("ickbInfo.whatIsIckb"), desc: t("ickbInfo.desc"), fasterWithdrawals: t("ickbInfo.fasterWithdrawals"), fasterWithdrawalsDesc: t("ickbInfo.fasterWithdrawalsDesc"), greaterLiquidity: t("ickbInfo.greaterLiquidity"), greaterLiquidityDesc: t("ickbInfo.greaterLiquidityDesc"), learnMore: t("ickbInfo.learnMore") }))}
          >
            <Info className="w-5 h-5 cursor-pointer ml-1 inline-block" />
          </a>
          <a

            className="inline-block sm:hidden "
            onClick={()=>{setInfoOpen(true)}}
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
                label={t("common.dashboard")}
                isActive={currentPage === "dashboard"}
                onClick={() => setCurrentPage("dashboard")}
              />
              <NavItem
                icon="Download"
                label={t("common.deposit")}
                isActive={currentPage === "deposit"}
                onClick={() => setCurrentPage("deposit")}
              />
              <NavItem
                iconName="ickb"
                icon="ChartBarBig"
                label={t("common.ickb")}
                isActive={currentPage === "ickb"}
                onClick={() => setCurrentPage("ickb")}
              />
              <NavItem
                icon="ChartBarBig"
                label={t("common.explore")}
                onClick={() => window.open(`${index}/nervosdao`, "_blank")}
              />
            </div>
            <div className="flex flex-col items-stretch gap-2">
              <NavItem
                icon="Twitter"
                label={t("common.aboutUs")}
                onClick={() => window.open("https://x.com/CKBDevrel", "_blank")}
              />
              <NavItem
                icon="Github"
                label={t("common.source")}
                onClick={() => window.open("https://github.com/ckb-devrel/nervdao", "_blank")}
              />
            </div>
          </ul>
        </nav>
      </aside>
      <aside className="bg-gray-950 border-b border-white-200 flex flex-col items-stretch sm:hidden">
        <div className="mx-4 py-2 flex justify-between items-center">
          <img src="./svg/plain-icon.svg" alt="logo" className="w-10 h-10" />
          <div className="flex items-center gap-2">
            <Menu
              className="w-8 h-8 cursor-pointer"
              onClick={() => setIsOpen(!isOpen)}
            />
          </div>
        </div>
        {isOpen ? (
          <nav className="flex flex-col items-stretch flex-grow py-2">
            <ul className="flex gap-2 flex-col items-stretch justify-between flex-grow">
              <NavItemMobile
                icon="House"
                label={t("common.dashboard")}
                isActive={currentPage === "dashboard"}
                onClick={() => setCurrentPage("dashboard")}
              />
              <NavItemMobile
                icon="Download"
                label={t("common.deposit")}
                isActive={currentPage === "deposit"}
                onClick={() => setCurrentPage("deposit")}
              />
               <NavItemMobile
                iconName="ickb"
                icon="ChartBarBig"
                label={t("common.ickb")}
                isActive={currentPage === "ickb"}
                onClick={() => setCurrentPage("ickb")}
              />
              <NavItemMobile
                icon="ChartBarBig"
                label={t("common.explore")}
                onClick={() => window.open(`${index}/nervosdao`, "_blank")}
              />
              <NavItemMobile
                icon="Twitter"
                label={t("common.aboutUs")}
                onClick={() => window.open("https://x.com/CKBDevrel", "_blank")}
              />
              <NavItemMobile
                icon="Github"
                label={t("common.source")}
                onClick={() => window.open("https://x.com/CKBDevrel", "_blank")}
              />
            </ul>
            <div className="border-t border-white/10 mt-2 pt-4 px-6 pb-4">
              <div className="flex items-center gap-1.5 text-white/50 text-sm mb-3 justify-center">
                <Globe className="w-4 h-4" />
                <span>{t("common.language")}</span>
              </div>
              <div className="flex gap-3">
                {(Object.keys(SUPPORTED_LANGUAGES) as SupportedLanguage[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => i18n.changeLanguage(lang)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-full text-sm transition-colors border ${
                      lang === currentLang
                        ? "border-cyan-400 text-white bg-[#00FAED1F]"
                        : "border-white/20 text-white/60 bg-white/5"
                    }`}
                  >
                    {lang === currentLang && <Check className="w-3.5 h-3.5" />}
                    {SUPPORTED_LANGUAGES[lang]}
                  </button>
                ))}
              </div>
            </div>
          </nav>
        ) : undefined}
      </aside>
      <main className="flex-1 flex flex-col py-8 px-4 lg:px-8 overflow-auto">
        <Title languageSwitcher={<LanguageSwitcher />}>{getTitle()}</Title>
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
      {infoOpen&& <IckbModal isOpen={infoOpen} onClose={()=>setInfoOpen(false)} infos={IckbInfo({ whatIsIckb: t("ickbInfo.whatIsIckb"), desc: t("ickbInfo.desc"), fasterWithdrawals: t("ickbInfo.fasterWithdrawals"), fasterWithdrawalsDesc: t("ickbInfo.fasterWithdrawalsDesc"), greaterLiquidity: t("ickbInfo.greaterLiquidity"), greaterLiquidityDesc: t("ickbInfo.greaterLiquidityDesc"), learnMore: t("ickbInfo.learnMore") })} />
    }
    </div>
  );
};

export default AppLayout;
