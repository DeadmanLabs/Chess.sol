import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletNotConnectedError, WalletSignTransactionError } from '@solana/wallet-adapter-base';
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import './Selector.css';

const Loading = () => {
    return (
        <div className="Loading">
            <h1>Loading games! Please wait...</h1>
            <img src="loading.gif" />
        </div>
    );
}

const Empty = () => {
    return (
        <div className="Error">
            <h1>No Games Available! Please create a new game.</h1>
            <button>+ New</button>
            <button>Refresh</button>
        </div>
    );
}

const GameTable = (props) => {
    return (
        <div className="Games">
            <h1>{props.games} map here</h1>
        </div>
    );
}

const Selector = (props) =>
{
    const [games, setGames] = useState({games: {}});
    const [loading, setLoading] = useState(false);
    const fetchData = () => {
        setLoading(true);
        fetch("http://localhost/games")
            .then(response => {
                return response.json()
            })
            .then (data => {
                setGames(data)
                setLoading(false);
            });
    }

    function componentDidMount() {
        fetchData();
    }

    return (
        <div className="select">
            {loading ? 
                <Loading /> : 
                Object.entries(games.games).length > 0 ?
                    <GameTable games={games} /> :
                    <Empty />
            }
        </div>
    )
}

export { Selector };