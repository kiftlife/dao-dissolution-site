'use client'

import Image from 'next/image'
import { WalletConnect } from '@/components/WalletConnect'

export function HeroHeader() {
  return (
    <header className="bg-white dark:bg-zinc-900 sticky top-0 z-50 border-b border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center justify-between px-4 py-3 lg:px-16">
        <div className="relative w-36 h-10 lg:w-36 lg:h-10">
          <Image
            src="/logo_full.png"
            alt="Kift"
            fill
            className="object-contain"
            priority
          />
        </div>
        <div className="flex items-center gap-4">
          <WalletConnect />
        </div>
      </div>
    </header>
  )
}