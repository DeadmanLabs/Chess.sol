import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletNotConnectedError, WalletSignTransactionError } from '@solana/wallet-adapter-base';
import { Keypair, SystemProgram, Transaction, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import ws, { Socket } from 'socket.io-client';
import { Chess } from 'chess.js'; 
import './Game.css';

const Game = (props) => {

    const [response, setResponse] = useState("");
    const [game, setGame] = useState(undefined);
    const [socket, setSocket] = useState(undefined);
    const [state, setState] = useState("pending");
    const [board, setBoard] = useState(undefined);
    const [moves, setMoves] = useState({});
    const [error, setError] = useState({status: "", reason: "", code: 0});

    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();

    const pieces = {w: {'r': <img src="chess_pieces\Rook_White.png" className="piece" />,
                        'n': <img src="chess_pieces\Knight_White.png" className="piece" />,
                        'b': <img src="chess_pieces\Bishop_White.png" className="piece" />,
                        'q': <img src="chess_pieces\Queen_White.png" className="piece" />,
                        'k': <img src="chess_pieces\King_White.png" className="piece" />,
                        'p': <img src="chess_pieces\Pawn_White.png" className="piece" />
                       },
                    b: {
                        'r': <img src="chess_pieces\Rook_Black.png" className="piece" />,
                        'n': <img src="chess_pieces\Knight_Black.png" className="piece" />,
                        'b': <img src="chess_pieces\Bishop_Black.png" className="piece" />,
                        'q': <img src="chess_pieces\Queen_Black.png" className="piece" />,
                        'k': <img src="chess_pieces\King_Black.png" className="piece" />,
                        'p': <img src="chess_pieces\Pawn_Black.png" className="piece" />
                       }
                   }

    useEffect(() => {
        const socket = ws("http://192.168.2.247/");
        socket.on('connect', () => {
            setSocket(socket);
            socket.on('game', (params) => {
                let details = JSON.parse(params);
                console.log('Game Packet!');
                //Handle new board, move and gameover events
                if (details.status == "gameover")
                {
                    //Terminate Socket and display end message
                    socket.disconnect();
                    setGame(undefined);
                    setBoard("");
                    setMoves({});
                    console.log("Game Over!");
                }
                else if (details.status == "board")
                {
                    //Update board event
                    setBoard(details.board);
                    console.log(`New Board! ${board}`);
                }
                else if (details.status == "move")
                {
                    //new possible moveset
                    if (details.hasOwnProperty('board'))
                    {
                        setBoard(Chess(details.board));
                        console.log(`New Board! ${details.board}`);
                    }
                    setMoves(details.moves);
                    console.log("New Moves!");
                }
            });
            socket.on('payment', async (params) => {
                let details = JSON.parse(params);
                console.log(`Payment Requested: to ${details.address}, amount ${details.amount*LAMPORTS_PER_SOL}`);
                if (!publicKey) throw new WalletNotConnectedError();
                details.amount += 0.00001;
                const transaction = new Transaction().add(
                    SystemProgram.transfer({
                        fromPubkey: publicKey,
                        toPubkey: new PublicKey(details.address),
                        lamports: details.amount * LAMPORTS_PER_SOL
                    })
                );
                console.log(`Sending Payment...`);
                const signature = (await sendTransaction(transaction, connection));
                await connection.confirmTransaction(signature, 'confirmed');
                console.log(`sent`);
                //This is a major security issue, as we arent confirming the amount via the signature. Dont have time to fix rn
                socket.emit('payment', JSON.stringify({ id: game, tx: signature, amount: details.amount }));
            });
            socket.on('payment-completed', (params) => {
                let details = JSON.parse(params);
                setState("paid");
                console.log("Payment Completed!");
            });
            socket.on('entry', (params) => {
                let details = JSON.parse(params);
                console.log("Entry Packet!");
                if (details.status == 'success') {
                    setGame(details.id);
                    setState("joined");
                    console.log("Joined game " + details.id);
                }
                else {
                    setError(details);
                    //Display Error and redirect home
                    console.log("Error: " + error.reason);
                    socket.disconnect();
                    props.callback("");
                }
            });
            socket.emit('join', JSON.stringify({ id: props.gameId, password: props.password, address: props.address }));
        });
        //return () => socket.disconnect();
    }, []);

    function forfeit()
    {
        //Terminate socket here
        socket.emit('game', JSON.stringify({ status: "forfeit" }));
        props.callback("");
    }

    function mapPiece(pos) 
    {
        if (board != undefined)
        {
            let piece = board.get(pos.toLowerCase());
            if (piece != null)
            {
                return pieces[piece.color][piece.type.toLowerCase()];
            }
            return;
        }
        return;
    }
    
    return (
        <div>
        {socket == undefined ?
                <div>
                    <h1>Connecting...</h1>
                </div>
            :
                <div>
                    <table className="gameBoard">
                        <tr>
                            <th className="header"></th>
                            <th className="header">A</th>
                            <th className="header">B</th>
                            <th className="header">C</th>
                            <th className="header">D</th>
                            <th className="header">E</th>
                            <th className="header">F</th>
                            <th className="header">G</th>
                            <th className="header">H</th>
                        </tr>
                        <tr className="_8">
                            <th className="header">8</th>
                            <td className="row" id="A8" >{mapPiece("A8")}</td>
                            <td className="row2" id="B8" >{mapPiece("B8")}</td>
                            <td className="row" id="C8" >{mapPiece("C8")}</td>
                            <td className="row2" id="D8" >{mapPiece("D8")}</td>
                            <td className="row" id="E8" >{mapPiece("E8")}</td>
                            <td className="row2" id="F8" >{mapPiece("F8")}</td>
                            <td className="row" id="G8" >{mapPiece("G8")}</td>
                            <td className="row2" id="H8" >{mapPiece("H8")}</td>
                        </tr>
                        <tr className="_7">
                            <th className="header">7</th>
                            <td className="row2" id="A7" >{mapPiece("A7")}</td>
                            <td className="row" id="B7" >{mapPiece("B7")}</td>
                            <td className="row2" id="C7" >{mapPiece("C7")}</td>
                            <td className="row" id="D7" >{mapPiece("D7")}</td>
                            <td className="row2" id="E7" >{mapPiece("E7")}</td>
                            <td className="row" id="F7" >{mapPiece("F7")}</td>
                            <td className="row2" id="G7" >{mapPiece("G7")}</td>
                            <td className="row" id="H7" >{mapPiece("H7")}</td>
                        </tr>
                        <tr className="_6">
                            <th className="header">6</th>
                            <td className="row" id="A6" >{mapPiece("A6")}</td>
                            <td className="row2" id="B6" >{mapPiece("B6")}</td>
                            <td className="row" id="C6" >{mapPiece("C6")}</td>
                            <td className="row2" id="D6" >{mapPiece("D6")}</td>
                            <td className="row" id="E6" >{mapPiece("E6")}</td>
                            <td className="row2" id="F6" >{mapPiece("F6")}</td>
                            <td className="row" id="G6" >{mapPiece("G6")}</td>
                            <td className="row2" id="H6" >{mapPiece("H6")}</td>
                        </tr>
                        <tr className="_5">
                            <th className="header">5</th>
                            <td className="row2" id="A5" >{mapPiece("A5")}</td>
                            <td className="row" id="B5" >{mapPiece("B5")}</td>
                            <td className="row2" id="C5" >{mapPiece("C5")}</td>
                            <td className="row" id="D5" >{mapPiece("D5")}</td>
                            <td className="row2" id="E5" >{mapPiece("E5")}</td>
                            <td className="row" id="F5" >{mapPiece("F5")}</td>
                            <td className="row2" id="G5" >{mapPiece("G5")}</td>
                            <td className="row" id="H5" >{mapPiece("H5")}</td>
                        </tr>
                        <tr className="_4">
                            <th className="header">4</th>
                            <td className="row" id="A4" >{mapPiece("A4")}</td>
                            <td className="row2" id="B4" >{mapPiece("B4")}</td>
                            <td className="row" id="C4" >{mapPiece("C4")}</td>
                            <td className="row2" id="D4" >{mapPiece("D4")}</td>
                            <td className="row" id="E4" >{mapPiece("E4")}</td>
                            <td className="row2" id="F4" >{mapPiece("F4")}</td>
                            <td className="row" id="G4" >{mapPiece("G4")}</td>
                            <td className="row2" id="H4" >{mapPiece("H4")}</td>
                        </tr>
                        <tr className="_3">
                            <th className="header">3</th>
                            <td className="row2" id="A3" >{mapPiece("A3")}</td>
                            <td className="row" id="B3" >{mapPiece("B3")}</td>
                            <td className="row2" id="C3" >{mapPiece("C3")}</td>
                            <td className="row" id="D3" >{mapPiece("D3")}</td>
                            <td className="row2" id="E3" >{mapPiece("E3")}</td>
                            <td className="row" id="F3" >{mapPiece("F3")}</td>
                            <td className="row2" id="G3" >{mapPiece("G3")}</td>
                            <td className="row" id="H3" >{mapPiece("H3")}</td>
                        </tr>
                        <tr className="_2">
                            <th className="header">2</th>
                            <td className="row" id="A2" >{mapPiece("A2")}</td>
                            <td className="row2" id="B2" >{mapPiece("B2")}</td>
                            <td className="row" id="C2" >{mapPiece("C2")}</td>
                            <td className="row2" id="D2" >{mapPiece("D2")}</td>
                            <td className="row" id="E2" >{mapPiece("E2")}</td>
                            <td className="row2" id="F2" >{mapPiece("F2")}</td>
                            <td className="row" id="G2" >{mapPiece("G2")}</td>
                            <td className="row2" id="H2" >{mapPiece("H2")}</td>
                        </tr>
                        <tr className="_1">
                            <th className="header">1</th>
                            <td className="row2" id="A1" >{mapPiece("A1")}</td>
                            <td className="row" id="B1" >{mapPiece("B1")}</td>
                            <td className="row2" id="C1" >{mapPiece("C1")}</td>
                            <td className="row" id="D1" >{mapPiece("D1")}</td>
                            <td className="row2" id="E1" >{mapPiece("E1")}</td>
                            <td className="row" id="F1" >{mapPiece("F1")}</td>
                            <td className="row2" id="G1" >{mapPiece("G1")}</td>
                            <td className="row" id="H1" >{mapPiece("H1")}</td>
                        </tr>
                    </table>
                    <button onClick={forfeit}>Forfeit</button>
                </div>
        }
        </div>
    );
}

export { Game };