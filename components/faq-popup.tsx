"use client"

import { useState } from "react"
import { X, ChevronDown, ChevronRight } from "lucide-react"

interface FaqPopupProps {
  isOpen: boolean
  onClose: () => void
}

export function FaqPopup({ isOpen, onClose }: FaqPopupProps) {
  const [openFaq, setOpenFaq] = useState<string | null>(null)

  const faqItems = [
    {
      id: "reclaimed-sol",
      question: "Where is the reclaimed SOL coming from?",
      answer:
        "Any accounts on Solana require a small storage fee to open them. By burning a token, we can close this account and reclaim the storage fee.",
    },
    {
      id: "how-much",
      question: "How much can I reclaim from burning?",
      answer:
        "Most NFTs will give you 0.01 SOL when you burn. Most tokens will give you 0.002 SOL. Certain NFTs, such as scam tokens, will also only return 0.002 SOL. If the NFT was minted with magic eden's open creator protocol, you can reclaim 0.004 SOL. Finally, compressed NFTs unfortunately cannot reclaim any SOL.",
    },
    {
      id: "cleanup",
      question: 'What does "cleanup" do?',
      answer:
        "Cleanup closes vacant token accounts and unused serum accounts. Any NFT or unique token requires an account to store it. Whenever you list, transfer or dispose of the token or NFT, the account is left empty and can be closed to reclaim a small amount of SOL. Some token swaps or exchanges also require a serum account to store some swap related data. This account can be safely closed once the swap has completed to again reclaim a small amount of SOL. This operation is completely safe to perform. It does not have any effect on the NFTs & tokens in your wallet or limit orders on exchanges. In rare instances some dApps may not create token accounts as needed. This is a bug and should be reported to that dApps' developer.",
    },
    {
      id: "wallet-connect",
      question: "Why can't I see my wallet to connect it?",
      answer:
        "If you are on mobile, you need to open the incinerator inside your wallets browser, instead of via your regular browser.",
    },
    {
      id: "compressed-nft",
      question: "Why can't I reclaim any SOL from a compressed NFT?",
      answer:
        "To make compressed NFTs cheaper to mint, the metadata and token accounts are not stored on chain like normal. Instead, they are indexed off chain. While this makes them cheaper to mint, it also means there are no accounts to close on chain, and reclaim the SOL from.",
    },
    {
      id: "fees",
      question: "Do you charge any fees?",
      answer:
        "Yes, we charge roughly 2-5% fees depending on the exact type of item being burnt. Cleaning up vacant accounts has a 2.3% fee, resizing NFTs has a 5% fee, burning NFTs has a 5% fee, and so on. There are no fees for burning compressed NFTs. These fees helps fund further development of the Incinerator, along with ongoing costs such as RPCs and hosting. Note: this fee is taken from the reclaimed SOL - you will never lose SOL by burning, you can only gain it.",
    },
    {
      id: "lp-burn",
      question: "How can I burn an LP (Liquidity Pool)?",
      answer:
        "LP tokens can be burned just like regular tokens. Select the LP token you want to burn from the Tokens or LP tab, and follow the burning process. Note that burning LP tokens will permanently remove your liquidity from the pool.",
    },
    {
      id: "specific-amount",
      question: "How do I burn a specific amount of tokens?",
      answer:
        "If you want to burn just a specific amount of your tokens, for example, a % of your token supply, we suggest sending this amount to another wallet, and burning there. In future, we will have an easier method to perform this.",
    },
    {
      id: "didnt-get-anything",
      question: "I burned but I don't think I got anything. What's going on?",
      answer:
        "At most you are getting 0.01 SOL per NFT and 0.002 SOL for closing a token account. To reclaim 1 SOL you'd have to burn at least 100 NFTs. The transaction summary when you complete your burn should provide an accurate breakdown of the SOL you reclaimed.",
    },
    {
      id: "token-swap-failed",
      question: "I burned for a token (i.e. $BONK) and didn't get anything/only got SOL. What happened?",
      answer:
        "There are 2 transactions. The first is the burn that reclaims the rent in SOL. The second is a Jupiter swap of that SOL for your token of choice. Occasionally, the Jupiter swap can fail, but you would have received the SOL in your wallet. Go to the transaction on Solscan and look at the Account Inputs tab. This will show a positive change in SOL from the burn.",
    },
    {
      id: "stack-of-tokens",
      question: "I have a stack of tokens. Can I get rich by burning 1 at a time?",
      answer:
        "The SOL you reclaim from burning is achieved by closing the account that stores that token. This amount is the same regardless of whether the account holds 1 or 100,000 tokens. Also, if you try to send 1 token at a time to a new account, this would be futile, as you'd need to pay to instantiate new token accounts, negating any profit you'd make.",
    },
    {
      id: "frozen",
      question: "What does 'frozen' mean?",
      answer:
        "A frozen token cannot be transferred or burned. We indicate a frozen token so there is no confusion when you are unable to select it for burning. Our dev has posted about this issue on Solana's Github in hopes that they make a change, but as of now we are stuck with these frozen tokens.",
    },
    {
      id: "who-made",
      question: "Who made SOLCINERATOR?",
      answer: (
        <span>
          The incinerator was made by the{" "}
          <span className="font-pixel">
            <span className="text-[#00ff00]">Sol</span>
            <span className="text-white">Works</span>
          </span>{" "}
          team.
        </span>
      ),
    },
  ]

  const toggleFaq = (id: string) => {
    setOpenFaq(openFaq === id ? null : id)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div
        className="border-2 border-[#00ff00] w-full max-w-4xl max-h-[90vh] overflow-y-auto relative shadow-[0_0_20px_rgba(0,255,0,0.15)]"
        style={{ backgroundColor: "#151922" }}
      >
        <div className="sticky top-0 bg-[#151922] border-b-2 border-[#00ff00] p-6 flex items-center justify-between">
          <h2 className="text-[#00ff00] text-2xl font-bold">Frequently Asked Questions</h2>
          <button onClick={onClose} className="text-[#00ff00] hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {faqItems.map((item) => (
            <div key={item.id} className="border border-[#2d3748] overflow-hidden">
              <button
                onClick={() => toggleFaq(item.id)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-[#0a0e1a] transition-colors cursor-pointer"
              >
                <span className="text-[#00ff00] font-bold text-lg">{item.question}</span>
                {openFaq === item.id ? (
                  <ChevronDown className="w-5 h-5 text-[#00ff00] flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-[#00ff00] flex-shrink-0" />
                )}
              </button>
              {openFaq === item.id && (
                <div className="px-6 py-4 border-t border-[#2d3748] bg-[#0a0e1a]">
                  <p className="text-[#a0aec0] leading-relaxed">{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
