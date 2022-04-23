import {
    WalletDisconnectButton,
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletNotConnectedError, WalletSignTransactionError } from '@solana/wallet-adapter-base';
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import './Nav.css';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

require('@solana/wallet-adapter-react-ui/styles.css');

function Nav(props: any)
{
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    let grabBalance = async function() {
        let balance = 0.0;
        try {
            balance = (await connection.getBalance(publicKey)).valueOf() / LAMPORTS_PER_SOL;
        } catch (e) {
            console.log("[DBG] - Failed to grab balance inside of NAV!");
        }
        return balance.toFixed(8);
    }
    const [balance, setBalance] = useState("");
    useEffect(() => {
        let active = true
        load()
        return () => { active = false }

        async function load() {
            setBalance("")
            const res = await grabBalance();
            if (!active) { return }
            setBalance(res)
        }
    }, [connection, publicKey]);
    
    

    return (
        <div className="nav">
            <li className="nav-left"></li>
            <li className="nav-middle"><a><div className="balance-view">{balance} SOL</div></a></li>
            <li className="nav-right"><a><WalletMultiButton /></a></li>
            <li className="nav-right"><a><WalletDisconnectButton /></a></li>
        </div>
    )
}

export { Nav };