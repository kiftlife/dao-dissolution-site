'use client'

import Image from 'next/image'
import { useAccount } from 'wagmi'
import { Button } from '@/components/ui/button'

export function HeroSection() {
  const { isConnected } = useAccount()

  const scrollToNFTSection = () => {
    const nftSection = document.getElementById('nft-section')
    if (nftSection) {
      nftSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const scrollToHowItWorks = () => {
    const howItWorksSection = document.getElementById('how-it-works')
    if (howItWorksSection) {
      howItWorksSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section className="relative bg-white dark:bg-zinc-900 py-16 lg:py-24">
      <div className="container mx-auto px-4 lg:px-16">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="order-2 lg:order-1">
            <h1 className="text-4xl lg:text-6xl font-bold text-zinc-900 dark:text-white mb-6">
              Kiftables
              <br />
              <span className="text-zinc-600 dark:text-zinc-300">Registration</span>
            </h1>
            <p className="text-lg lg:text-xl text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed">
              Register your Kiftables NFTs before the deadline.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              {isConnected ? (
                <Button
                  size="lg"
                  onClick={scrollToNFTSection}
                  className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
                >
                  Register Your NFTs
                </Button>
              ) : (
                <Button
                  size="lg"
                  onClick={scrollToNFTSection}
                  className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
                >
                  Get Started
                </Button>
              )}
              <Button
                variant="outline"
                size="lg"
                onClick={scrollToHowItWorks}
                className="border-zinc-300 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Learn More
              </Button>
            </div>
          </div>

          <div className="order-1 lg:order-2 relative">
            <div className="relative w-full h-96 lg:h-[500px]">
              <Image
                src="/header_image_vans.png"
                alt="Kift DAO Dissolution - NFT Collection"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}