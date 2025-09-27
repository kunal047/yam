import FungibleToken from 0x9a0766d93b6608b7
import FlowToken from 0x7e60df042a9c0868
import YAMListings from 0x1f67c2e66c7e3ee3

transaction(listingId: UInt64) {
    let winners: [Address]
    let winnerVault: &FlowToken.Vault
    let payment: @FungibleToken.Vault
    
    prepare(acct: auth(Storage, Keys, Contracts, Inbox, Capabilities) &Account) {
        // Get winner's Flow token vault
        self.winnerVault = acct.borrow<&FlowToken.Vault>(from: FlowToken.VaultStoragePath)
            ?? panic("Flow token vault not found")
    }
    
    execute {
        // Pick winners for the raffle
        self.winners = YAMListings.pickWinners(listingId: listingId)
        
        // Transfer escrow to winner (assuming caller is the winner)
        let winner = self.winners[0]
        let listing = YAMListings.getListing(id: listingId)
        
        if listing != nil {
            self.payment <- YAMListings.transferToWinner(
                listingId: listingId,
                winner: winner,
                amount: listing!.price
            )
        }
        
        // Deposit payment into winner's vault
        self.winnerVault.deposit(from: <- self.payment)
        
        log("Winners picked for raffle: ".concat(listingId.toString()))
        log("Winner: ".concat(winner.toString()))
    }
}
