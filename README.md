# Kift DAO Dissolution Frontend

A Next.js web application for Kiftables NFT holders to register their tokens for the DAO treasury distribution.

## Features

- 🔗 **Web3 Wallet Connection** - Support for MetaMask, WalletConnect, and other popular wallets
- 🎨 **NFT Display** - View all your Kiftables NFTs with metadata
- ✅ **Registration Management** - Select and register NFTs for treasury distribution
- 📊 **Real-time Status** - Track registration period, participants, and ETH rates
- 💰 **Distribution Tracking** - Monitor airdrop status and claim amounts
- 📱 **Responsive Design** - Works on desktop and mobile devices

## Tech Stack

- **Next.js 14** - React framework with App Router
- **wagmi v2** - Ethereum hooks and utilities
- **viem** - TypeScript-first Ethereum library
- **RainbowKit** - Wallet connection UI
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide Icons** - Beautiful icon set

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A WalletConnect Project ID from [WalletConnect Cloud](https://cloud.walletconnect.com)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment variables:
```bash
cp .env.local.example .env.local
```

3. Edit `.env.local` and add your WalletConnect Project ID:
```
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

4. Update contract addresses in `lib/contracts.ts`:
```typescript
// After deploying KiftDissolution contract, update:
dissolution: '0xYOUR_DEPLOYED_CONTRACT_ADDRESS'
```

### Development

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Production

Build for production:
```bash
npm run build
npm run start
```

## Contract Integration

The frontend interacts with two smart contracts:

1. **Kiftables NFT** (`0x228d11Ae974De7f92c16A1F621341759c56D039D`)
   - Read NFT ownership and metadata
   - No write operations

2. **KiftDissolution** (To be deployed)
   - Read registration status and rates
   - Write: Register NFTs for distribution
   - Write: Withdraw ETH (if manual claim needed)

## Configuration

### Network Support

Currently configured for:
- Ethereum Mainnet (production)
- Sepolia Testnet (testing)

To add more networks, edit `lib/wagmi.ts`.

### Styling

The app uses Kift brand colors defined in `tailwind.config.ts`:
- Purple: `#8B5CF6`
- Pink: `#EC4899`
- Blue: `#3B82F6`

## Project Structure

```
KiftDissolution_frontend/
├── app/                    # Next.js app directory
│   ├── api/               # API routes for NFT data
│   ├── page.tsx           # Main page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── WalletConnect.tsx  # Wallet connection
│   ├── RegistrationStatus.tsx # Contract status
│   ├── NFTGrid.tsx        # NFT collection display
│   ├── NFTCard.tsx        # Individual NFT card
│   └── RegisterButton.tsx # Registration action
├── lib/                   # Utilities and config
│   ├── contracts.ts       # Contract ABIs and addresses
│   └── wagmi.ts          # Web3 configuration
└── public/               # Static assets
```

## User Flow

1. **Connect Wallet** - User connects their Ethereum wallet
2. **View NFTs** - Display all owned Kiftables NFTs
3. **Check Status** - Show which NFTs are already registered
4. **Select NFTs** - Choose unregistered NFTs to register
5. **Register** - Submit transaction to register selected NFTs
6. **Wait** - Registration period runs for 30 days
7. **Receive ETH** - Automatic airdrop or manual claim

## Troubleshooting

### NFTs not loading
- Ensure wallet is connected to Ethereum Mainnet
- Check that the wallet owns Kiftables NFTs
- Verify RPC endpoint is working

### Registration failing
- Ensure registration period is active
- Check that NFTs aren't already registered
- Verify wallet has ETH for gas fees

### Contract not found
- Update dissolution contract address after deployment
- Ensure you're on the correct network

## License

MIT