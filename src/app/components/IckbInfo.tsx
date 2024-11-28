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

export function IckbInfo() {

    return (


        <Info >
            <h4>What is iCKB?</h4>
            <p  >iCKB is a liquid representation of your deposits in the iCKB protocol. When you deposit through the iCKB protocol, it mints iCKB tokens to represent your deposits, which are pooled and managed by the protocol.</p>
            <ul>
                <li><strong>Faster Withdrawals: </strong>Access funds quickly by withdrawing from deposits closest to maturity, bypassing the ~30-day NervosDAO cycle.</li>
                <li><strong>Greater Liquidity: </strong>Use or trade iCKB tokens anytime, unlike traditional locked NervosDAO deposits.</li>
            </ul>
            <a href="https://ickb.org/" target="_blank">Learn more <ExternalLink size={16} /></a>
            
        </Info>


    )
}

export default IckbInfo;
