import {
    WalletDisconnectButton,
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletNotConnectedError, WalletSignTransactionError } from '@solana/wallet-adapter-base';
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import Popup from 'reactjs-popup';
import './Nav.css';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

require('@solana/wallet-adapter-react-ui/styles.css');

const GameCreator = (props) => 
{
    const [response, setResponse] = useState({ status: "", game: "" });
    const [loading, setLoading] = useState(false);
    const fetchData = (wager, password, parent) => {
        setLoading(true);
        fetch("http://localhost/new", {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: `
                "params": { wager: ${wager}, password: ${password}, parent: ${parent} } 
            `,
        })
        .then(response => {
            return response.json();
        })
        .then(data => {
            setResponse(data);
            setLoading(false);
        });
    }

    function handleSubmit(event) {
        event.preventDefault();
        const form = event.currentTarget;
        const formElements = form.elements as typeof form.elements & {
            wager: HTMLInputElement,
            password: HTMLInputElement,
        }
        fetchData(formElements.wager.value, formElements.password.value, props.parent);
    }

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <label>Bet:</label>
                <input type="text" pattern="[0-9]+[.][0-9]{0,3}[1-9]{1}" id="wager" name="wager" /><label>SOL</label><br />
                <label>Password:</label>
                <input type="text" id="password" name="password" /><br />
                <input type="submit" value="Create Game" />
            </form>
        </div>
    );
}

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
            if (!active) { return; }
            setBalance(res)
        }
    }, [connection, publicKey]);
    
    

    return (
        <div className="nav">
            <li className="nav-left">
                {publicKey != undefined ?
                    <Popup trigger={<div className="newGame"> + New </div>}>
                        <GameCreator parent={publicKey.toString()} />
                    </Popup>
                    :
                    <div className="newGame">Wallet Not Connected!</div>
                }
            </li>
            <li className="nav-middle"><a><div className="balance-view">{balance} SOL</div></a></li>
            <li className="nav-right"><a><WalletMultiButton /></a></li>
            <li className="nav-right"><a><WalletDisconnectButton /></a></li>
        </div>
    )
}

export { Nav };