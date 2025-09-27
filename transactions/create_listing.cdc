import FungibleToken from 0x9a0766d93b6608b7
import FlowToken from 0x7e60df042a9c0868
import Listings from 0x1f67c2e66c7e3ee3

transaction(
    itemName: String,
    itemDesc: String,
    price: UFix64,
    type: String,
    deadline: UFix64?,
    allowedCountries: [String],
    quantity: UInt64,
    sellerNationality: String
) {
    let admin: &Listings.Admin
    let listingId: UInt64
    
    prepare(acct: AuthAccount) {
        // Get admin resource from account storage
        self.admin = acct.borrow<&Listings.Admin>(from: Listings.AdminStoragePath)
            ?? panic("Admin resource not found")
    }
    
    execute {
        // Create listing using admin resource
        self.listingId = self.admin.createListing(
            itemName: itemName,
            itemDesc: itemDesc,
            price: price,
            type: type,
            deadline: deadline,
            allowedCountries: allowedCountries,
            quantity: quantity,
            sellerNationality: sellerNationality,
            seller: self.admin.account.address
        )
        
        log("Listing created with ID: ".concat(self.listingId.toString()))
    }
}
