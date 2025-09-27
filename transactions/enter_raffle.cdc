import FungibleToken from 0x9a0766d93b6608b7
import FlowToken from 0x7e60df042a9c0868
import Listings from 0x1f67c2e66c7e3ee3

transaction(
    listingId: UInt64,
    buyerNationality: String,
    nullifier: String,
    paymentAmount: UFix64
) {
    let buyerVault: &FlowToken.Vault
    let payment: @FungibleToken.Vault
    
    prepare(acct: AuthAccount) {
        // Get buyer's Flow token vault
        self.buyerVault = acct.borrow<&FlowToken.Vault>(from: FlowToken.VaultStoragePath)
            ?? panic("Flow token vault not found")
        
        // Withdraw payment amount from buyer's vault
        self.payment <- self.buyerVault.withdraw(amount: paymentAmount)
    }
    
    execute {
        // Enter the raffle
        Listings.enterRaffle(
            listingId: listingId,
            buyerNationality: buyerNationality,
            nullifier: nullifier,
            payment: <- self.payment
        )
        
        log("Successfully entered raffle: ".concat(listingId.toString()))
    }
}
