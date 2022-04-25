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

const { Chess } = require('chess.js');
const { throws } = require('assert');
const games = {}
const escrow = solana.Keypair.fromSecretKey(new Uint8Array([83,61,11,202,233,91,145,84,114,246,170,148,104,93,70,122,219,29,
                                                            237,128,185,176,237,178,33,164,177,85,83,48,23,17,187,58,155,176,
                                                            253,28,255,9,247,153,198,53,44,198,150,99,230,59,102,233,118,53,
                                                            198,92,189,212,78,7,148,39,179,41])); //This is a DEVNET ONLY PRIVATE KEY
                                                            //DO NOT UNDER ANY CIRCUMSTANCES PUT A MAINNET KEY HERE AND PUSH
const network = new solana.Connection(solana.clusterApiUrl('devnet'), 'confirmed');
///const chess=new Chess();
class Game {
    constructor(wager, password, parent) {
        this.instance = new Chess();
        this.password = "";
        this.wager = wager;

        this.parent = parent;//black
        this.challenger = undefined; //white
        this.parent_raw = undefined;
        this.challenger_raw = undefined;
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
                    lamports: ((wager * 2) - 0.0001) * LAMPORTS_PER_SOL
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

    checkWin() {
        //Check if the board is in a win positin. If it is, return the player else return undefined
        if (this.instance.in_checkmate())
        { //the player has lost
            return (this.instance.turn() == 'b' ? this.challenger : this.parent);
        }
        if (this.instance.in_draw())
        {
            return undefined;
        }
    }

    perpetrateMove(curMove){
        //returns the state of the board and the current player's potential move set
        if (this.instance.move(curMove) == null) 
        {
            return JSON.stringify({moves: this.instance.moves()});
        }
        else
        {
            return JSON.stringify({board: this.instance.fen(), moves: this.instance.moves()});
        }
    }

    join(address, socket, isCreator)
    {
        if (isCreator)
        {
            if (this.parent_buyin == undefined)
            {
                this.parent = address;
                this.parent_raw = socket;
                this.parent_raw.emit('payment', JSON.stringify({ status: "buyin", amount: this.wager, address: escrow.publicKey.toString() }));
                return JSON.stringify({ status: "success", reason: "", code: 200, id: params.id });
            }
            else {
                return JSON.stringify({ status: "failed", reason: "The creator of this game has already paid", code: 402});
            }
        }
        else
        {
            if (this.challenger_buyin == undefined)
            {
                this.challenger = address;
                this.challenger_raw = socket;
                this.challenger_raw.emit('payment', JSON.stringify({ status: "buyin", amount: this.wager, address: escrow.publicKey.toString() }));
                return JSON.stringify({ status: "success", reason: "", code: 200, id: params.id });
            }
            else {
                return JSON.stringify({ status: "failed", reason: "The challenger of this game has already paid", code: 402});
            }
        }
    }

    toJSON() {
        return {
            "wager": this.wager,
            "parent": this.parent,
            "password": this.password != '',
            "challenger":(this.challenger != undefined)
        };
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

async function confirmPayment(signature) {
    let result = await network.getSignatureStatus(signature);
    if (result.hasOwnProperty('confirmationStatus')){
        return (result.value.confirmationStatus == 'confirmed' || result.value.confirmationStatus == 'finalized');
    }
    return false;
}

wss.on('connection', async (ws) => {
    let game = undefined;
    ws.on('join', async (data) => {
        let params = JSON.parse(data);
        if (games[params.id] != undefined)
        {
            if (games[params.id].password == params.password) 
            {
                games[params.id].challenger = params.address;
                games[params.id].challenger_raw = ws;
                ws.on('payment', (data) => {
                    let details = JSON.parse(data);
                    if (details.amount >= games[game].wager)
                    {
                        if (await confirmPayment(details.tx))
                        {
                            if (details.address == games[game].parent)
                            {
                                games[game].parent_buyin = details.tx;
                            }
                            else if (details.address == games[game].challenger)
                            {
                                games[game].challenger_buyin = details.tx;
                            }
                        }
                    }
                });
                ws.on('game', (data) => {
                    let details = JSON.parse(data);
                });
                let response = games[params.id].join(params.address, ws, (games[params.id].parent == params.address));
                ws.emit('entry', response);
                if (response.status == "failed") {
                    game = undefined;
                    ws.disconnect();
                }
                game = params.id;
                ws.emit('payment', JSON.stringify({ address: escrow.publicKey.toString(), amount: (games[game].wager + 0.0001) }));

            }
            else 
            {
                game = undefined;
                ws.emit('entry', JSON.stringify({ status: "failed", reason: "Password is invalid!", code: 403 }));
                ws.disconnect();
            }
        }
        else 
        {
            game = undefined;
            ws.emit('entry', JSON.stringify({ status: "failed", reason: "Requested game does not exist!", code: 404 }));
            ws.disconnect();
        }
    });
});

wss.listen(server);
console.log('Running Chess.SOL @ 80...');