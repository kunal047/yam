import { config } from "@onflow/fcl";

// Configure specific Flow wallets only (no WalletConnect)
config({
  "accessNode.api": "https://rest-testnet.onflow.org",
  "discovery.wallet.method": "POP/RPC",
  "discovery.wallet": [
    {
      "appId": "Blocto",
      "method": "POP/RPC",
      "endpoint": "https://flow-wallet.blocto.app/api/flow/authn"
    },
    {
      "appId": "Flow Wallet",
      "method": "POP/RPC", 
      "endpoint": "https://flow-wallet.blocto.app/api/flow/authn"
    },
    {
      "appId": "Lilico",
      "method": "POP/RPC",
      "endpoint": "https://flow-wallet.blocto.app/api/flow/authn"
    }
  ],
  "flow.network": "testnet",
  "fcl.limit": 1000,
  "app.detail.title": "YAM - Yet Another Marketplace",
  "app.detail.icon": "https://placehold.co/512x512/purple/orange/png?text=YAM",
  "app.detail.description": "Web3 marketplace with raffles and direct purchases on Flow"
});
