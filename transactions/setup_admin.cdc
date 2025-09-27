import FungibleToken from 0x9a0766d93b6608b7
import FlowToken from 0x7e60df042a9c0868

transaction {
    prepare(acct: AuthAccount) {
        log("Setting up Flow token vault...")
        
        // Check if vault already exists
        if acct.getCapability<&{FungibleToken.Receiver}>(/public/flowTokenReceiver).check() {
            log("Flow token vault already exists")
            return
        }
        
        // Set up Flow token vault for payments
        let flowVault <- FlowToken.createEmptyVault(initialProvider: acct)
        acct.save(<- flowVault, to: /storage/flowTokenVault)
        
        // Create public capability for receiving tokens
        acct.link<&{FungibleToken.Receiver}>(
            /public/flowTokenReceiver,
            target: /storage/flowTokenVault
        )
        
        // Create public capability for checking balance
        acct.link<&{FungibleToken.Balance}>(
            /public/flowTokenBalance,
            target: /storage/flowTokenVault
        )
        
        log("Flow token vault set up successfully")
    }
}
