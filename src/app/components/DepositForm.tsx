import React, { useEffect, useState } from 'react';
import { ccc } from '@ckb-ccc/connector-react';
import { useNotification } from '@/context/NotificationProvider';

const DepositForm: React.FC = () => {
  const [amount, setAmount] = useState<string>('');
  // const [transactionFee, setTransactionFee] = useState<string>('0.0003');
  // const [estimatedCompensation, setEstimatedCompensation] = useState<string>('0.056');
  const [balance, setBalance] = useState<string>('0');

  const signer = ccc.useSigner();
  const { showNotification } = useNotification();

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
            "0x",
          ),
        },
      ],
      outputsData: ["00".repeat(8)],
    });
    await tx.addCellDepsOfKnownScripts(
      signer.client,
      ccc.KnownScript.NervosDao,
    );
    if (tx.outputs[0].capacity > ccc.fixedPointFrom(amount)) {
      //TODO: show error
      return;
    }
    tx.outputs[0].capacity = ccc.fixedPointFrom(amount);

    await tx.completeInputsByCapacity(signer);
    await tx.completeFeeBy(signer, 1000);
    const txHash = await signer.sendTransaction(tx);
    showNotification('success', `Deposit Success: ${txHash}`);
  }

  useEffect(() => {
    (async () => {
      if(!signer) return;
      const balance = await signer.getBalance();
      setBalance(ccc.fixedPointToString(balance));
    })();
  }, [signer])

  const handleMax = async () => {
    if(!signer) return;
    const { script: lock } = await signer.getRecommendedAddressObj();
    const tx = ccc.Transaction.from({
      outputs: [
        {
          lock,
          type: await ccc.Script.fromKnownScript(
            signer.client,
            ccc.KnownScript.NervosDao,
            "0x",
          ),
        },
      ],
      outputsData: ["00".repeat(8)],
    });
    await tx.addCellDepsOfKnownScripts(
      signer.client,
      ccc.KnownScript.NervosDao,
    );
    await tx.completeInputsAll(signer);
    await tx.completeFeeChangeToOutput(signer, 0, 1000);
    const amount = ccc.fixedPointToString(tx.outputs[0].capacity);
    setAmount(amount);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-2xl font-play font-bold mb-4">Deposit to Nervos DAO</h2>
      <p className="text-gray-400 mb-2">Available CKB</p>
      <p className="text-3xl font-bold font-play mb-4">{ balance } CKB</p>
      
      <div className="bg-gray-700 rounded p-3 mb-4 flex justify-between items-center">
        <input 
          type="text" 
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="bg-transparent text-white text-lg w-full"
          placeholder="Enter amount"
        />
        <span className="text-teal-500 cursor-pointer" onClick={handleMax}>MAX</span>
      </div>
      <p className="text-gray-400 text-sm mb-4">Max balance minus estimated transaction fee needed</p>
      
      {/* <div className="flex justify-between mb-2">
        <span>Transaction Fee</span>
        <span>{transactionFee} CKB</span>
      </div>
      <div className="flex justify-between mb-4">
        <span>Estimated Compensation</span>
        <span>{estimatedCompensation} CKB</span>
      </div> */}
      
      <button 
        onClick={handleDeposit}
        className="w-full bg-teal-500 text-gray-900 py-3 rounded-lg"
      >
        Deposit
      </button>
    </div>
  );
};

export default DepositForm;
