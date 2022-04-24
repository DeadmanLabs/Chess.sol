const express = require('express');
const app = express();
http = require('http'); //Update to https later
const solana = require('@solana/web3.js');
const bodyParser = require('body-parser');
const uuid = require('uuid');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const server = http.createServer(app);
const wss = require('socket.io')(server, {
    cors: {
        origin: '*',
    }
});
const games = {}
const escrow = solana.Keypair.fromSecretKey(new Uint8Array([83,61,11,202,233,91,145,84,114,246,170,148,104,93,70,122,219,29,
                                                            237,128,185,176,237,178,33,164,177,85,83,48,23,17,187,58,155,176,
                                                            253,28,255,9,247,153,198,53,44,198,150,99,230,59,102,233,118,53,
                                                            198,92,189,212,78,7,148,39,179,41])); //This is a DEVNET ONLY PRIVATE KEY
                                                            //DO NOT UNDER ANY CIRCUMSTANCES PUT A MAINNET KEY HERE AND PUSH
const network = new solana.Connection(solana.clusterApiUrl('devnet'), 'confirmed');

class Game {
    constructor(wager, password, parent) {
        this.board = undefined;
        this.password = "";
        this.wager = wager;

        this.parent = parent;
        this.challenger = undefined;
        this.parent_raw = undefined; //Define parent on join with matching address
        this.challenger_raw = challenger_raw;
        this.parent_buyin = undefined;
        this.challenger_buyin = undefined; //Holds players transaction to pay the buyin
        this.gameover = false;
    }

    async payWinner() {
        if (this.checkWin() != undefined)
        {
            const transaction = new web3.Transaction().add(
                web3.SystemProgram.transfer({
                    fromPubkey: escrow.publicKey,
                    toPubkey: this.checkWin(),
                    lamports: (wager * 2) - 0.0001
                }),
            );
            const signature = await web3.sendAndConfirmTransaction(
                network,
                transaction,
                [escrow]
            );
            let result = JSON.stringify('game', { status: "gameover", reason: this.checkWin() + " Won", payment: signature });
            this.parent_raw.emit(result);
            this.challenger_raw.emit(result);
            this.gameover = true;
            this.parent_raw.disconnect();
            this.challenger_raw.disconnect();
        }
        else
        {
            let result = JSON.stringify('game', { status: "gameover", reason: "Stalemate" });
            this.parent_raw.emit(result);
            this.challenger_raw.emit(result);
            this.gameover = true;
            this.parent_raw.disconnect();
            this.challenger_raw.disconnect();
        }
    }

    join(address, socket, isCreator)
    {
        if (isCreator)
        {
            this.parent = address;
            this.parent_raw = socket;
            this.parent_raw.emit('payment', JSON.stringify({ status: "buyin", amount: this.wager, address: escrow.publicKey.toString() }));
        }
        else
        {
            this.challenger = address;
            this.challenger_raw = socket;
            this.challenger_raw.emit('payment', JSON.stringify({ status: "buyin", amount: this.wager, address: escrow.publicKey.toString() }));
        }
    }

    checkWin() {
        //Check if the board is in a win positin. If it is, return the player else return undefined
    }

    toJSON() {
        
    }
}

app.get('/games', function (req, res) {
    let response = {games: {}};
    for (const [key, value] of Object.entries(games)) {
        response.games[key] = games[key].toJSON();
    }
    res.send(JSON.stringify(response));
    res.end();
});

app.post('/new', function (req, res) {
    let params = JSON.parse(req.body.params);
    let id = uuid.v4();
    games[id] = new Game(params.wager, params.password, params.parent);
    res.send(JSON.stringify({ status: "success", game: id }));
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
        let params = JSON.parse(data);
        if (games[params.id] != undefined)
        {
            if (games[params.id].password == params.password) 
            {
                //check params.transaction
                games[params.id].challenger = params.address;
                games[params.id].challenger_raw = ws;
                ws.on('', (data) => {

                });
                ws.on('', (data) => {

                });
                ws.emit('entry', JSON.stringify({ status: "success", reason: "", code: 200, id: params.id }));
            }
            else 
            {
                ws.emit('entry', JSON.stringify({ status: "failed", reason: "Password is invalid!", code: 403 }));
            }
        }
        else 
        {
            ws.emit('entry', JSON.stringify({ status: "failed", reason: "Requested game does not exist!", code: 404 }));
        }
    });
});

wss.listen(server);
console.log('Running Chess.SOL @ 80...');