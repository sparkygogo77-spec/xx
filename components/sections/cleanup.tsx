"use client"

import { useState } from "react"
import { Flame, AlertTriangle, ChevronDown } from "lucide-react"

export function Cleanup() {
  const [isLoading, setIsLoading] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [openFaq, setOpenFaq] = useState<string | null>(null)

  const handleLoadAssets = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setHasLoaded(true)
    }, 2000)
  }

  const toggleFaq = (id: string) => {
    setOpenFaq(openFaq === id ? null : id)
  }

  const faqItems = [
    {
      id: "missing-assets",
      question: "Can't find a token you're looking for?",
      answer:
        "It may be in the 'Unknown' tab accessed by enabling pro mode on the bottom left. This happens when we can't fetch the metadata for the token and hide it to prevent accidental burns.",
    },
    {
      id: "where-assets",
      question: "Where are my assets?",
      answer:
        "Make sure you have the correct wallet selected. Some assets may appear in different tabs (Tokens, NFTs, cNFTs, Domains, LP, or Unknown). If you still can't find them, they may be in the Unknown tab which requires pro mode to access.",
    },
  ]

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <Flame className="w-8 h-8 text-[#00ff00]" />
        <h1 className="text-3xl font-bold text-[#00ff00]">CLEANUP</h1>
      </div>

      <div
        className="border border-[#00ff00] p-6 mb-6 shadow-[0_0_20px_rgba(0,255,0,0.15)]"
        style={{ backgroundColor: "#151922" }}
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-[#00ff00] flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-bold text-[#00ff00] mb-2">Bulk Burn Warning</h3>
            <p className="text-sm text-[#a0aec0]">
              This feature allows you to burn multiple assets at once. This action is IRREVERSIBLE. Please review your
              selection carefully before proceeding.
            </p>
          </div>
        </div>
      </div>

      <div
        className="border p-6 shadow-[0_0_20px_rgba(255,255,255,0.08)]"
        style={{ borderColor: "#2d3748", backgroundColor: "#151922" }}
      >
        <h2 className="text-xl font-bold text-white mb-4">Select Assets to Burn</h2>
        <div className="space-y-4">
          {!hasLoaded ? (
            <>
              <button
                onClick={handleLoadAssets}
                disabled={isLoading}
                className="w-full py-3 border border-[#2d3748] text-[#a0aec0] hover:border-[#00ff00] hover:text-[#00ff00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Loading Assets..." : "Load Wallet Assets"}
              </button>

              {isLoading && (
                <div className="space-y-4 animate-pulse">
                  <div className="h-4 bg-[#2d3748] rounded w-3/4"></div>
                  <div className="h-4 bg-[#2d3748] rounded w-1/2"></div>
                  <div className="h-4 bg-[#2d3748] rounded w-5/6"></div>
                  <div className="flex justify-center gap-2 py-8">
                    <div className="w-3 h-3 bg-[#00ff00] animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-3 h-3 bg-[#00ff00] animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-3 h-3 bg-[#00ff00] animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              )}

              {!isLoading && (
                <div className="text-center py-12 text-[#a0aec0]">
                  <p>Connect your wallet and load assets to begin cleanup</p>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="space-y-4">
                <div className="text-center py-8 text-[#a0aec0]">
                  <p className="text-lg mb-2">All clean!</p>
                  <p className="text-sm">No assets found that need cleanup.</p>
                </div>

                <div className="border-t border-[#2d3748] pt-6 mt-6">
                  <h3 className="text-lg font-bold text-white mb-4">Common Questions</h3>
                  <div className="space-y-3">
                    {faqItems.map((item) => (
                      <div key={item.id} className="border border-[#2d3748] bg-[#0a0e1a]">
                        <button
                          onClick={() => toggleFaq(item.id)}
                          className="w-full p-4 flex items-center justify-between text-left hover:bg-[#151922] transition-colors"
                        >
                          <span className="text-[#00ff00] font-bold text-sm">{item.question}</span>
                          <ChevronDown
                            className={`w-5 h-5 text-[#00ff00] transition-transform ${
                              openFaq === item.id ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        {openFaq === item.id && (
                          <div className="p-4 pt-0 text-[#a0aec0] text-sm leading-relaxed border-t border-[#2d3748]">
                            {item.answer}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
