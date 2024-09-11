/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from 'react';
import DashboardProfile from './DashboardProfile';
import DashboardRecentTransactions from './DashboardRecentTransactions';
import { ccc } from '@ckb-ccc/connector-react';
import DaoCard from './DaoCard';

const Dashboard: React.FC = () => {
  const signer = ccc.useSigner();
  const [daos, setDaos] = useState<ccc.Cell[]>([]);

  useEffect(() => {
    if (!signer) {
      return;
    }

    (async () => {
      const daos = [];
      for await (const cell of signer.findCells(
        {
          script: await ccc.Script.fromKnownScript(
            signer.client,
            ccc.KnownScript.NervosDao,
            "0x",
          ),
          scriptLenRange: [33, 34],
          outputDataLenRange: [8, 9],
        },
        true,
      )) {
        daos.push(cell);
        setDaos(daos);
      }
    })();
  }, [signer]);

  return (
    <div className="flex flex-grow gap-6">
      <div className="flex flex-col gap-6 w-1/3">
        <DashboardProfile />
        <DashboardRecentTransactions />
      </div>
      
      <div className="bg-gray-900 rounded-lg p-6 w-2/3 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Current Holdings in Nervos DAO</h2>
          {/* <div>
            <button className="text-cyan-400 font-work-sans py-2 px-4 rounded mr-4 hover:bg-teal-400">
              Make deposit
            </button>
          </div> */}
        </div>
        
        {/* <div className="mb-6">
          <button className="bg-btn-gradient text-gray-900 py-1 px-4 rounded-full mr-2">All</button>
          <button className="text-gray-300 py-1 px-4 rounded-full mr-2">Deposited</button>
          <button className="text-gray-300 py-1 px-4 rounded-full">Withdrawing</button>
        </div> */}

        <div className='grid grid-cols-2 gap-2'>
          {daos && daos.length > 0 ? (
            daos.map((dao) => (
              <DaoCard key={dao.outPoint.txHash} dao={dao} />
            ))
          ) : (
            <div className="col-span-2 flex flex-col items-center justify-center h-full">
              <div className="bg-gray-800 rounded-full mb-4">
                <img src={'./svg/no-holdings.svg'} alt="Nervos DAO" width={160} height={160}/>
              </div>
              <h3 className="text-xl font-bold mb-2">No Holdings Yet</h3>
              <p className="text-gray-400 mb-4">Make a deposit to start accumulating compensation through the Nervos DAO.</p>
              <button className="bg-teal-500 text-gray-900 font-semibold py-2 px-4 rounded hover:bg-teal-400">
                Make a Deposit
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
