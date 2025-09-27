import FungibleToken from 0x9a0766d93b6608b7
import FlowToken from 0x7e60df042a9c0868

access(all) contract YAMListings {
    
    // Admin resource for managing the contract
    access(all) resource Admin {
        access(all) let listings: {UInt64: Listing}
        access(all) let escrows: {UInt64: [Escrow]}
        access(all) var nextListingId: UInt64
        
        init() {
            self.listings = {}
            self.escrows = {}
            self.nextListingId = 1
        }
        
        access(all) fun createListing(
            itemName: String,
            itemDesc: String,
            price: UFix64,
            type: String,
            deadline: UFix64?,
            allowedCountries: [String],
            quantity: UInt64,
            sellerNationality: String,
            seller: Address
        ): UInt64 {
            // Validate inputs
            assert(price > 0.0, message: "Price must be greater than 0")
            assert(quantity > 0, message: "Quantity must be greater than 0")
            assert(allowedCountries.length > 0, message: "At least one country must be allowed")
            
            // For raffles, deadline must be in the future
            if type == "raffle" {
                assert(deadline != nil, message: "Raffle must have a deadline")
                assert(deadline! > getCurrentBlock().timestamp, message: "Deadline must be in the future")
            }

            let listing = Listing(
                id: self.nextListingId,
                seller: seller,
                itemName: itemName,
                itemDesc: itemDesc,
                price: price,
                type: type,
                deadline: deadline,
                allowedCountries: allowedCountries,
                quantity: quantity,
                sellerNationality: sellerNationality
            )

            self.listings[self.nextListingId] = listing
            self.escrows[self.nextListingId] = []

            let listingId = self.nextListingId
            self.nextListingId = self.nextListingId + 1

            emit ListingCreated(id: listingId, seller: seller, itemName: itemName, type: type)
            
            return listingId
        }
    }
    
    // Escrow vault for holding payments
    access(all) resource EscrowVault {
        access(all) let vault: @{FungibleToken.Vault}
        
        init(vault: @{FungibleToken.Vault}) {
            self.vault <- vault
        }
        
    }
    
    // Listing struct to store all listing information
    access(all) struct Listing {
        access(all) let id: UInt64
        access(all) let seller: Address
        access(all) let itemName: String
        access(all) let itemDesc: String
        access(all) let price: UFix64
        access(all) let type: String
        access(all) let deadline: UFix64?
        access(all) var participants: [Address]
        access(all) let allowedCountries: [String]
        access(all) let quantity: UInt64
        access(all) let sellerNationality: String
        access(all) let createdAt: UFix64
        access(self) var isActive: Bool
        
        access(all) fun setActive(active: Bool) {
            self.isActive = active
        }
        
        access(all) fun getActive(): Bool {
            return self.isActive
        }

        init(
            id: UInt64,
            seller: Address,
            itemName: String,
            itemDesc: String,
            price: UFix64,
            type: String,
            deadline: UFix64?,
            allowedCountries: [String],
            quantity: UInt64,
            sellerNationality: String
        ) {
            self.id = id
            self.seller = seller
            self.itemName = itemName
            self.itemDesc = itemDesc
            self.price = price
            self.type = type
            self.deadline = deadline
            self.participants = []
            self.allowedCountries = allowedCountries
            self.quantity = quantity
            self.sellerNationality = sellerNationality
            self.createdAt = getCurrentBlock().timestamp
            self.isActive = true
        }
    }

    // Escrow struct to hold payments
    access(all) struct Escrow {
        access(all) let listingId: UInt64
        access(all) let buyer: Address
        access(all) let amount: UFix64
        access(all) let timestamp: UFix64

        init(listingId: UInt64, buyer: Address, amount: UFix64) {
            self.listingId = listingId
            self.buyer = buyer
            self.amount = amount
            self.timestamp = getCurrentBlock().timestamp
        }
    }

    // Storage for verified sellers and nullifiers
    access(all) let verifiedSellers: {Address: String} // Address -> Nationality
    access(all) let userNullifiers: {String: Address} // Nullifier -> Address (for uniqueness)
    access(all) var admin: @Admin
    access(all) var escrowVault: @EscrowVault?

    // Events
    access(all) event ListingCreated(id: UInt64, seller: Address, itemName: String, type: String)
    access(all) event ListingPurchased(id: UInt64, buyer: Address, amount: UFix64)
    access(all) event RaffleEntered(id: UInt64, participant: Address)
    access(all) event WinnersPicked(id: UInt64, winners: [Address])
    access(all) event SellerVerified(seller: Address, nationality: String)

    init() {
        self.verifiedSellers = {}
        self.userNullifiers = {}
        self.admin <- create Admin()
        
        // Initialize escrow vault as nil for now
        self.escrowVault <- nil
    }

    // Verify seller with Self.xyz nationality and nullifier
    access(all) fun verifySeller(nationality: String, nullifier: String, seller: Address) {
        // Check if nullifier is already used by a different seller
        assert(self.userNullifiers[nullifier] == nil || self.userNullifiers[nullifier] == seller, 
               message: "Nullifier already used by another seller")
        
        // Register the nullifier and seller (only if not already registered)
        if self.userNullifiers[nullifier] == nil {
            self.userNullifiers[nullifier] = seller
        }
        if self.verifiedSellers[seller] == nil {
            self.verifiedSellers[seller] = nationality
        }
        
        emit SellerVerified(seller: seller, nationality: nationality)
    }

    // Check if seller is verified
    access(all) fun isSellerVerified(seller: Address): Bool {
        return self.verifiedSellers[seller] != nil
    }

    // Get admin resource
    access(all) fun getAdmin(): &Admin {
        return &self.admin
    }
    
    // Set admin resource (for deployment) - TODO: Implement properly
    // access(all) fun setAdmin(admin: @Admin) {
    //     let oldAdmin <- self.admin
    //     destroy oldAdmin
    //     self.admin <- admin
    // }

    // Buy a direct purchase listing (requires payment from buyer)
    access(all) fun buyListing(listingId: UInt64, buyerNationality: String, payment: @{FungibleToken.Vault}) {
        let listing = self.admin.listings[listingId]
        assert(listing != nil, message: "Listing does not exist")
        assert(listing!.getActive(), message: "Listing is not active")
        assert(listing!.type == "direct", message: "Listing is not a direct purchase")
        
        // Check country restrictions
        assert(self.isCountryAllowed(nationality: buyerNationality, allowedCountries: listing!.allowedCountries), 
               message: "Buyer country not allowed")
        
        let buyer = self.account.address
        
        // Verify payment amount
        assert(payment.balance >= listing!.price, message: "Insufficient payment amount")
        
        // Transfer payment to escrow vault - TODO: Implement proper escrow
        // For now, just destroy the payment
        destroy payment
        
        let escrow = Escrow(
            listingId: listingId,
            buyer: buyer,
            amount: listing!.price
        )
        
        self.admin.escrows[listingId]!.append(escrow)
        
        // Mark listing as inactive since it's sold
        var updatedListing = self.admin.listings[listingId]!
        updatedListing.setActive(active: false)
        self.admin.listings[listingId] = updatedListing
        
        emit ListingPurchased(id: listingId, buyer: buyer, amount: listing!.price)
    }

    // Enter a raffle (requires payment from buyer)
    access(all) fun enterRaffle(listingId: UInt64, buyerNationality: String, nullifier: String, payment: @{FungibleToken.Vault}) {
        let listing = self.admin.listings[listingId]
        assert(listing != nil, message: "Listing does not exist")
        assert(listing!.getActive(), message: "Listing is not active")
        assert(listing!.type == "raffle", message: "Listing is not a raffle")
        assert(listing!.deadline! > getCurrentBlock().timestamp, message: "Raffle deadline has passed")
        
        // Check country restrictions
        assert(self.isCountryAllowed(nationality: buyerNationality, allowedCountries: listing!.allowedCountries), 
               message: "Buyer country not allowed")
        
        let buyer = self.account.address
        
        // Check if nullifier is already used for this raffle
        assert(self.userNullifiers[nullifier] == nil || self.userNullifiers[nullifier] == buyer, 
               message: "Nullifier already used by another user")
        
        // Check if buyer already entered
        assert(!listing!.participants.contains(buyer), message: "Buyer already entered this raffle")
        
        // Verify payment amount
        assert(payment.balance >= listing!.price, message: "Insufficient payment amount")
        
        // Register nullifier if not already registered
        if self.userNullifiers[nullifier] == nil {
            self.userNullifiers[nullifier] = buyer
        }
        
        // Transfer payment to escrow vault - TODO: Implement proper escrow
        // For now, just destroy the payment
        destroy payment
        
        let escrow = Escrow(
            listingId: listingId,
            buyer: buyer,
            amount: listing!.price
        )
        
        self.admin.escrows[listingId]!.append(escrow)
        
        // Add buyer to participants
        var updatedListing = self.admin.listings[listingId]!
        updatedListing.participants.append(buyer)
        self.admin.listings[listingId] = updatedListing
        
        emit RaffleEntered(id: listingId, participant: buyer)
    }

    // Pick winners for a raffle (only after deadline)
    access(all) fun pickWinners(listingId: UInt64): [Address] {
        let listing = self.admin.listings[listingId]
        assert(listing != nil, message: "Listing does not exist")
        assert(listing!.type == "raffle", message: "Listing is not a raffle")
        assert(listing!.deadline! <= getCurrentBlock().timestamp, message: "Raffle deadline has not passed")
        assert(listing!.getActive(), message: "Raffle already completed")
        
        let participants = listing!.participants
        assert(participants.length > 0, message: "No participants in raffle")
        
        // Better random selection using block height and timestamp
        let blockHeight = getCurrentBlock().height
        let timestamp = getCurrentBlock().timestamp
        let randomSeed = (blockHeight + UInt64(timestamp)) % UInt64(participants.length)
        let winner = participants[Int(randomSeed)]
        
        // Mark listing as inactive
        var updatedListing = self.admin.listings[listingId]!
        updatedListing.setActive(active: false)
        self.admin.listings[listingId] = updatedListing
        
        emit WinnersPicked(id: listingId, winners: [winner])
        
        return [winner]
    }
    
    // Transfer escrow to winner (called after pickWinners)
    access(all) fun transferToWinner(listingId: UInt64, winner: Address, amount: UFix64): @{FungibleToken.Vault} {
        let listing = self.admin.listings[listingId]
        assert(listing != nil, message: "Listing does not exist")
        assert(listing!.type == "raffle", message: "Listing is not a raffle")
        assert(!listing!.getActive(), message: "Raffle must be completed first")
        
        // Verify winner is in participants
        assert(listing!.participants.contains(winner), message: "Winner must be a participant")
        
        // Withdraw from escrow vault
        // TODO: Implement proper escrow withdrawal
        // For now, return nil - this function needs to be implemented properly
        panic("Escrow withdrawal not implemented yet")
    }
    
    // Transfer escrow to seller (for direct purchases)
    access(all) fun transferToSeller(listingId: UInt64, seller: Address, amount: UFix64): @{FungibleToken.Vault} {
        let listing = self.admin.listings[listingId]
        assert(listing != nil, message: "Listing does not exist")
        assert(listing!.seller == seller, message: "Only seller can withdraw")
        assert(!listing!.getActive(), message: "Listing must be completed first")
        
        // Withdraw from escrow vault
        // TODO: Implement proper escrow withdrawal
        // For now, return nil - this function needs to be implemented properly
        panic("Escrow withdrawal not implemented yet")
    }

    // Helper function to check if country is allowed
    access(all) fun isCountryAllowed(nationality: String, allowedCountries: [String]): Bool {
        return allowedCountries.contains(nationality)
    }

    // Get listing by ID
    access(all) fun getListing(id: UInt64): Listing? {
        return self.admin.listings[id]
    }

    // Get all active listings
    access(all) fun getActiveListings(): [Listing] {
        let activeListings: [Listing] = []
        for listing in self.admin.listings.values {
            if listing.getActive() {
                activeListings.append(listing)
            }
        }
        return activeListings
    }

    // Get escrows for a listing
    access(all) fun getEscrows(listingId: UInt64): [Escrow] {
        return self.admin.escrows[listingId] ?? []
    }
}
