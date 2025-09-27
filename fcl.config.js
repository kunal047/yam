import { config } from "@onflow/fcl";

const walletConnectProjectId = "53a71b91ff7c8338ff251b22d3b5bfbf";

config({
  "accessNode.api": "https://rest-testnet.onflow.org",
  "discovery.wallet": "https://fcl-discovery.onflow.org/testnet/authn",
  "discovery.walletConnect.projectId": walletConnectProjectId,
  "flow.network": "testnet", // Required for WalletConnect WC/RPC service strategy
  "fcl.limit": 1000, // Set global compute limit to override default limit of 10
  "app.detail.title": "YAM - Yet Another Marketplace",
  "app.detail.icon": "https://placehold.co/512x512/purple/orange/png?text=YAM",
  "app.detail.description": "Web3 marketplace with raffles and direct purchases on Flow"
});
