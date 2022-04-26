import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletNotConnectedError, WalletSignTransactionError } from '@solana/wallet-adapter-base';
import Popup from 'reactjs-popup';
import React, { useState, useCallback, useEffect, useMemo, Component } from 'react';
//@ts-ignore
import { GameCreator } from './GameCreator.tsx';
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
    const { publicKey, sendTransaction } = useWallet();
    return (
        <div className="Error">
            <h1>No Games Available! Please create a new game.</h1>
            {publicKey !== null ? 
                <Popup trigger={<div className="newGame"> + New </div>}>
                    <GameCreator parent={publicKey.toString()} />
                </Popup>
                :
                <p>Wallet Not Connected!</p>
            }
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

class Selector extends Component
{
    constructor(props) 
    {
        super(props);
        this.onGameChange = this.onGameChange.bind(this);
        this.onLoadingChange = this.onLoadingChange.bind(this);
        this.state = {
            games: {games: {}},
            loading: false
        }
    }

    onGameChange(event) {
        this.setState({ games: event.target.value });
    }

    onLoadingChange(event) {
        this.setState({ loading: event.target.value });
    }

    fetchData() {
        this.setState({ loading: true });
        fetch("http://localhost/games")
            .then(response => {
                return response.json()
            })
            .then (data => {
                this.setState({ games: data });
                this.setState({ loading: false });
            });
    }

    componentDidMount() {
        this.fetchData();
        alert(JSON.stringify(this.state.games));
    }

    render() {
        return (
            <div className="select">
                {this.state.loading ? 
                    <Loading /> : 
                    Object.entries(this.state.games.games).length > 0 ?
                        <GameTable games={this.state.games} /> :
                        <Empty />
                }
            </div>
        )
    }
}

export default Selector;