import YAMListings from 0x1f67c2e66c7e3ee3

access(all) fun main(listingId: UInt64): [YAMListings.Escrow] {
    return YAMListings.getEscrows(listingId: listingId)
}
