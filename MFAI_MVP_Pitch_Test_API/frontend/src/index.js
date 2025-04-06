import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme,
} from '@rainbow-me/rainbowkit';
import { http } from 'viem';
import { bscTestnet, bsc } from 'viem/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import './styles/global.css';

// Configuration for RainbowKit and Wagmi
const config = getDefaultConfig({
  appName: 'MFAI Bridge',
  projectId: process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [bscTestnet, bsc],
  transports: {
    [bscTestnet.id]: http(),
    [bsc.id]: http(),
  },
});

// Create a client for React Query
const queryClient = new QueryClient();

// Create root element
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = ReactDOM.createRoot(rootElement);

// Render the app
root.render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
); 