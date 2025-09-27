import Listings from 0x1f67c2e66c7e3ee3

transaction(
    nationality: String,
    nullifier: String
) {
    execute {
        // Verify seller with Self.xyz data
        Listings.verifySeller(
            nationality: nationality,
            nullifier: nullifier
        )
        
        log("Seller verified with nationality: ".concat(nationality))
    }
}
