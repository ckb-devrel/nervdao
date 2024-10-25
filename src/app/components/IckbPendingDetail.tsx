'use client'
import React from "react";

import UseSorter, { SortDirection, ArrowProps, Column, SorterObj } from "@/hooks/UseSorter";
import ClipLoader from "react-spinners/ClipLoader";
import { ChevronDown, ChevronUp } from "lucide-react";
type PendingLisrProps = {
    columns: SorterObj[]
}
const columns: Column[] = [
    {
        name: "Amount",
        key: 'amount'
    },
    {
        name: "Date Requested",
        key: "daterequested"
    },
    {
        name: "Remaining Time",
        key: "remainingtime"
    }
];


const IckbPendingDetail: React.FC<PendingLisrProps> = (props: PendingLisrProps) => {
    const [sortedTable, setSortedTable, dir, setDir, key, setKey] = UseSorter<
        SorterObj
    >(props.columns);
    const calculateDaysDifference = (timestamp1: number, timestamp2: number) => {

        try {
            const date1 = new Date(timestamp1);
            const date2 = new Date(timestamp2);
            const diffInMilliseconds = Math.abs(date2.getTime() - date1.getTime());
            const diffInHoutrs = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
            return diffInHoutrs;
        } catch (error) {
            return "Error calculating days difference: " + error;
        }
    };
    const handleOnClick = (
        currentHead: Column
    ) => {
        const currentSortDir =
            dir?.valueOf() === SortDirection.Ascending.valueOf()
                ? SortDirection.Descending
                : SortDirection.Ascending;

        if (dir === undefined) {
            setDir(SortDirection.Ascending);
        } else {
            setDir(currentSortDir);
        }
        if (currentHead) {
            setKey(currentHead.key as keyof SorterObj);
        }
    };

    const Arrow = (props: ArrowProps) => {
        if (props.sortDir !== undefined && props.active) {
            return SortDirection.Ascending.valueOf() === props.sortDir.valueOf() ? (
                <div className="flex flex-col">
                    <ChevronUp color="rgba(255,255,255,0.4)" size={12} />
                    <ChevronDown color="rgba(255,255,255,1)" size={12} />
                </div>
            ) : (
                <div className="flex flex-col">
                    <ChevronUp color="rgba(255,255,255,1)" size={12} />
                    <ChevronDown color="rgba(255,255,255,0.4)" size={12} />
                </div>
                // <AArrowUp />
            );
        }
        return (<div className="flex flex-col">
            <ChevronUp color="rgba(255,255,255,0.4)" size={12} />
            <ChevronDown color="rgba(255,255,255,0.4)" size={12} />
        </div>);
    };
    return (
        <table className="w-full mt-4 table-auto">
            <thead className="border border-t-0 border-l-0	border-r-0 border-gray-500">
                <tr>
                    {columns.map((c, index) => {
                        return (
                            <th key={index} className="text-body-2  text-left p-2 cursor-pointer" onClick={() => handleOnClick(c)}>

                                <div className="w-full flex items-center justify-between ">
                                    <span className="text-[rgba(255,255,255,0.7)]">{c.name}</span>
                                    <Arrow sortDir={dir} active={c.key === key} />
                                </div>
                            </th>
                        );
                    })}
                </tr>
            </thead>
            {/* Apply the table body props */}
            <tbody>
                {sortedTable.map((c, index) => {
                    return (
                        <tr key={index}>
                            <td className="text-body-2  text-left p-2 ">{c.amount}</td>
                            <td className="text-body-2  text-left p-2 ">{new Date(c.daterequested).toLocaleDateString()}</td>
                            <td className="text-body-2  text-left p-2 "><ClipLoader className="mr-2" size={16} color="#00FAED" />{calculateDaysDifference(c.daterequested, c.remainingtime)} hours left</td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
};

export default IckbPendingDetail;
