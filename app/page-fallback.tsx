"use client"

import { useState } from "react"
import { WalletButton } from "@/components/wallet-button"
import { useWallet } from "@solana/wallet-adapter-react"

export default function HomeFallback() {
  const { connected } = useWallet()
  const [hasAgreedToDisclaimer, setHasAgreedToDisclaimer] = useState(false)

  if (!hasAgreedToDisclaimer) {
    return (
      <div className="min-h-screen flex flex-col text-white" style={{ backgroundColor: "#0a0e1a" }}>
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.9)" }}
        >
          <div
            className="border-2 border-[#00ff00] p-8 max-w-2xl w-full max-h-[calc(100vh-200px)] overflow-y-auto relative shadow-[0_0_20px_rgba(0,255,0,0.15)]"
            style={{ backgroundColor: "#151922" }}
          >
            <h2 className="text-[#00ff00] text-2xl font-bold mb-6 text-center">SOL INCINERATOR</h2>
            <div className="space-y-4 text-sm leading-relaxed text-[#a0aec0]">
              <p>
                This application allows you to permanently destroy (burn) your Solana tokens and NFTs. This action is
                IRREVERSIBLE and PERMANENT.
              </p>
              <p className="text-[#00ff00]">By using this service, you acknowledge that:</p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li>Burned tokens and NFTs CANNOT be recovered under any circumstances</li>
                <li>You are solely responsible for verifying the correct assets before burning</li>
                <li>The developers are not liable for any losses incurred through use of this service</li>
                <li>This service is provided 'as is' without any warranties</li>
                <li>You should only burn assets you genuinely want to destroy forever</li>
              </ul>
              <p className="text-[#00ff00] font-bold">PROCEED WITH EXTREME CAUTION</p>
            </div>
            <button
              onClick={() => setHasAgreedToDisclaimer(true)}
              className="w-full mt-8 py-3 bg-[#00ff00] text-black font-bold hover:bg-[#00cc00] transition-colors"
            >
              AGREE AND CONTINUE
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col text-white" style={{ backgroundColor: "#0a0e1a" }}>
      {/* Header */}
      <header
        className="border-b p-4 fixed top-0 left-0 right-0 z-50"
        style={{ borderColor: "#2d3748", backgroundColor: "#0a0e1a" }}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-8">
            <div className="flex flex-col">
              <div className="text-[#00ff00] text-xl font-bold tracking-wider">SOLCINERATOR</div>
              <div className="text-xs font-pixel">
                <span className="text-[#00ff00]">A Sol</span>
                <span className="text-white">Works</span>
                <span className="text-[#00ff00]"> project</span>
              </div>
            </div>
            <WalletButton />
          </div>

          <div className="absolute left-1/2 transform -translate-x-1/2 mt-2">
            <img
              src="/solworks-logo.png"
              alt="SOL WORKS"
              className="h-28 w-auto pixelated hover:scale-110 transition-transform duration-200 cursor-pointer"
              style={{ imageRendering: "pixelated" }}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 mt-[73px] mb-[73px]">
        <div className="flex items-center justify-center p-4 min-h-[calc(100vh-146px)]">
          <div
            className="border-2 border-[#00ff00] p-8 max-w-4xl w-full max-h-[calc(100vh-200px)] overflow-y-auto shadow-[0_0_20px_rgba(0,255,0,0.15)]"
            style={{ backgroundColor: "#151922" }}
          >
            <h2 className="text-[#00ff00] text-2xl font-bold mb-6 text-center">SOL INCINERATOR</h2>
            
            {!connected ? (
              <div className="text-center space-y-6">
                <p className="text-[#a0aec0]">
                  Connect your Solana wallet to burn tokens and NFTs, reclaiming SOL from storage fees.
                </p>
                <WalletButton />
                <div className="text-sm text-[#a0aec0]">
                  <p>Features:</p>
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    <li>Burn tokens and NFTs permanently</li>
                    <li>Reclaim SOL from storage fees</li>
                    <li>Clean up vacant token accounts</li>
                    <li>Enhanced PumpFun Creator Hub</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-6">
                <div className="text-[#00ff00] text-xl font-bold">Wallet Connected!</div>
                <p className="text-[#a0aec0]">
                  Enhanced features are loading. If you see this message, there may be a JavaScript error.
                </p>
                <div className="text-sm text-[#a0aec0]">
                  <p>Check the browser console (F12) for any error messages.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="border-t p-4 fixed bottom-0 left-0 right-0 z-50"
        style={{ borderColor: "#2d3748", backgroundColor: "#0a0e1a" }}
      >
        <div className="flex items-center justify-center max-w-7xl mx-auto">
          <div className="text-[#00ff00] text-xs font-pixel">
            v2.0.0 | <span className="text-[#00ff00]">A Sol</span>
            <span className="text-white">Works</span>
            <span className="text-[#00ff00]"> project</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
