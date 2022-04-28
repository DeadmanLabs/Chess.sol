import React, { useState, useCallback, useEffect, useMemo, Component } from 'react';
import './GameCreator.css';

const GameCreator = (props) => {
    const [response, setResponse] = useState(undefined);
    const [loading, setLoading] = useState(false);
    const requestNewGame = async (Pwager, Ppassword, Pparent) => {
        setLoading(true);
        await fetch("http://192.168.2.247:80/new", {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: `
                ${JSON.stringify({params: { wager: Pwager, password: Ppassword, parent: Pparent }})}
            `
        })
        .then(response => {
            return response.json();
        })
        .then(data => {
            setResponse(data);
            setLoading(false);
        })
        props.refresh();
    }

    function handleSubmit(event) {
        event.preventDefault();
        const form = event.currentTarget;
        const formElements = form.elements as typeof form.elements & {
            wager: HTMLInputElement,
            password: HTMLInputElement,
        }
        requestNewGame(formElements.wager.value, formElements.password.value, props.parent);
    }

    //Dont forget to fix the regex pattern here to accept 1 and 1. as well as 1.0
    return (
        <div className="creator">
            {loading ?
                <div>Creating Game...</div>
                :
                <form onSubmit={handleSubmit}>
                    <label>Bet: </label>
                    <input type="text" pattern="[0-9]+[.][0-9]{0,3}[1-9]{1}" id="wager" name="wager" /><label> SOL</label><br />
                    <label>Password: </label>
                    <input type="text" id="password" name="password" /><br />
                    <input type="submit" value="Create Game" />
                </form>
            }
        </div>
    );
}

const GameJoiner = (props) => {
    function handleSubmit(event) {
        event.preventDefault();
        const form = event.currentTarget;
        const formElements = form.elements as typeof form.elements & {
            password: HTMLInputElement,
        }
        props.setPass(formElements.password.value);
        props.setEntered(props.gameId);
    }

    return (
        <div className="joiner">
            <form onSubmit={handleSubmit}>
                <label>Password: </label>
                <input type="password" id="password" name="password" /><br />
                <input type="submit" value="Join" />
            </form>
        </div>
    );
}

export { GameCreator, GameJoiner };