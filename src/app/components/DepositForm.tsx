import React, { useEffect, useState } from "react";
import { ccc } from "@ckb-ccc/connector-react";
import { useNotification } from "@/context/NotificationProvider";

const DepositForm: React.FC = () => {
  const [amount, setAmount] = useState<string>("");
  const [transactionFee, setTransactionFee] = useState<string>("-");
  const [balance, setBalance] = useState<string>("-");

  const signer = ccc.useSigner();
  const { showNotification } = useNotification();

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
        "Minimal deposit amount is",
        ccc.fixedPointToString(tx.outputs[0].capacity)
      );
      return;
    }
    tx.outputs[0].capacity = ccc.fixedPointFrom(amount);

    await tx.completeInputsByCapacity(signer);
    await tx.completeFeeBy(signer, 1000);
    const txHash = await signer.sendTransaction(tx);
    showNotification("success", `Deposit Success: ${txHash}`);
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
        Deposit to Nervos DAO
      </h2>
      <p className="text-gray-400 mb-2">Available CKB</p>
      <p className="text-3xl font-bold font-play mb-4">{balance} CKB</p>

      <div className='relative flex items-center mb-4'>
        <input className="w-full text-left border border-[#777] bg-gray-700 rounded text-lg p-3 pr-16"
          type="text"
          onChange={(e) => setAmount(e.target.value)}
          value={amount}
          placeholder="Enter amount" />
       
        <span className="absolute right-0 p-3 flex items-center text-teal-500 cursor-pointer" onClick={handleMax}>
          MAX
        </span>
        
      </div>
      <p className="text-gray-400 text-sm mb-4 border-b pb-2 border-white/20">
        Max balance minus estimated transaction fee needed
      </p>

      <div className="flex justify-between">
        <span>Transaction Fee</span>
        <span>{transactionFee} CKB</span>
      </div>

      <button
        onClick={handleDeposit}
        className="mt-4 w-full font-bold bg-btn-gradient text-gray-800 text-body-2 py-3 rounded-lg hover:bg-btn-gradient-hover transition duration-200 disabled:opacity-50 disabled:hover:bg-btn-gradient"
        disabled={(() => {
          try {
            ccc.numFrom(amount);
          } catch (error) {
            return true;
          }
          return amount === "";
        })()}
      >
        Deposit
      </button>
    </div>
  );
};

export default DepositForm;
