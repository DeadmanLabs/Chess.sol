import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletNotConnectedError, WalletSignTransactionError } from '@solana/wallet-adapter-base';
import { Keypair, SystemProgram, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import ws from 'socket.io-client';
import './Game.css';
import { SocketAddress } from 'net';

const Game = (props) => {

    const [response, setResponse] = useState("");
    const [game, setGame] = useState(undefined);
    const [board, setBoard] = useState("");
    const [error, setError] = useState({});
    useEffect(() => {
        const socket = ws("http://localhost/");
        socket.on('connect', () => {
            socket.on('game', (params) => {

            });
            socket.on('payment', async (params) => {
                let details = JSON.parse(params);
                const { connection } = useConnection();
                const { publicKey, sendTransaction } = useWallet();
                if (!publicKey) throw new WalletNotConnectedError();
                const transaction = new Transaction().add(
                    SystemProgram.transfer({
                        fromPubkey: publicKey,
                        toPubkey: details.address,
                        lamports: details.amount * LAMPORTS_PER_SOL
                    })
                );
                const signature = await sendTransaction(transaction, connection);
                await connection.confirmTransaction(signature, 'confirmed');
                socket.emit('payment', JSON.stringify({ id: game, tx: signature }))
            });
            socket.on('entry', (params) => {
                let details = JSON.parse(params);
                if (details.status == 'success') {
                    setGame(details.id);
                }
                else {
                    setError(details);
                }
            });

            socket.emit(JSON.stringify({id: props.gameId, password: props.password, address: props.address, transaction: props.tx }));
        });
    }, []);

    return (
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
                <td className="A"><img src="chess_pieces\Rook_White.png" className="piece" /></td>
                <td className="B"><img src="chess_pieces\Knight_White.png" className="piece" /></td>
                <td className="C"><img src="chess_pieces\Bishop_White.png" className="piece" /></td>
                <td className="D"><img src="chess_pieces\Queen_White.png" className="piece" /></td>
                <td className="E"><img src="chess_pieces\King_White.png" className="piece" /></td>
                <td className="F"><img src="chess_pieces\Bishop_White.png" className="piece" /></td>
                <td className="G"><img src="chess_pieces\Knight_White.png" className="piece" /></td>
                <td className="H"><img src="chess_pieces\Rook_White.png" className="piece" /></td>
            </tr>
            <tr className="_7">
                <th className="header">7</th>
                <td className="A"><img src="chess_pieces\Pawn_White.png" className="piece" /></td>
                <td className="B"><img src="chess_pieces\Pawn_White.png" className="piece" /></td>
                <td className="C"><img src="chess_pieces\Pawn_White.png" className="piece" /></td>
                <td className="D"><img src="chess_pieces\Pawn_White.png" className="piece" /></td>
                <td className="E"><img src="chess_pieces\Pawn_White.png" className="piece" /></td>
                <td className="F"><img src="chess_pieces\Pawn_White.png" className="piece" /></td>
                <td className="G"><img src="chess_pieces\Pawn_White.png" className="piece" /></td>
                <td className="H"><img src="chess_pieces\Pawn_White.png" className="piece" /></td>
            </tr>
            <tr className="_6">
                <th className="header">6</th>
                <td className="A"></td>
                <td className="B"></td>
                <td className="C"></td>
                <td className="D"></td>
                <td className="E"></td>
                <td className="F"></td>
                <td className="G"></td>
                <td className="H"></td>
            </tr>
            <tr className="_5">
                <th className="header">5</th>
                <td className="A"></td>
                <td className="B"></td>
                <td className="C"></td>
                <td className="D"></td>
                <td className="E"></td>
                <td className="F"></td>
                <td className="G"></td>
                <td className="H"></td>
            </tr>
            <tr className="_4">
                <th className="header">4</th>
                <td className="A"></td>
                <td className="B"></td>
                <td className="C"></td>
                <td className="D"></td>
                <td className="E"></td>
                <td className="F"></td>
                <td className="G"></td>
                <td className="H"></td>
            </tr>
            <tr className="_3">
                <th className="header">3</th>
                <td className="A"></td>
                <td className="B"></td>
                <td className="C"></td>
                <td className="D"></td>
                <td className="E"></td>
                <td className="F"></td>
                <td className="G"></td>
                <td className="H"></td>
            </tr>
            <tr className="_2">
                <th className="header">2</th>
                <td className="A"><img src="chess_pieces\Pawn_Black.png" className="piece" /></td>
                <td className="B"><img src="chess_pieces\Pawn_Black.png" className="piece" /></td>
                <td className="C"><img src="chess_pieces\Pawn_Black.png" className="piece" /></td>
                <td className="D"><img src="chess_pieces\Pawn_Black.png" className="piece" /></td>
                <td className="E"><img src="chess_pieces\Pawn_Black.png" className="piece" /></td>
                <td className="F"><img src="chess_pieces\Pawn_Black.png" className="piece" /></td>
                <td className="G"><img src="chess_pieces\Pawn_Black.png" className="piece" /></td>
                <td className="H"><img src="chess_pieces\Pawn_Black.png" className="piece" /></td>
            </tr>
            <tr className="_1">
                <th className="header">1</th>
                <td className="A"><img src="chess_pieces\Rook_Black.png" className="piece" /></td>
                <td className="B"><img src="chess_pieces\Knight_Black.png" className="piece" /></td>
                <td className="C"><img src="chess_pieces\Bishop_Black.png" className="piece" /></td>
                <td className="D"><img src="chess_pieces\Queen_Black.png" className="piece" /></td>
                <td className="E"><img src="chess_pieces\King_Black.png" className="piece" /></td>
                <td className="F"><img src="chess_pieces\Bishop_Black.png" className="piece" /></td>
                <td className="G"><img src="chess_pieces\Knight_Black.png" className="piece" /></td>
                <td className="H"><img src="chess_pieces\Rook_Black.png" className="piece" /></td>
            </tr>
        </table>
    );
}

export { Game };