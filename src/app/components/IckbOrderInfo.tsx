'use client'
import {  Lightbulb } from "lucide-react";
import React from "react";

import styled from 'styled-components';
const Info = styled.div`
    width:480px;
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
    li.first::marker{
        background:#FFCC00!important;

    }
    li.first strong{
        color:#FFCC00!important
    }
    li.second::marker {
        color: #3CFF97;
    }
     li.second strong{
        color: #3CFF97;
    }
    a{
        display:flex;
        color:  #00FAED;
        padding:10px 0;
        margin-top:10px;
        font-size:16px;
        align-items:center
    }
    .tips{
        border:1px solid #3CFF97;
        background: #3CFF971F;
        padding:12px 16px;
        border-radius:8px;
        color:#fff;
        margin:10px 0;
        h5{
            display:flex;
            align-items:center;
            font-size:14px;
            line-height:20px;
            font-weight:700
        }
    }
    @media (max-width: 640px) {
        width:100%;
        padding:0
    }
        
`;

interface IckbOrderInfoProps {
    whatAreActiveOrders: string;
    desc: string;
    pendingOrders: string;
    pendingOrdersDesc: string;
    completedOrders: string;
    completedOrdersDesc: string;
    tip: string;
    tipDesc: string;
}

export function IckbOrderInfo(props: IckbOrderInfoProps) {
    return (


        <Info >
            <h4>{props.whatAreActiveOrders}</h4>
            <p>{props.desc}</p>
            <ul>
                <li className="first"><strong>{props.pendingOrders}</strong>{props.pendingOrdersDesc}</li>
                <li className="second"><strong>{props.completedOrders}</strong>{props.completedOrdersDesc}</li>
            </ul>
            <div className="tips">
                <h5><Lightbulb size={18} /> {props.tip}</h5>
                <p>{props.tipDesc}</p>
            </div>

        </Info>


    )
}

export default IckbOrderInfo;
