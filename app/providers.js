'use client';

import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { arbitrumSepolia, mainnet, hardhat } from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';
import { getDefaultWallets, RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { config } from './config/env';

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [arbitrumSepolia, mainnet, hardhat],
  [
    alchemyProvider({ apiKey: config.alchemyApiKey }),
    publicProvider()
  ]
);

const { connectors } = getDefaultWallets({
  appName: 'GreenStake',
  projectId: config.walletConnectProjectId,
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

const customTheme = lightTheme({
  accentColor: '#22c55e', // Tailwind green-500
  accentColorForeground: 'white',
  borderRadius: 'large',
  fontStack: 'system',
  overlayBlur: 'small',
  modes: {
    dark: {
      accentColor: '#22c55e',
      accentColorForeground: 'white',
      actionButtonBorder: 'rgba(255, 255, 255, 0.1)',
      actionButtonBorderMobile: 'rgba(255, 255, 255, 0.2)',
      actionButtonSecondaryBackground: 'rgba(255, 255, 255, 0.1)',
      closeButton: 'rgba(255, 255, 255, 0.7)',
      closeButtonBackground: 'rgba(255, 255, 255, 0.1)',
      connectButtonBackground: '#22c55e',
      connectButtonBackgroundError: '#FF494A',
      connectButtonInnerBackground: 'linear-gradient(0deg, rgba(255, 255, 255, 0.075), rgba(255, 255, 255, 0.15))',
      connectButtonText: '#FFF',
      connectButtonTextError: '#FFF',
      connectionIndicator: '#30E000',
      error: '#FF494A',
      generalBorder: 'rgba(255, 255, 255, 0.1)',
      generalBorderDim: 'rgba(255, 255, 255, 0.05)',
      menuItemBackground: 'rgba(255, 255, 255, 0.1)',
      modalBackdrop: 'rgba(0, 0, 0, 0.5)',
      modalBackground: '#1A1B1F',
      modalBorder: 'rgba(255, 255, 255, 0.1)',
      modalText: '#FFF',
      modalTextDim: 'rgba(255, 255, 255, 0.7)',
      modalTextSecondary: 'rgba(255, 255, 255, 0.6)',
      profileAction: 'rgba(255, 255, 255, 0.1)',
      profileActionHover: 'rgba(255, 255, 255, 0.2)',
      profileForeground: 'rgba(255, 255, 255, 0.05)',
      selectedOptionBorder: 'rgba(255, 255, 255, 0.1)',
      standby: '#FFD641'
    }
  }
});

export function Providers({ children }) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider
        chains={chains}
        theme={customTheme}
        modalSize="compact"
        coolMode
      >
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
