import Listings from 0x1f67c2e66c7e3ee3

access(all) fun main(): [Listings.Listing] {
    return Listings.getActiveListings()
}
