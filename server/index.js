const express = require('express');
const app = express();
http = require('http'); //Update to https later
const solana = require('@solana/web3.js');
const server = http.createServer(app);
const wss = require('socket.io')(server, {
    cors: {
        origin: '*',
    }
});
const games = []
const escrow = solana.Keypair.fromSecretKey(new Uint8Array([83,61,11,202,233,91,145,84,114,246,170,148,104,93,70,122,219,29,
                                                            237,128,185,176,237,178,33,164,177,85,83,48,23,17,187,58,155,176,
                                                            253,28,255,9,247,153,198,53,44,198,150,99,230,59,102,233,118,53,
                                                            198,92,189,212,78,7,148,39,179,41])); //This is a DEVNET ONLY PRIVATE KEY
                                                            //DO NOT UNDER ANY CIRCUMSTANCES PUT A MAINNET KEY HERE AND PUSH
const network = new solana.Connection(solana.clusterApiUrl('devnet'), 'confirmed');

class Game {
    constructor(wager, password, parent, parent_raw) {
        this.board = undefined;
        this.password = "";
        this.wager = wager;

        this.parent = parent;
        this.challenger = undefined;
        this.parent_raw = parent_raw;
        this.challenger_raw = challenger_raw;
    }

    payWinner() {
        if (this.checkWin() != undefined)
        {
            if (this.checkWin() == 1) {

            }
            else if (this.checkWin() == 2) {

            }
            else { return; } //Dont pay anyone if there is a stalemate
        }
    }

    checkWin() {
        //Check if the board is in a win positin. If it is, return the player else return undefined
    }

}

app.get('/', function (req, res) {
    res.send("");
    res.end();
});

server.listen(80); //change to 443 for HTTPS

async function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

wss.on('connection', async (ws) => {
    ws.on('join', (data) => {

    });
});

wss.listen(server);
console.log('Running Chess.SOL @ 8080...');