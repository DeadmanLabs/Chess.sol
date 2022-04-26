import React, { useState, useCallback, useEffect, useMemo } from 'react';

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
            {loading ?
                <div></div>
                :
                <form onSubmit={handleSubmit}>
                    <label>Bet:</label>
                    <input type="text" pattern="[0-9]+[.][0-9]{0,3}[1-9]{1}" id="wager" name="wager" /><label>SOL</label><br />
                    <label>Password:</label>
                    <input type="text" id="password" name="password" /><br />
                    <input type="submit" value="Create Game" />
                </form>
            }
        </div>
    );
}

export { GameCreator };