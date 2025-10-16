"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronDown } from "lucide-react"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletButton } from "@/components/wallet-button"
import { Sidebar } from "@/components/sidebar"
import { CreatorHubEnhanced } from "@/components/sections/creator-hub-enhanced"
import { Cleanup } from "@/components/sections/cleanup"
import { Tokens } from "@/components/sections/tokens"
import { NFTs } from "@/components/sections/nfts"
import { CNFTs } from "@/components/sections/cnfts"
import { Domains } from "@/components/sections/domains"
import { LP } from "@/components/sections/lp"
import { Unknown } from "@/components/sections/unknown"
import { FaqPopup } from "@/components/faq-popup"
import { LiveStats } from "@/components/live-stats"
import { BurnFeed } from "@/components/burn-feed"

export default function Home() {
  const [hasAgreedToDisclaimer, setHasAgreedToDisclaimer] = useState(false)
  const [showFaq, setShowFaq] = useState(false)
  const [activeSection, setActiveSection] = useState("creator-hub")
  const { connected } = useWallet()
  const [isLoadingWallet, setIsLoadingWallet] = useState(false)
  const [isLoadingSection, setIsLoadingSection] = useState(false)
  const [loadedSections, setLoadedSections] = useState<Set<string>>(new Set(["creator-hub"]))
  const [openFaqItems, setOpenFaqItems] = useState<Set<number>>(new Set())
  const sectionTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (connected) {
      setIsLoadingWallet(true)
      const timer = setTimeout(() => {
        setIsLoadingWallet(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [connected])

  useEffect(() => {
    return () => {
      if (sectionTimeoutRef.current) {
        clearTimeout(sectionTimeoutRef.current)
      }
    }
  }, [])

  const handleSectionChange = (section: string) => {
    if (sectionTimeoutRef.current) {
      clearTimeout(sectionTimeoutRef.current)
      sectionTimeoutRef.current = null
    }

    if (section === "creator-hub" || loadedSections.has(section)) {
      setIsLoadingSection(false)
      setActiveSection(section)
    } else {
      setIsLoadingSection(true)
      sectionTimeoutRef.current = setTimeout(() => {
        setActiveSection(section)
        setLoadedSections((prev) => new Set(prev).add(section))
        setIsLoadingSection(false)
        sectionTimeoutRef.current = null
      }, 1000)
    }
  }

  const toggleFaqItem = (index: number) => {
    setOpenFaqItems((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }

  const faqItems = [
    {
      question: "Where is the reclaimed SOL coming from?",
      answer:
        "Any accounts on Solana require a small storage fee to open them. By burning a token, we can close this account and reclaim the storage fee.",
    },
    {
      question: "How much can I reclaim from burning?",
      answer:
        "Most NFTs will give you 0.01 SOL when you burn. Most tokens will give you 0.002 SOL. Certain NFTs, such as scam tokens, will also only return 0.002 SOL. If the NFT was minted with magic eden's open creator protocol, you can reclaim 0.004 SOL. Finally, compressed NFTs unfortunately cannot reclaim any SOL.",
    },
    {
      question: "What does 'cleanup' do?",
      answer:
        "Cleanup closes vacant token accounts and unused serum accounts. Any NFT or unique token requires an account to store it. Whenever you list, transfer or dispose of the token or NFT, the account is left empty and can be closed to reclaim a small amount of SOL. Some token swaps or exchanges also require a serum account to store some swap related data. This account can be safely closed once the swap has completed to again reclaim a small amount of SOL. This operation is completely safe to perform. It does not have any effect on the NFTs & tokens in your wallet or limit orders on exchanges. In rare instances some dApps may not create token accounts as needed. This is a bug and should be reported to that dApps' developer.",
    },
    {
      question: "Do you charge any fees?",
      answer:
        "Yes, we charge roughly 2-5% fees depending on the exact type of item being burnt. Cleaning up vacant accounts has a 2.3% fee, resizing NFTs has a 5% fee, burning NFTs has a 5% fee, and so on. There are no fees for burning compressed NFTs. These fees helps fund further development of the Incinerator, along with ongoing costs such as RPCs and hosting. Note: this fee is taken from the reclaimed SOL - you will never lose SOL by burning, you can only gain it.",
    },
    {
      question: "How can I burn an LP (Liquidity Pool)?",
      answer: "The LP tab allows you to burn liquidity pool tokens and reclaim the underlying assets.",
    },
    {
      question: "How do I burn a specific amount of tokens?",
      answer:
        "If you want to burn just a specific amount of your tokens, for example, a % of your token supply, we suggest sending this amount to another wallet, and burning there. In future, we will have an easier method to perform this.",
    },
    {
      question: "I burned but I don't think I got anything. What's going on?",
      answer:
        "At most you are getting 0.01 SOL per NFT and 0.002 SOL for closing a token account. To reclaim 1 SOL you'd have to burn at least 100 NFTs. The transaction summary when you complete your burn should provide an accurate breakdown of the SOL you reclaimed.",
    },
    {
      question: "I burned for a token (i.e. $BONK) and didn't get anything/only got SOL. What happened?",
      answer:
        "There are 2 transactions. The first is the burn that reclaims the rent in SOL. The second is a Jupiter swap of that SOL for your token of choice. Occasionally, the Jupiter swap can fail, but you would have received the SOL in your wallet. Go to the transaction on Solscan and look at the Account Inputs tab. This will show a positive change in SOL from the burn.",
    },
    {
      question: "I have a stack of tokens. Can I get rich by burning 1 at a time?",
      answer:
        "The SOL you reclaim from burning is achieved by closing the account that stores that token. This amount is the same regardless of whether the account holds 1 or 100,000 tokens. Also, if you try to send 1 token at a time to a new account, this would be futile, as you'd need to pay to instantiate new token accounts, negating any profit you'd make.",
    },
    {
      question: "What does 'frozen' mean?",
      answer:
        "A frozen token cannot be transferred or burned. We indicate a frozen token so there is no confusion when you are unable to select it for burning. Our dev has posted about this issue on Solana's Github in hopes that they make a change, but as of now we are stuck with these frozen tokens.",
    },
  ]

  const renderSection = () => {
    switch (activeSection) {
      case "creator-hub":
        return <CreatorHubEnhanced />
      case "cleanup":
        return <Cleanup />
      case "tokens":
        return <Tokens />
      case "nfts":
        return <NFTs />
      case "cnfts":
        return <CNFTs />
      case "domains":
        return <Domains />
      case "lp":
        return <LP />
      case "unknown":
        return <Unknown />
      default:
        return <CreatorHubEnhanced />
    }
  }

  return (
    <div className="min-h-screen flex flex-col text-white" style={{ backgroundColor: "#0a0e1a" }}>
      <FaqPopup isOpen={showFaq} onClose={() => setShowFaq(false)} />

      {!hasAgreedToDisclaimer && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.9)" }}
        >
          <div
            className="border-2 border-[#00ff00] p-8 max-w-2xl w-full max-h-[calc(100vh-200px)] overflow-y-auto relative shadow-[0_0_20px_rgba(0,255,0,0.15)]"
            style={{ backgroundColor: "#151922" }}
          >
            <h2 className="text-[#00ff00] text-2xl font-bold mb-6 text-center">DISCLAIMER</h2>

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
                <li>
                  The Creator Hub collects fees from pump.fun tokens. Ensure you understand how pump.fun creator fees
                  work before using this feature
                </li>
              </ul>

              <p className="text-[#00ff00] font-bold">PROCEED WITH EXTREME CAUTION</p>

              <p className="text-xs text-[#718096] mt-6">
                This is an experimental tool. Use at your own risk. Always double-check before confirming any burn
                transaction.
              </p>
            </div>

            <button
              onClick={() => setHasAgreedToDisclaimer(true)}
              className="w-full mt-8 py-3 bg-[#00ff00] text-black font-bold hover:bg-[#00cc00] transition-colors"
            >
              AGREE AND CLOSE
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header
        className="border-b p-4 fixed top-0 left-0 right-0 z-50"
        style={{ borderColor: "#2d3748", backgroundColor: "#0a0e1a" }}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Left - Logo and Connect Wallet */}
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

          {/* Center - SOL WORKS Logo */}
          <div className="absolute left-1/2 transform -translate-x-1/2 mt-2">
            <img
              src="/solworks-logo.png"
              alt="SOL WORKS"
              className="h-28 w-auto pixelated hover:scale-110 transition-transform duration-200 cursor-pointer"
              style={{ imageRendering: "pixelated" }}
            />
          </div>

          <div className="flex items-center gap-4">
            <LiveStats />
            <BurnFeed />
            <a
              href="/docs"
              className="w-8 h-8 border border-[#2d3748] flex items-center justify-center hover:bg-[#00ff00] hover:text-black transition-colors text-[#a0aec0] hover:border-[#00ff00] cursor-pointer"
              title="Documentation"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </a>
            <button className="w-8 h-8 border border-[#2d3748] flex items-center justify-center hover:bg-[#00ff00] hover:text-black transition-colors text-[#a0aec0] hover:border-[#00ff00] cursor-pointer">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </button>
            {connected && (
              <button
                onClick={() => handleSectionChange("creator-hub")}
                className="w-8 h-8 border border-[#2d3748] flex items-center justify-center hover:bg-[#00ff00] hover:text-black transition-colors text-[#a0aec0] hover:border-[#00ff00] cursor-pointer"
                title="Creator Hub"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </header>

      {connected && !isLoadingWallet && <Sidebar activeSection={activeSection} onSectionChange={handleSectionChange} />}

      {/* Main Content */}
      <main className={`flex-1 ${connected && !isLoadingWallet ? "ml-64" : ""} mt-[73px] mb-[73px]`}>
        {!connected ? (
          <div className="flex items-center justify-center p-4 min-h-[calc(100vh-146px)]">
            <div
              className="border-2 border-[#00ff00] p-8 max-w-4xl w-full max-h-[calc(100vh-200px)] overflow-y-auto shadow-[0_0_20px_rgba(0,255,0,0.15)]"
              style={{ backgroundColor: "#151922" }}
            >
              <h2 className="text-[#00ff00] text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>

              <div className="space-y-3">
                {faqItems.map((item, index) => (
                  <div key={index} className="border border-[#2d3748]" style={{ backgroundColor: "#0a0e1a" }}>
                    <button
                      onClick={() => toggleFaqItem(index)}
                      className="w-full p-4 flex items-center justify-between text-left hover:bg-[#151922] transition-colors"
                    >
                      <span className="text-[#00ff00] font-bold text-sm">{item.question}</span>
                      <ChevronDown
                        className={`w-5 h-5 text-[#00ff00] transition-transform ${
                          openFaqItems.has(index) ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {openFaqItems.has(index) && (
                      <div className="p-4 pt-0 text-[#a0aec0] text-sm leading-relaxed border-t border-[#2d3748]">
                        {item.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-8 text-center">
                <p className="text-[#a0aec0] text-sm mb-4">Ready to get started?</p>
                <WalletButton />
              </div>
            </div>
          </div>
        ) : isLoadingWallet ? (
          <div className="flex items-center justify-center p-4 min-h-[calc(100vh-146px)]">
            <div className="text-center space-y-4">
              <div className="text-[#00ff00] text-2xl font-bold animate-pulse">Processing items...</div>
              <div className="flex justify-center gap-2">
                <div className="w-3 h-3 bg-[#00ff00] animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="w-3 h-3 bg-[#00ff00] animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="w-3 h-3 bg-[#00ff00] animate-bounce" style={{ animationDelay: "300ms" }}></div>
              </div>
            </div>
          </div>
        ) : isLoadingSection ? (
          <div className="flex items-center justify-center p-4 min-h-[calc(100vh-146px)]">
            <div className="text-center space-y-4">
              <div className="text-[#00ff00] text-2xl font-bold animate-pulse">Processing items...</div>
              <div className="flex justify-center gap-2">
                <div className="w-3 h-3 bg-[#00ff00] animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="w-3 h-3 bg-[#00ff00] animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="w-3 h-3 bg-[#00ff00] animate-bounce" style={{ animationDelay: "300ms" }}></div>
              </div>
            </div>
          </div>
        ) : (
          renderSection()
        )}
      </main>

      {/* Footer Controls */}
      <footer
        className="border-t p-4 fixed bottom-0 left-0 right-0 z-50"
        style={{ borderColor: "#2d3748", backgroundColor: "#0a0e1a" }}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFaq(true)}
              className="w-10 h-10 border flex items-center justify-center text-[#00ff00] hover:bg-[#00ff00] hover:text-black transition-colors cursor-pointer"
              style={{ borderColor: "#2d3748" }}
              title="FAQ"
            >
              ?
            </button>

            <a
              href="/docs"
              className="w-10 h-10 border flex items-center justify-center text-[#00ff00] hover:bg-[#00ff00] hover:text-black transition-colors cursor-pointer"
              style={{ borderColor: "#2d3748" }}
              title="Documentation"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c.426 1.756 2.924 1.756 0 3.35a1.724 1.724 0 00-2.573 1.066c-1.543.94-3.31-.826-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37 2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </a>
          </div>

          {/* Center - Live Stats */}
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
