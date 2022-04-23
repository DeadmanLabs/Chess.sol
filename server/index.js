const express = require('express');
const app = express();
http = require('http'); //Update to https later
const solana = require('@solana/web3.js');
const bodyParser = require('body-parser');
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
const games = []
const escrow = solana.Keypair.fromSecretKey(new Uint8Array([83,61,11,202,233,91,145,84,114,246,170,148,104,93,70,122,219,29,
                                                            237,128,185,176,237,178,33,164,177,85,83,48,23,17,187,58,155,176,
                                                            253,28,255,9,247,153,198,53,44,198,150,99,230,59,102,233,118,53,
                                                            198,92,189,212,78,7,148,39,179,41])); //This is a DEVNET ONLY PRIVATE KEY
                                                            //DO NOT UNDER ANY CIRCUMSTANCES PUT A MAINNET KEY HERE AND PUSH
const network = new solana.Connection(solana.clusterApiUrl('devnet'), 'confirmed');
///const chess=new Chess();
class Game {
    constructor(wager, password, parent, parent_raw) {
        this.instance = new Chess();
        this.password = "";
        this.wager = wager;

        this.parent = parent;//black
        this.challenger = undefined; //white
        this.parent_raw = parent_raw;
        this.challenger_raw = challenger_raw;
    }
    
    payWinner() {
        if (this.checkWin() != undefined)
        {
            //pay this.checkWin()
        }
    }

    checkWin() {
        //Check if the board is in a win positin. If it is, return the player else return undefined
        if (this.instance.in_checkmate()){ //the player has lost
            return (this.instance.turn()=='b' ? this.challenger:this.parent);
        }
        if (this.instance.in_draw()){
            return undefined;
        }
    }

    perpetrateMove(curMove){
        //returns the state of the board and the current player's potential move set
        if (this.instance.move(curMove)==null){
            return JSON.stringify({moves: this.instance.moves()});
        }
        else{
            return JSON.stringify({board: this.instance.fen(), moves: this.instance.moves()});
        }
    }

    toJSON() {
        
    }
}

app.get('/games', function (req, res) {
    let response = {games: []};
    games.forEach(element => {
        response.games.push(element.response)
    });
    res.send(JSON.stringify(response));
    res.end();
});

app.post('/new', function (req, res) {
    let params = JSON.parse(req.body.params);
    games.push(new Game(params.wager, params.password, params.parent, params.parent_raw));
    res.send(JSON.stringify({ status: "success" }))
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

    });
});

wss.listen(server);
console.log('Running Chess.SOL @ 8080...');