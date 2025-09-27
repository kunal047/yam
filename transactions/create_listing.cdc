import FungibleToken from 0x9a0766d93b6608b7
import FlowToken from 0x7e60df042a9c0868
        import YAMListings from 0x1f67c2e66c7e3ee3

transaction(
    itemName: String,
    itemDesc: String,
    price: UFix64,
    type: String,
    deadline: UFix64?,
    allowedCountries: [String],
    quantity: UInt64,
    sellerNationality: String,
    sellerNullifier: String
) {
    let listingId: UInt64
    
    prepare(acct: AuthAccount) {
        // No special preparation needed
    }
    
    execute {
        // First verify the seller
        YAMListings.verifySeller(
            nationality: sellerNationality,
            nullifier: sellerNullifier,
            seller: acct.address
        )
        
        // Then create the listing using contract's admin resource
        let admin = YAMListings.getAdmin()
        self.listingId = admin.createListing(
            itemName: itemName,
            itemDesc: itemDesc,
            price: price,
            type: type,
            deadline: deadline,
            allowedCountries: allowedCountries,
            quantity: quantity,
            sellerNationality: sellerNationality,
            seller: acct.address
        )
        
        log("Listing created with ID: ".concat(self.listingId.toString()))
    }
}
