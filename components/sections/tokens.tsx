"use client"

import { Coins } from "lucide-react"

export function Tokens() {
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <Coins className="w-8 h-8 text-[#00ff00]" />
        <h1 className="text-3xl font-bold text-[#00ff00]">TOKENS</h1>
      </div>

      <div
        className="border p-6 shadow-[0_0_20px_rgba(255,255,255,0.08)]"
        style={{ borderColor: "#2d3748", backgroundColor: "#151922" }}
      >
        <h2 className="text-xl font-bold text-white mb-4">Your SPL Tokens</h2>
        <div className="text-center py-12 text-[#a0aec0]">
          <p>Loading tokens...</p>
        </div>
      </div>
    </div>
  )
}
