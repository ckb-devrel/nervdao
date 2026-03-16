import React, { useEffect, useState  } from "react";
import { ccc } from "@ckb-ccc/connector-react";
import { useNotification } from "@/context/NotificationProvider";
import { TailSpin } from "react-loader-spinner";
import { useTranslation } from "react-i18next";

const DepositForm: React.FC = () => {
  const [amount, setAmount] = useState<string>("");
  const [transactionFee, setTransactionFee] = useState<string>("-");
  const [balance, setBalance] = useState<string>("-");
  const [transTbc, setTransTbc] = useState<boolean>(false);
  const [depositPending, setDepositPending] = useState<boolean>(false);
  const signer = ccc.useSigner();
  const { showNotification, removeNotification } = useNotification();
  const { t } = useTranslation();

  useEffect(() => {
    if (!signer) return;

    (async () => {
      try {
        const { script: lock } = await signer.getRecommendedAddressObj();
        const tx = ccc.Transaction.from({
          outputs: [
            {
              capacity: ccc.fixedPointFrom(amount),
              lock,
              type: await ccc.Script.fromKnownScript(
                signer.client,
                ccc.KnownScript.NervosDao,
                "0x"
              ),
            },
          ],
          outputsData: ["00".repeat(8)],
        });
        await tx.addCellDepsOfKnownScripts(
          signer.client,
          ccc.KnownScript.NervosDao
        );

        await tx.completeInputsByCapacity(signer);
        await tx.completeFeeBy(signer, 1000);
        setTransactionFee(
          ccc.fixedPointToString(
            (await tx.getInputsCapacity(signer.client)) -
            tx.getOutputsCapacity()
          )
        );
      } catch (error) {
        setTransactionFee("-");
      }
    })();
  }, [signer, amount]);

  const handleDeposit = async () => {
    if (!signer) {

      return;
    }

    const { script: lock } = await signer.getRecommendedAddressObj();
    const tx = ccc.Transaction.from({
      outputs: [
        {
          lock,
          type: await ccc.Script.fromKnownScript(
            signer.client,
            ccc.KnownScript.NervosDao,
            "0x"
          ),
        },
      ],
      outputsData: ["00".repeat(8)],
    });
    await tx.addCellDepsOfKnownScripts(
      signer.client,
      ccc.KnownScript.NervosDao
    );
    if (tx.outputs[0].capacity > ccc.fixedPointFrom(amount)) {
      showNotification(
        "error",
        t("notifications.minimalDepositAmount", { amount: ccc.fixedPointToString(tx.outputs[0].capacity) })
      );
      return;
    }
    tx.outputs[0].capacity = ccc.fixedPointFrom(amount);
    await tx.completeInputsByCapacity(signer);
    await tx.completeFeeBy(signer, 1000);
    setTransTbc(true)
    try {
      const txHash = await signer.sendTransaction(tx);
      const progressId = await showNotification("progress", t("notifications.pendingTransaction"));
      setDepositPending(true)
      await signer.client.waitTransaction(txHash)
      setTransTbc(false)
      removeNotification(progressId + '')
      setDepositPending(false)
      showNotification("success", t("notifications.committed"));
    } catch (error) {
      setTransTbc(false)
    } finally {
      setTransTbc(false)
    }
  };

  useEffect(() => {
    (async () => {
      if (!signer) return;
      const balance = await signer.getBalance();
      setBalance(ccc.fixedPointToString(balance));
    })();
  }, [signer]);

  const handleMax = async () => {
    if (!signer) return;
    const { script: lock } = await signer.getRecommendedAddressObj();
    const tx = ccc.Transaction.from({
      outputs: [
        {
          lock,
          type: await ccc.Script.fromKnownScript(
            signer.client,
            ccc.KnownScript.NervosDao,
            "0x"
          ),
        },
      ],
      outputsData: ["00".repeat(8)],
    });
    await tx.addCellDepsOfKnownScripts(
      signer.client,
      ccc.KnownScript.NervosDao
    );
    await tx.completeInputsAll(signer);
    await tx.completeFeeChangeToOutput(signer, 0, 1000);
    const amount = ccc.fixedPointToString(tx.outputs[0].capacity);
    setAmount(amount);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">

      <h2 className="text-2xl font-play font-bold mb-4">
        {t("depositForm.depositToNervosDAO")}
      </h2>
      <p className="text-gray-400 mb-2">{t("depositForm.availableCkb")}</p>
      <p className="text-3xl font-bold font-play mb-4">{balance} CKB</p>

      <div className='relative flex items-center mb-4'>
        <input className="w-full text-left border-white/10 focus:border-cyan-500 bg-white/5 hover:bg-white/10 focus:bg-white/5 rounded text-base p-3 pr-16"
          type="text"
          onChange={(e) => setAmount(e.target.value)}
          value={amount}
          placeholder={t("depositForm.enterAmount")} />

        <span className="absolute right-0 p-3 flex items-center text-teal-500 cursor-pointer" onClick={handleMax}>
          {t("common.max")}
        </span>

      </div>
      <p className="text-gray-400 text-sm mb-4 border-b pb-2 border-white/20">
        {t("depositForm.maxBalanceHint")}
      </p>

      <div className="flex justify-between">
        <span>{t("depositForm.transactionFee")}</span>
        <span>{transactionFee} CKB</span>
      </div>

      <button
        onClick={handleDeposit}
        className="mt-4 w-full font-bold bg-btn-gradient text-gray-800 text-body-2 py-3 rounded-lg hover:bg-btn-gradient-hover transition duration-200 disabled:opacity-50 disabled:hover:bg-btn-gradient"
        disabled={(() => {
          // try {
          //   ccc.numFrom(amount);
          // } catch (error) {
          //   return true;
          // }
          return amount === "" || !!transTbc;
        })()}
      >
        {transTbc ? <>
          <TailSpin
            height="20"
            width="20"
            color="#333333"
            ariaLabel="tail-spin-loading"
            radius="1"
            wrapperStyle={{ 'display': 'inline-block', 'marginRight': '10px' }}
            wrapperClass="inline-block"
          /> {depositPending ? t("depositForm.pending") : t("depositForm.toBeConfirmed")}
        </> : t("depositForm.deposit")}
      </button>

    </div>
  );
};

export default DepositForm;
