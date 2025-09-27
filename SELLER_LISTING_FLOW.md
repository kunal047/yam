# YAM Marketplace - Seller Listing Flow

This document describes the implementation of the seller listing creation flow with Flow smart contracts and country restrictions.

## Overview

The YAM Marketplace now supports a complete seller listing flow that integrates:
- **Self.xyz identity verification** for seller authentication
- **Flow blockchain** for smart contract execution
- **Country restrictions** based on Self.xyz nationality verification
- **Two listing types**: Direct Purchase and Raffle

## Architecture

### 1. Cadence Smart Contract (`contracts/Listings.cdc`)

The `Listings` contract provides:

#### Core Structures
- `Listing`: Stores all listing information including seller, item details, pricing, type, and country restrictions
- `Escrow`: Manages payment escrow for both direct purchases and raffles

#### Key Functions
- `createListing()`: Creates new listings (requires Self.xyz verification)
- `buyListing()`: Handles direct purchases with country validation
- `enterRaffle()`: Manages raffle entries with uniqueness checks
- `pickWinners()`: Randomly selects raffle winners after deadline

#### Country Restrictions
- Sellers must be verified with Self.xyz
- Buyers' countries are validated against `allowedCountries`
- Seller's nationality is automatically included in allowed countries

### 2. Frontend Components

#### `CreateListingForm.tsx`
- Comprehensive form for listing creation
- Real-time validation
- Country selection with seller's nationality pre-selected
- Integration with Self.xyz verification status
- Flow transaction execution

#### Updated `sell/page.tsx`
- Two-step flow: selection → form
- Success/error message handling
- Navigation between options and form

#### Updated `listings/[id]/page.tsx`
- Real Flow transaction integration
- Country validation for purchases
- Self.xyz verification requirements

### 3. Flow Integration (`hooks/useListings.tsx`)

The `useListings` hook provides:
- `createListing()`: Creates new listings with seller verification
- `buyListing()`: Executes direct purchases
- `enterRaffle()`: Handles raffle entries
- `pickWinners()`: Manages winner selection
- `getListing()` / `getActiveListings()`: Query functions

## User Flow

### For Sellers

1. **Identity Verification**
   - Seller must verify identity with Self.xyz
   - Nationality is captured and stored

2. **Listing Creation**
   - Navigate to `/sell`
   - Choose listing type (Direct Purchase or Raffle)
   - Fill out comprehensive form:
     - Item name and description
     - Price and quantity
     - Deadline (for raffles)
     - Allowed countries (seller's nationality pre-selected)

3. **Transaction Execution**
   - Form validates all inputs
   - Flow wallet connection (if not already connected)
   - Smart contract transaction execution
   - Success/error feedback

### For Buyers

1. **Identity Verification**
   - Buyer must verify identity with Self.xyz
   - Nationality is captured for country validation

2. **Purchase/Raffle Entry**
   - Navigate to listing details page
   - Country is validated against listing's allowed countries
   - Flow wallet connection (if not already connected)
   - Transaction execution with escrow

## Key Features

### Country Restrictions
- Sellers can specify which countries can purchase their items
- Seller's nationality is automatically included
- Buyers' countries are validated against allowed list
- Prevents unauthorized purchases based on geography

### Self.xyz Integration
- Primary authentication method
- Captures nationality for country restrictions
- Ensures one verified entry per person for raffles
- Provides trust and legitimacy

### Flow Blockchain
- Smart contract execution for all transactions
- Escrow management for payments
- Automatic winner selection for raffles
- Transparent and decentralized

### User Experience
- Minimal, hackathon-ready design
- Real-time validation and feedback
- Clear success/error messages
- Responsive Tailwind CSS styling

## Technical Implementation

### Form Validation
- Required field validation
- Price > 0 validation
- Future deadline validation for raffles
- Country selection validation

### Error Handling
- Self.xyz verification errors
- Flow wallet connection errors
- Smart contract transaction errors
- User-friendly error messages

### State Management
- React hooks for local state
- Self.xyz context for global authentication
- Flow hooks for blockchain interactions

## Future Enhancements

1. **Advanced Features**
   - Loyalty points system
   - Mystery drops
   - Seller reputation badges

2. **Smart Contract Improvements**
   - More sophisticated random number generation
   - Multi-winner raffles
   - Partial refunds for failed deliveries

3. **UI/UX Enhancements**
   - Real-time listing updates
   - Advanced filtering and search
   - Mobile app integration

## Development Notes

- All Flow transactions are currently using mock/testnet addresses
- Self.xyz integration uses the "yam-marketplace" scope
- Country codes follow ISO 3166-1 alpha-2 standard
- Form validation is client-side with server-side contract validation
- Error handling is comprehensive with user-friendly messages

## Testing

To test the seller listing flow:

1. Verify identity with Self.xyz
2. Connect Flow wallet
3. Navigate to `/sell`
4. Create a test listing
5. Verify the listing appears in the marketplace
6. Test purchase/raffle entry from another account

The implementation is production-ready for hackathon demonstrations and can be extended for full marketplace functionality.
