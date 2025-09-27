# 🚀 Quick Deployment Guide

## Step 1: Install Flow CLI

```bash
# macOS
brew install flow-cli

# Linux/Windows
sh -ci "$(curl -fsSL https://raw.githubusercontent.com/onflow/flow-cli/master/install.sh)"

# Verify installation
flow version
```

## Step 2: Create Flow Account

1. Go to [Flow Testnet Faucet](https://testnet-faucet.onflow.org/)
2. Create a new account
3. Save your **Account Address** and **Private Key**

## Step 3: Configure Project

1. **Update `flow.json`** with your account details:
   ```json
   "accounts": {
     "yam-marketplace": {
       "address": "YOUR_ACCOUNT_ADDRESS",
       "key": "YOUR_PRIVATE_KEY"
     }
   }
   ```

## Step 4: Deploy to Testnet

```bash
# Option 1: Using npm script
npm run deploy:testnet

# Option 2: Direct script
./deploy/deploy.sh testnet
```

## Step 5: Test Deployment

```bash
# Test the deployment
npm run test:contract

# Or directly
./deploy/test_deployment.sh testnet
```

## Step 6: Update Frontend

The deployment script automatically updates all contract addresses in your project files. The contract address will be displayed after successful deployment.

## 🔧 Manual Commands

### Deploy to Different Networks

```bash
# Testnet
npm run deploy:testnet

# Mainnet (when ready for production)
npm run deploy:mainnet

# Local Emulator (for development)
npm run deploy:emulator
```

### Manual Testing

```bash
# Get active listings
flow scripts execute ./scripts/get_active_listings.cdc --network testnet

# Get specific listing
flow scripts execute ./scripts/get_listing.cdc \
  --args-json '[{"type": "UInt64", "value": "1"}]' \
  --network testnet

# Check account
flow accounts get YOUR_CONTRACT_ADDRESS --network testnet
```

### Create Test Listing

```bash
# First verify seller
flow transactions send ./transactions/verify_seller.cdc \
  --args-json '[{"type": "String", "value": "IND"}, {"type": "String", "value": "test_nullifier"}]' \
  --network testnet \
  --signer yam-marketplace

# Create listing
flow transactions send ./transactions/create_listing.cdc \
  --args-json '[{"type": "String", "value": "Test Item"}, {"type": "String", "value": "A test item"}, {"type": "UFix64", "value": "10.0"}, {"type": "String", "value": "direct"}, {"type": "Optional", "value": null}, {"type": "Array", "value": [{"type": "String", "value": "IND"}]}, {"type": "UInt64", "value": "1"}, {"type": "String", "value": "IND"}]' \
  --network testnet \
  --signer yam-marketplace
```

## 📋 Post-Deployment Checklist

- [ ] Contract deployed successfully
- [ ] Contract address updated in all files
- [ ] Admin resource set up
- [ ] Test functions work
- [ ] Frontend can interact with contract
- [ ] Self.xyz verification works
- [ ] Direct purchase flow works
- [ ] Raffle flow works

## 🚨 Important Notes

- **Never commit private keys** to version control
- **Test thoroughly** on testnet before mainnet
- **Keep admin resources secure** - they control listing creation
- **Monitor contract interactions** for any issues

## 🆘 Troubleshooting

### Common Issues:

1. **"Account not found"**: Check your account configuration in `flow.json`
2. **"Insufficient Flow"**: Get more FLOW tokens from the faucet
3. **"Contract deployment failed"**: Check contract syntax and dependencies
4. **"Transaction failed"**: Verify account permissions and network status

### Getting Help:

- [Flow Documentation](https://docs.onflow.org/)
- [Flow Discord](https://discord.gg/flow)
- Check the logs for detailed error messages
