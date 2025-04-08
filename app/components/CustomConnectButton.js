'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';

export function CustomConnectButton() {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === 'authenticated');

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className="inline-flex items-center rounded-lg bg-green-500 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-green-600 focus:outline-none focus:ring-4 focus:ring-green-300 dark:hover:bg-green-600 dark:focus:ring-green-800"
                  >
                    Connect Wallet
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="inline-flex items-center rounded-lg bg-red-500 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-red-600 focus:outline-none focus:ring-4 focus:ring-red-300"
                  >
                    Wrong network
                  </button>
                );
              }

              return (
                <div className="flex items-center gap-3">
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="inline-flex items-center rounded-lg bg-green-100 px-4 py-2 text-center text-sm font-medium text-green-800 hover:bg-green-200 focus:outline-none focus:ring-4 focus:ring-green-300 dark:bg-green-800 dark:text-green-100 dark:hover:bg-green-700"
                  >
                    {chain.hasIcon && (
                      <div className="mr-2 h-4 w-4">
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? 'Chain icon'}
                            src={chain.iconUrl}
                            className="h-4 w-4"
                          />
                        )}
                      </div>
                    )}
                    {chain.name}
                  </button>

                  <button
                    onClick={openAccountModal}
                    type="button"
                    className="inline-flex items-center rounded-lg bg-green-500 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-green-600 focus:outline-none focus:ring-4 focus:ring-green-300 dark:hover:bg-green-600 dark:focus:ring-green-800"
                  >
                    {account.displayName}
                    {account.displayBalance
                      ? ` (${account.displayBalance})`
                      : ''}
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
