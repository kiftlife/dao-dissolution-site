'use client'

import { HeroHeader } from '@/components/HeroHeader'
import { HeroSection } from '@/components/HeroSection'
import { RegistrationStatus } from '@/components/RegistrationStatus'
import { NFTGrid } from '@/components/NFTGrid'
import { WalletConnect } from '@/components/WalletConnect'
import { useAccount } from 'wagmi'

export default function Home() {
  const { isConnected } = useAccount()

  return (
    <div className="min-h-screen bg-background">
      <HeroHeader />
      <HeroSection />

      {/* Status Section */}
      <section className="py-12 px-4 bg-zinc-50 dark:bg-zinc-800/50">
        <div className="container mx-auto max-w-6xl">
          <RegistrationStatus />
        </div>
      </section>

      {/* Main Content */}
      <section id="nft-section" className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          {isConnected ? (
            <>
              <h2 className="text-2xl font-bold text-foreground mb-6">Your Kiftables NFTs</h2>
              <NFTGrid />
            </>
          ) : (
            <div className="bg-card rounded-xl p-12 text-center border border-border shadow-sm">
              <h2 className="text-3xl font-bold text-foreground mb-4">Connect Your Wallet</h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                Connect your wallet to view your Kiftables NFTs and register them before the deadline.
              </p>
              <div className="inline-block">
                <WalletConnect />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Info Section */}
      <section id="how-it-works" className="py-12 px-4 border-t border-border">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-2xl font-bold text-foreground mb-8 text-center">How It Works</h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
              <div className="text-4xl mb-4">1️⃣</div>
              <h3 className="text-xl font-bold text-foreground mb-2">Register NFTs</h3>
              <p className="text-muted-foreground">
                During the 30-day registration period, select and register your Kiftables NFTs.
                Your NFTs remain in your wallet.
              </p>
            </div>

            <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
              <div className="text-4xl mb-4">2️⃣</div>
              <h3 className="text-xl font-bold text-foreground mb-2">Registration Closes</h3>
              <p className="text-muted-foreground">
                After the 30-day registration period ends, no more NFTs can be registered.
              </p>
            </div>

            <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
              <div className="text-4xl mb-4">3️⃣</div>
              <h3 className="text-xl font-bold text-foreground mb-2">Keep Your NFTs</h3>
              <p className="text-muted-foreground">
                Your NFTs remain in your wallet permanently as collectibles.
              </p>
            </div>
          </div>

          <div className="mt-8 p-6 bg-secondary/50 border border-border rounded-xl">
            <h3 className="text-lg font-bold text-foreground mb-2">Important Notes</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Your NFTs remain in your wallet as collectibles</li>
              <li>• Each NFT can only be registered once</li>
              <li>• You can register NFTs in multiple transactions</li>
              <li>• Registration deadline is 30 days from start</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Security Footer */}
      <footer className="border-t-2 border-primary bg-secondary/20 py-6 px-4 mt-12">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center">
            <h3 className="text-lg font-bold text-primary mb-3">⚠️ Security Notice</h3>
            <p className="text-foreground mb-4">
              This is the official Kift NFT dissolution site. Always verify you're on the authentic site to protect against scams.
            </p>
            <div className="bg-card border-2 border-primary rounded-lg p-4 mb-4">
              <p className="text-sm font-medium text-primary mb-2">Official Dissolution Contract Address:</p>
              <code className="text-xs bg-muted px-3 py-2 rounded text-muted-foreground font-mono break-all">
                0x7320febE7F5130aa37EBd185C65202b54d13e1D8
              </code>
            </div>
            <p className="text-sm text-muted-foreground">
              ✓ Verify this address matches official announcements from trusted Kift Members<br/>
              ✓ Never connect your wallet to sites from DMs or emails<br/>
              ✓ Always check the URL and contract address before connecting
            </p>
          </div>
        </div>
      </footer>

    </div>
  )
}