import { WalletConfig } from "@/cores/config";
import React, { useEffect, useRef } from "react";
import {  RecentOrder } from "@/cores/utils";
import { ccc } from "@ckb-ccc/connector-react";
import { getRecentIckbOrders } from "@/cores/queries";
import { IckbHistoryOrderItems } from "./IckbHistoryOrderItems";
import { useTranslation } from "react-i18next";


const IckbHistoryOrders: React.FC<{ walletConfig: WalletConfig}> = ({ walletConfig}) => {
    const signerCcc = ccc.useSigner();
    const { t } = useTranslation();
    const [limit, setLimit] = React.useState(5);
    const [txs, setTxs] = React.useState<RecentOrder[]>([]);
    const [txGenerator, setTxGenerator] = React.useState<
        AsyncGenerator | undefined
    >(undefined);
    const txsRef = useRef<RecentOrder[]>([]);
    txsRef.current = txs;

    useEffect(() => {
        if (!signerCcc||!walletConfig) { return }
        const { config } = walletConfig;
        let cancelled = false;

        setTxs([]);
        setLimit(5);
        setTxGenerator(getRecentIckbOrders(signerCcc, config));

        const refresh = async () => {
            if (cancelled) return;
            const currentTxs = txsRef.current;
            if (currentTxs.length === 0) return;

            try {
                for await (const data of getRecentIckbOrders(signerCcc, config)) {
                    if (cancelled || !data) break;
                    if (currentTxs.find((t) => t.timestamp === data.timestamp)) {
                        break;
                    }

                    setTxs((prev) => {
                        if (prev.find((t) => t.timestamp === data.timestamp)) {
                            return prev;
                        }
                        return [data, ...prev];
                    });
                }
            } catch (e) {
                console.error("refresh error:", e);
            }
        };

        // 用 setTimeout 链代替 setInterval，确保上一次完成后再安排下一次，避免请求堆积
        let timerId: ReturnType<typeof setTimeout>;
        const scheduleRefresh = async () => {
            await refresh();
            if (!cancelled) {
                timerId = setTimeout(scheduleRefresh, 15000);
            }
        };
        // 首次延迟 15s 后开始 refresh（初始加载由 txGenerator 处理）
        timerId = setTimeout(scheduleRefresh, 15000);

        return () => {
            cancelled = true;
            clearTimeout(timerId);
        };

    }, [signerCcc]);

    useEffect(() => {
        if (!txGenerator || !signerCcc || txsRef.current.length >= limit) {
            return;
        }

        let cancelled = false;
        (async () => {
            const { value, done } = await txGenerator.next();
            if (cancelled) return;
            if (done) {
                setTxGenerator(undefined);
                return;
            }
            if (!value) {
                return;
            }
            //@ts-expect-error 暂时屏蔽
            setTxs((txs) => [...txs, value]);
        })();

        return () => { cancelled = true; };
    }, [txGenerator, limit, txs, signerCcc]);
    
    return (
        <>   
            <div className="bg-gray-900 rounded-lg p-4 flex flex-col flex-grow mt-6 text-left">
                <h3 className="text-xl font-play font-bold mb-4">{t("ickbHistoryOrders.recentOrders")}</h3>
                {txs && txs.length > 0 ? <>
                    {txs.map((item, index) => {
                        return (
                            <IckbHistoryOrderItems
                                key={index}
                                item={item}
                            />
                        )
                    })}
                    {txGenerator ? (
                        <button
                            className="text-cyan-400 mt-4 hover:underline"
                            onClick={() => setLimit(limit + 5)}
                        >
                            {t("ickbHistoryOrders.viewAllHistory")}
                        </button>
                    ) : undefined}</>
                    : <div className={`flex flex-grow items-center justify-center bg-gray-800 rounded-lg p-4`}>
                        <p className="text-gray-400">{t("ickbHistoryOrders.noRecentTransactions")}</p>
                    </div>}
            </div>
        </>
    )
}
export default IckbHistoryOrders;
