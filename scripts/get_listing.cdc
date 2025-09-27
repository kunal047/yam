import YAMListings from 0x1f67c2e66c7e3ee3

access(all) fun main(listingId: UInt64): Listings.Listing? {
    return YAMListings.getListing(id: listingId)
}
