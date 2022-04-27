import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletNotConnectedError, WalletSignTransactionError } from '@solana/wallet-adapter-base';
import Popup from 'reactjs-popup';
import React, { useState, useCallback, useEffect, useMemo, Component } from 'react';
//@ts-ignore
import { GameCreator } from './GameCreator.tsx';
import './Selector.css';

const Loading = (props) => {
    return (
        <div className="Loading">
            <h1>Loading games! Please wait...</h1>
            <img src="loading.gif" />
        </div>
    );
}

const Empty = (props) => {
    const { publicKey, sendTransaction } = useWallet();
    return (
        <div className="Error">
            <h1>No Games Available! Please create a new game.</h1>
            {publicKey !== null ? 
                <Popup trigger={<div className="newGame"> + New </div>}>
                    <GameCreator refresh={props.refresh} parent={publicKey.toString()} />
                </Popup>
                :
                <p>Wallet Not Connected!</p>
            }
            <button onClick={props.refresh}>Refresh</button>
        </div>
    );
}

//Change onClick for join button to proper function later
const GameTable = (props) => {
    const { publicKey, sendTransaction } = useWallet();
    return (
        <div>
            <table className="Games">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Creator</th>
                        <th>Bet</th>
                        <th>Private</th>
                        <th>Full</th>
                        <th>Join</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.keys(props.games).map(function (key, index) {
                        return (
                            <tr>
                                <td>{key}</td>
                                <td>{props.games[key].parent}</td>
                                <td>{props.games[key].wager}</td>
                                <td>{props.games[key].password.toString()}</td>
                                <td>{props.games[key].full.toString()}</td>
                                <td><button disabled={publicKey == null || props.games[key].full} onClick={props.refresh}>Join</button></td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
            {publicKey == null ?
                <button disabled={true}> + New (Wallet Not Connected)</button>
                :
                <Popup trigger={<button> + New </button>}>
                    <GameCreator refresh={props.refresh} parent={publicKey.toString()} />
                </Popup>
            }
            <br></br>
            <button onClick={props.refresh}>Refresh</button>
        </div>
    );
}

const Selector = (props) => {
    const [games, setGames] = useState({games: {}});
    const [loading, setLoading] = useState(false);
    const fetchData = async () => {
        setLoading(true);
        let err = true;
        while (err)
        {
            try
            {
                await fetch("http://localhost:80/games")
                    .then(response => {
                        err = false;
                        return response.json()
                    })
                    .then (data => {
                        setGames(data)
                        setLoading(false);
                    });
            }
            catch { err = true; }
        }

    }

    useEffect(() => {
        fetchData();
    }, []);

    if (loading == true)
    {
        return (
            <div className="select">
                <Loading />
            </div>
        );
    }
    else
    {
        console.log("Games: " + Object.entries(games.games).length);
        if (Object.entries(games.games).length > 0)
        {
            return (
                <div className="select">
                    <GameTable refresh={fetchData} games={games.games} />
                </div>
            );
        }
        else 
        {
            return (
                <div className="select">
                    <Empty refresh={fetchData} />
                </div>
            );
        }
    }
}

export { Selector };