import './App.css';

import React, { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  LedgerWalletAdapter,
  PhantomWalletAdapter,
  SlopeWalletAdapter,
  SolflareWalletAdapter,
  SolletExtensionWalletAdapter,
  SolletWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

import { Nav } from './Components/Nav.tsx';

function App() {

  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]); //We can attach a switch to network to make a mainnet version
  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
    new SlopeWalletAdapter(),
    new SolflareWalletAdapter({ network }),
    new LedgerWalletAdapter(),
    new SolletWalletAdapter({ network }),
    new SolletExtensionWalletAdapter({ network })
  ], [network]);

  return (
    <div className="App" backgroundcolor="#262626">
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <Nav />
            <Selector />
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </div>
  );
}

export default App;
