// This is a development-only configuration
// In production, use environment variables from your deployment platform

export const config = {
  // Get a projectId from https://cloud.walletconnect.com/
  walletConnectProjectId: '4b6c6e1cc1c748c180a99a9b4e7f6be4',
  
  // Get an API key from https://www.alchemy.com/
  alchemyApiKey: 'f38cc9e8dab5eea55dfedc91042ba694',
  
  // Contract addresses on arbitrumSepolia
  contractAddresses: {
    projectListing: '0x01D0CfEb9ecDc082839503Ae92BE26E16cA1d1dd',
    dao: '0x7599D04ABad613d2D4A853d60066bb34F19013c9',
    donate: '0x1c7E794B14d51DbB80D7b73c25EFcf60DcEF1aF9'
  },

  // Contract parameters
  subscriptionFee: '0.01',  // in ETH
  minStakeAmount: '0.01'    // in ETH
};
