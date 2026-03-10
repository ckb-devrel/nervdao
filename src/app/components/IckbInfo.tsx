'use client'
import { ExternalLink } from "lucide-react";
import React from "react";

import styled from 'styled-components';
const Info = styled.div`
    width:560px;
    padding:0 16px
    h4{
        font-size:18px;
        font-weight:700;
        color:#fff;
        margin:10px 0;
        line-height:22px;
    }
    p{
        font-weight:400;
        line-height:20px;
        font-size:14px;
        color:#FFFFFFCC;
        margin:10px auto;
    }
    ul{
        list-style:disc;
        background:#FFFFFF0D;
        padding:4px 8px 4px 24px;
        border-radius:4px;
        line-height:20px;
        font-size:14px
    }
    li{
        padding:5px 0
    }
    li::marker {
        color:  #00FAED;
    }
    strong{
        color:  #00FAED;
    }
    a{
        display:flex;
        color:  #00FAED;
        padding:10px 0;
        margin-top:10px;
        font-size:16px;
        align-items:center
    }
    svg{
        margin-left:8px
    }
    @media (max-width: 640px) {
        width:100%;
        padding:0
    }
`;

interface IckbInfoProps {
    whatIsIckb: string;
    desc: string;
    fasterWithdrawals: string;
    fasterWithdrawalsDesc: string;
    greaterLiquidity: string;
    greaterLiquidityDesc: string;
    learnMore: string;
}

export function IckbInfo(props: IckbInfoProps) {
    return (


        <Info >
            <h4>{props.whatIsIckb}</h4>
            <p>{props.desc}</p>
            <ul>
                <li><strong>{props.fasterWithdrawals}</strong>{props.fasterWithdrawalsDesc}</li>
                <li><strong>{props.greaterLiquidity}</strong>{props.greaterLiquidityDesc}</li>
            </ul>
            <a href="https://ickb.org/" target="_blank">{props.learnMore} <ExternalLink size={16} /></a>
            
        </Info>


    )
}

export default IckbInfo;
