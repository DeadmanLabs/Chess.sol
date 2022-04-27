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
    const [board, setBoard] = useState("");
    const [moves, setMoves] = useState({});
    const [error, setError] = useState({status: "", reason: "", code: 0});

    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();

    const pieces = {w: {'Rook': <img src="chess_pieces\Rook_White.png" className="piece" />,
                        'Knight': <img src="chess_pieces\Knight_White.png" className="piece" />,
                        'Bishop': <img src="chess_pieces\Bishop_White.png" className="piece" />,
                        'Queen': <img src="chess_pieces\Queen_White.png" className="piece" />,
                        'King': <img src="chess_pieces\King_White.png" className="piece" />,
                        'Pawn': <img src="chess_pieces\Pawn_White.png" className="piece" />
                       },
                    b: {
                        'Rook': <img src="chess_pieces\Rook_Black.png" className="piece" />,
                        'Knight': <img src="chess_pieces\Knight_Black.png" className="piece" />,
                        'Bishop': <img src="chess_pieces\Bishop_Black.png" className="piece" />,
                        'Queen': <img src="chess_pieces\Queen_Black.png" className="piece" />,
                        'King': <img src="chess_pieces\King_Black.png" className="piece" />,
                        'Pawn': <img src="chess_pieces\Pawn_Black.png" className="piece" />
                       }
                   }

    useEffect(() => {
        const socket = ws("http://localhost/");
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
                    console.log("New Board!");
                }
                else if (details.status == "move")
                {
                    //new possible moveset
                    setMoves(details.moves);
                    console.log("New Moves!");
                }
            });
            socket.on('payment', async (params) => {
                let details = JSON.parse(params);
                console.log(`Payment Requested: to ${details.address}, amount ${details.amount*LAMPORTS_PER_SOL}`);
                if (!publicKey) throw new WalletNotConnectedError();
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
        props.callback("");
    }

    function mapPiece(pos) 
    {
        //Get Piece at location from chess.js
    }
    
    return (
        <div>
        {socket == undefined ?
                <div>
                    <h1>Connecting...</h1>
                </div>
            :
                <div>
                    <table>
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
                            <td className="A row" id="A8" ></td>
                            <td className="B row2" id="B8" ></td>
                            <td className="C row" id="C8" ></td>
                            <td className="D row2" id="D8" ></td>
                            <td className="E row" id="E8" ></td>
                            <td className="F row2" id="F8" ></td>
                            <td className="G row" id="G8" ></td>
                            <td className="H row2" id="H8" ></td>
                        </tr>
                        <tr className="_7">
                            <th className="header">7</th>
                            <td className="A row" id="A7" ></td>
                            <td className="B row2" id="B7" ></td>
                            <td className="C row" id="C7" ></td>
                            <td className="D row2" id="D7" ></td>
                            <td className="E row" id="E7" ></td>
                            <td className="F row2" id="F7" ></td>
                            <td className="G row" id="G7" ></td>
                            <td className="H row2" id="H7" ></td>
                        </tr>
                        <tr className="_6">
                            <th className="header">6</th>
                            <td className="A row" id="A6" ></td>
                            <td className="B row2" id="B6" ></td>
                            <td className="C row" id="C6" ></td>
                            <td className="D row2" id="D6" ></td>
                            <td className="E row" id="E6" ></td>
                            <td className="F row2" id="F6" ></td>
                            <td className="G row" id="G6" ></td>
                            <td className="H row2" id="H6" ></td>
                        </tr>
                        <tr className="_5">
                            <th className="header">5</th>
                            <td className="A row" id="A5" ></td>
                            <td className="B row2" id="B5" ></td>
                            <td className="C row" id="C5" ></td>
                            <td className="D row2" id="D5" ></td>
                            <td className="E row" id="E5" ></td>
                            <td className="F row2" id="F5" ></td>
                            <td className="G row" id="G5" ></td>
                            <td className="H row2" id="H5" ></td>
                        </tr>
                        <tr className="_4">
                            <th className="header">4</th>
                            <td className="A row" id="A4" ></td>
                            <td className="B row2" id="B4" ></td>
                            <td className="C row" id="C4" ></td>
                            <td className="D row2" id="D4" ></td>
                            <td className="E row" id="E4" ></td>
                            <td className="F row2" id="F4" ></td>
                            <td className="G row" id="G4" ></td>
                            <td className="H row2" id="H4" ></td>
                        </tr>
                        <tr className="_3">
                            <th className="header">3</th>
                            <td className="A row" id="A3" ></td>
                            <td className="B row2" id="B3" ></td>
                            <td className="C row" id="C3" ></td>
                            <td className="D row2" id="D3" ></td>
                            <td className="E row" id="E3" ></td>
                            <td className="F row2" id="F3" ></td>
                            <td className="G row" id="G3" ></td>
                            <td className="H row2" id="H3" ></td>
                        </tr>
                        <tr className="_2">
                            <th className="header">2</th>
                            <td className="A row" id="A2" ></td>
                            <td className="B row2" id="B2" ></td>
                            <td className="C row" id="C2" ></td>
                            <td className="D row2" id="D2" ></td>
                            <td className="E row" id="E2" ></td>
                            <td className="F row2" id="F2" ></td>
                            <td className="G row" id="G2" ></td>
                            <td className="H row2" id="H2" ></td>
                        </tr>
                        <tr className="_1">
                            <th className="header">1</th>
                            <td className="A" id="A1" ></td>
                            <td className="B" id="B1" ></td>
                            <td className="C" id="C1" ></td>
                            <td className="D" id="D1" ></td>
                            <td className="E" id="E1" ></td>
                            <td className="F" id="F1" ></td>
                            <td className="G" id="G1" ></td>
                            <td className="H" id="H1" ></td>
                        </tr>
                    </table>
                    <button onClick={forfeit}>Forfeit</button>
                </div>
        }
        </div>
    );
}

export { Game };