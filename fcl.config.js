import { config } from "@onflow/fcl";

config({
  "accessNode.api": "https://rest-testnet.onflow.org",
  "discovery.wallet": "https://fcl-discovery.onflow.org/testnet/authn",
  "app.detail.title": "YAM - Yet Another Marketplace",
  "app.detail.icon": "https://placehold.co/512x512/purple/orange/png?text=YAM",
  "app.detail.description": "Web3 marketplace with raffles and direct purchases on Flow",
  // WalletConnect configuration
  "discovery.walletConnect.projectId": process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
});
