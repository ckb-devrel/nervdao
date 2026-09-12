"use client";

import React, { useCallback, useEffect, useState } from "react";
import { ccc } from "@ckb-ccc/connector-react";
import { useTranslation } from "react-i18next";
import { useNotification } from "@/context/NotificationProvider";
import { sanitizeNumericInput } from "@/utils/stringUtils";
import { formatError } from "@/utils/errorUtils";
import { ButtonLoadingContent } from "./ButtonLoadingContent";

const Transfer: React.FC = () => {
  const signer = ccc.useSigner();
  const { client } = ccc.useCcc();
  const { t } = useTranslation();
  const { showNotification, removeNotification } = useNotification();
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState("-");
  const [transactionFee, setTransactionFee] = useState("-");
  const [addressError, setAddressError] = useState("");
  const [amountError, setAmountError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [showMaxBalanceHint, setShowMaxBalanceHint] = useState(false);

  const refreshBalance = useCallback(async () => {
    if (!signer) return;
    setBalance(ccc.fixedPointToString(await signer.getBalance()));
  }, [signer]);

  useEffect(() => {
    refreshBalance().catch(() => setBalance("-"));
  }, [refreshBalance]);

  const getRecipient = useCallback(async () => {
    if (!address.trim()) {
      throw new Error(t("transferForm.recipientRequired"));
    }
    return ccc.Address.fromString(address.trim(), client);
  }, [address, client, t]);

  const buildTransaction = useCallback(async () => {
    if (!signer) throw new Error(t("transferForm.walletUnavailable"));
    const recipient = await getRecipient();
    const capacity = ccc.fixedPointFrom(amount);
    const output = ccc.CellOutput.from({ capacity, lock: recipient.script });
    const minimalCapacity = ccc.fixedPointFrom(output.occupiedSize);

    if (capacity < minimalCapacity) {
      throw new Error(
        t("transferForm.minimumAmount", {
          amount: ccc.fixedPointToString(minimalCapacity),
        }),
      );
    }

    const tx = ccc.Transaction.from({ outputs: [output] });
    await tx.completeInputsByCapacity(signer);
    await tx.completeFeeBy(signer);
    return tx;
  }, [amount, getRecipient, signer, t]);

  // Debounce transaction building to validate the recipient/amount and estimate the fee before sending.
  useEffect(() => {
    if (!signer || !address.trim() || !amount || amount === "0") {
      setTransactionFee("-");
      return;
    }

    setTransactionFee("-");
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        await getRecipient();
        if (!cancelled) setAddressError("");
        const tx = await buildTransaction();
        const fee =
          (await tx.getInputsCapacity(signer.client)) - tx.getOutputsCapacity();
        if (!cancelled) {
          setTransactionFee(ccc.fixedPointToString(fee));
          setAmountError("");
        }
      } catch (error) {
        if (cancelled) return;

        setTransactionFee("-");
        try {
          await getRecipient();
          const message = formatError(error);
          setAmountError(
            /insufficient|not enough capacity/i.test(message)
              ? t("transferForm.insufficientBalanceWithFee")
              : message,
          );
        } catch {
          setAddressError(t("transferForm.invalidAddress"));
        }
      }
    }, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [address, amount, buildTransaction, getRecipient, signer, t]);

  const validateAddress = async () => {
    if (!address.trim()) {
      setAddressError(t("transferForm.recipientRequired"));
      return false;
    }
    try {
      await getRecipient();
      setAddressError("");
      return true;
    } catch {
      setAddressError(t("transferForm.invalidAddress"));
      return false;
    }
  };

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = sanitizeNumericInput(event.target.value);
    if (balance !== "-" && Number(value) >= Number(balance)) {
      setAmountError(t("transferForm.insufficientBalanceWithFee"));
    } else {
      setAmountError("");
    }
    setAmount(value);
    setShowMaxBalanceHint(false);
  };

  const handleMax = async () => {
    if (!signer) return;
    if (!(await validateAddress())) return;

    try {
      const recipient = await getRecipient();
      const tx = ccc.Transaction.from({
        outputs: [{ capacity: 0, lock: recipient.script }],
      });
      await tx.completeInputsAll(signer);
      await tx.completeFeeChangeToOutput(signer, 0);
      const maxAmount = ccc.fixedPointToString(tx.outputs[0].capacity);
      setAmount(maxAmount);
      setAmountError("");
      setShowMaxBalanceHint(true);
    } catch (error) {
      showNotification("error", formatError(error));
    }
  };

  const handleTransfer = async () => {
    if (!signer || isSubmitting) return;
    if (!(await validateAddress())) return;
    if (!amount || amount === "0") {
      setAmountError(t("transferForm.amountRequired"));
      return;
    }

    setIsSubmitting(true);
    let progressId: string | undefined;
    try {
      const tx = await buildTransaction();
      const txHash = await signer.sendTransaction(tx);
      progressId = showNotification(
        "progress",
        t("notifications.pendingTransaction"),
      );
      setIsPending(true);
      await signer.client.waitTransaction(txHash);
      showNotification(
        "success",
        t("transferForm.transferSuccess", { hash: txHash }),
      );
      setAmount("");
      setTransactionFee("-");
      setShowMaxBalanceHint(false);
      await refreshBalance();
    } catch (error) {
      showNotification("error", formatError(error));
    } finally {
      if (progressId) removeNotification(progressId);
      setIsSubmitting(false);
      setIsPending(false);
    }
  };

  return (
    <div className="flex flex-grow justify-center">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl self-start">
        <h2 className="text-2xl font-play font-bold mb-4">
          {t("transferForm.sendCkb")}
        </h2>
        <p className="text-gray-400 mb-2">{t("transferForm.availableCkb")}</p>
        <p className="text-3xl font-bold font-play mb-6">{balance} CKB</p>

        <label className="block text-gray-400 mb-2" htmlFor="recipient-address">
          {t("transferForm.recipientAddress")}
        </label>
        <input
          id="recipient-address"
          className="w-full border-white/10 focus:border-cyan-500 bg-white/5 hover:bg-white/10 focus:bg-white/5 rounded text-base p-3"
          type="text"
          value={address}
          onChange={(event) => {
            setAddress(event.target.value);
            setAddressError("");
            setShowMaxBalanceHint(false);
          }}
          onBlur={validateAddress}
          placeholder={t("transferForm.enterRecipientAddress")}
          autoComplete="off"
          spellCheck={false}
        />
        {addressError && (
          <p className="text-red-300 text-sm mt-2">{addressError}</p>
        )}

        <label
          className="block text-gray-400 mt-5 mb-2"
          htmlFor="transfer-amount"
        >
          {t("transferForm.amount")}
        </label>
        <div className="relative flex items-center">
          <input
            id="transfer-amount"
            className="w-full text-left border-white/10 focus:border-cyan-500 bg-white/5 hover:bg-white/10 focus:bg-white/5 rounded text-base p-3 pr-20"
            type="text"
            inputMode="decimal"
            onChange={handleAmountChange}
            value={amount}
            placeholder={t("transferForm.enterAmount")}
          />
          <span
            className="absolute right-0 p-3 flex items-center text-teal-500 cursor-pointer"
            onClick={handleMax}
          >
            {t("common.max")}
          </span>
        </div>
        {amountError && (
          <p className="text-red-300 text-sm mt-2">{amountError}</p>
        )}
        {showMaxBalanceHint && (
          <p className="text-gray-400 text-sm mt-2">
            {t("transferForm.maxBalanceHint")}
          </p>
        )}

        <div className="flex justify-between border-t border-white/20 pt-4 mt-5">
          <span>{t("transferForm.transactionFee")}</span>
          <span>{transactionFee} CKB</span>
        </div>

        <button
          onClick={handleTransfer}
          className="mt-4 flex h-12 w-full items-center justify-center rounded-lg bg-btn-gradient font-bold text-body-2 text-gray-800 transition duration-200 hover:bg-btn-gradient-hover disabled:opacity-50 disabled:hover:bg-btn-gradient"
          disabled={
            !address.trim() ||
            !amount ||
            amount === "0" ||
            !!addressError ||
            !!amountError ||
            transactionFee === "-" ||
            isSubmitting
          }
        >
          {isSubmitting ? (
            <ButtonLoadingContent>
              {isPending
                ? t("transferForm.pending")
                : t("transferForm.toBeConfirmed")}
            </ButtonLoadingContent>
          ) : (
            t("transferForm.send")
          )}
        </button>
      </div>
    </div>
  );
};

export default Transfer;
