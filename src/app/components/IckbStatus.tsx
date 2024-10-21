import { Info } from "lucide-react";
import React from "react";
import ReactApexChart from "react-apexcharts";
import { Tooltip } from "react-tooltip";

const IckbStatus: React.FC = () => {
  const ChartData = {
    series: [{
      name: 'series1',
      data: [31, 40, 28, 51, 42, 109, 100]
    }],
    options: {
      chart: {
        height: 240,
        type: 'area'
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'smooth'
      },
      xaxis: {
        type: 'datetime',
        categories: ["2018-09-19T00:00:00.000Z", "2018-09-19T01:30:00.000Z", "2018-09-19T02:30:00.000Z", "2018-09-19T03:30:00.000Z", "2018-09-19T04:30:00.000Z", "2018-09-19T05:30:00.000Z", "2018-09-19T06:30:00.000Z"]
      },
      tooltip: {
        x: {
          format: 'dd/MM/yy HH:mm'
        },
      },
      toolbar: {
        show: false
      }
    }

  }
  return (
    <div className="bg-gray-900 rounded-lg p-6 mb-4">
      <h3 className="text-xl font-play font-bold mb-4">Liquidity</h3>
      {/* <ReactApexChart options={ChartData} series={ChartData.series} type="area" height={350} /> */}
      <div className="flex item-center justify-between ">
        <div className="bg-gray-800 relative rounded-lg p-3 pr-5 mb-2  w-[30%]" >
          <div className="flex justify-between items-center font-work-sans text-gray-400">
            <span>Total Liquidity</span>
          </div>
          <div className="flex justify-between items-center mt-1 font-play text-white text-lg font-bold">
            <span>150,000  CKB</span>
          </div>
        </div>
        <div className="bg-gray-800 relative rounded-lg p-3 pr-5 mb-2 w-[30%]">
          <div className="flex justify-between items-center font-work-sans text-gray-400">
            <span>Pool Balance <Info size={16} className="inline-block"  data-tooltip-id="status-tooltip" data-tooltip-content="Pool Balance" /></span>
          </div>
          <div className="flex justify-between items-center mt-1 font-play text-white text-lg font-bold">
            <span>150,000  CKB</span>
          </div>
        </div>
        <div className="bg-gray-800 relative rounded-lg p-3 pr-5 mb-2 w-[30%]">
          <div className="flex justify-between items-center font-work-sans text-gray-400">
            <span>APR</span>
          </div>
          <div className="flex justify-between items-center mt-1 font-play text-white text-lg font-bold">
            <span>150,000  CKB</span>
          </div>
        </div>
      </div>
      <Tooltip id="status-tooltip" />
    </div>
  );
};

export default IckbStatus;
