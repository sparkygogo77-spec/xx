"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Search, ChevronDown, ChevronRight, Menu, X } from "lucide-react"

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("home")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [openFaq, setOpenFaq] = useState<string | null>(null)

  const sections = [
    { id: "home", label: "🔥 Burn Tokens. Reclaim SOL." },
    { id: "why", label: "Why SOLCINERATOR?" },
    { id: "swapping", label: "Seamless Token Swapping" },
    { id: "cleanup", label: "Cleanup", category: "TOOL GUIDE" },
    { id: "tokens", label: "Tokens", category: "TOOL GUIDE" },
    { id: "nfts", label: "NFTs", category: "TOOL GUIDE" },
    { id: "cnfts", label: "cNFTs", category: "TOOL GUIDE" },
    { id: "domains", label: "Domains", category: "TOOL GUIDE" },
    { id: "lp", label: "LP", category: "TOOL GUIDE" },
    { id: "unknown", label: "Unknown Tab", category: "TOOL GUIDE" },
    { id: "pumpfun", label: "Pump.fun Creator Fees", category: "INTEGRATIONS" },
    { id: "faq", label: "FAQ" },
    { id: "api", label: "API Documentation", category: "API" },
  ]

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
      id: "didn't-get-anything",
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
      answer:
        "The incinerator was made by the SolWorks team. You can find more info by visiting our Discord or Twitter in the links above!",
    },
  ]

  const toggleFaq = (id: string) => {
    setOpenFaq(openFaq === id ? null : id)
  }

  const renderContent = () => {
    switch (activeSection) {
      case "home":
        return (
          <div className="space-y-8">
            <div className="bg-[#0a0e1a] border border-[#00ff00]/20 rounded-lg p-8 flex items-center justify-center shadow-[0_0_20px_rgba(0,255,0,0.15)]">
              <div className="text-center">
                <div className="text-6xl font-bold mb-2" style={{ color: "#00ff00", fontFamily: "monospace" }}>
                  SOLCINERATOR
                </div>
                <div className="text-sm font-pixel">
                  <span className="text-[#00ff00]">A Sol</span>
                  <span className="text-white">Works</span>
                  <span className="text-gray-400"> project</span>
                </div>
              </div>
            </div>

            <div>
              <h1 className="text-4xl font-bold text-white mb-4 flex items-center gap-2">
                <span>🔥</span> Burn Tokens. Reclaim SOL.
              </h1>
              <p className="text-lg text-gray-300 leading-relaxed">
                Reclaim lost SOL by closing empty token accounts and burning spam tokens, NFTs, and abandoned assets —
                all directly on Solana.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white">Why SOLCINERATOR?</h2>
              <p className="text-gray-300 leading-relaxed">
                SOLCINERATOR is Solana's original wallet cleanup tool. Since 2021, SOLCINERATOR has processed millions
                of wallets, recovering millions in SOL by clearing rent fees (Solana's storage costs) locked in unwanted
                or forgotten on-chain assets, including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-300 pl-4">
                <li>SPL token accounts</li>
                <li>LP tokens</li>
                <li>Solana Name Service (SNS) domains</li>
                <li>Compressed NFTs (cNFTs) — burned for a clutter-free wallet, even though they don't carry rent</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white">Seamless Token Swapping</h2>
              <p className="text-gray-300 leading-relaxed">
                With built-in <span className="font-bold">Jupiter DEX integration</span>, instantly swap reclaimed SOL
                for USDC, USDT, JUP, BONK, or any token in one seamless, in-app flow.
              </p>
            </div>

            <div className="bg-[#0a0e1a] border border-[#00ff00]/30 rounded-lg p-6 shadow-[0_0_20px_rgba(0,255,0,0.15)]">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <span>❓</span> Ready to Reclaim Your SOL
              </h2>
              <Link
                href="/"
                className="inline-block bg-[#00ff00] text-black px-6 py-3 rounded font-bold hover:bg-[#00cc00] transition-colors cursor-pointer"
              >
                👉 Launch SOLCINERATOR ›
              </Link>
            </div>
          </div>
        )

      case "pumpfun":
        return (
          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-white mb-4">Pump.fun Creator Fees</h1>
            <p className="text-gray-300 leading-relaxed">
              Understanding how Pump.fun creator fees work and how they integrate with SOLCINERATOR.
            </p>

            <div className="bg-[#0a0e1a] border border-[#1e3a5f] p-6 rounded-lg">
              <h2 className="text-2xl font-bold text-white mb-4">What is Pump.fun?</h2>
              <p className="text-gray-300 leading-relaxed">
                Pump.fun is a popular token launchpad on Solana that allows anyone to create and launch meme coins with
                minimal friction. When creators launch tokens on Pump.fun, they can earn creator fees from trading
                activity.
              </p>
            </div>

            <div className="bg-[#0a0e1a] border border-[#1e3a5f] p-6 rounded-lg">
              <h2 className="text-2xl font-bold text-white mb-4">How Creator Fees Work</h2>
              <div className="space-y-4 text-gray-300">
                <p>
                  <span className="font-bold text-white">Creator Fee Structure:</span> When you create a token on
                  Pump.fun, you automatically earn a percentage of all trading fees generated by your token. This
                  typically ranges from 0.5% to 1% of each trade.
                </p>
                <p>
                  <span className="font-bold text-white">Automatic Collection:</span> Creator fees accumulate in your
                  wallet automatically as trades occur. You don't need to manually claim them - they're sent directly to
                  your creator wallet address.
                </p>
                <p>
                  <span className="font-bold text-white">Lifetime Earnings:</span> As long as your token continues to
                  trade on Pump.fun, you'll continue earning creator fees. This creates a passive income stream for
                  successful token creators.
                </p>
              </div>
            </div>

            <div className="bg-[#0a0e1a] border border-[#1e3a5f] p-6 rounded-lg">
              <h2 className="text-2xl font-bold text-white mb-4">SOLCINERATOR Creator Hub Integration</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Our Creator Hub provides tools specifically designed for Pump.fun token creators:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-300 pl-4">
                <li>
                  <span className="font-bold text-white">Auto-Collect Feature:</span> Set a threshold (0.5 to 100 SOL)
                  to automatically collect your creator fees when they reach a certain amount
                </li>
                <li>
                  <span className="font-bold text-white">Creator Rewards Dashboard:</span> Track your total and
                  unclaimed creator fees in real-time with interactive charts
                </li>
                <li>
                  <span className="font-bold text-white">Your Coins:</span> View all tokens you've created and monitor
                  their performance
                </li>
                <li>
                  <span className="font-bold text-white">Manual Collection:</span> Collect your creator fees at any time
                  with a single click
                </li>
              </ul>
            </div>

            <div className="bg-yellow-900/20 border border-yellow-500/50 p-6 rounded-lg shadow-[0_0_20px_rgba(255,255,0,0.15)]">
              <h3 className="text-lg font-bold text-yellow-300 mb-2">💡 Pro Tip</h3>
              <p className="text-gray-300">
                Use the auto-collect feature to automatically harvest your creator fees when they reach your desired
                threshold. This ensures you never miss out on collecting your earnings and can reinvest them into new
                projects or liquidity.
              </p>
            </div>
          </div>
        )

      case "faq":
        return (
          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-white mb-4">Frequently Asked Questions</h1>
            <p className="text-gray-300 leading-relaxed mb-8">
              Find answers to common questions about SOLCINERATOR and how to use it effectively.
            </p>

            <div className="space-y-4">
              {faqItems.map((item) => (
                <div key={item.id} className="bg-[#0a0e1a] border border-[#1e3a5f] rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleFaq(item.id)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-[#0f1419] transition-colors cursor-pointer"
                  >
                    <span className="text-[#00ff00] font-bold text-lg">{item.question}</span>
                    {openFaq === item.id ? (
                      <ChevronDown className="w-5 h-5 text-[#00ff00] flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-[#00ff00] flex-shrink-0" />
                    )}
                  </button>
                  {openFaq === item.id && (
                    <div className="px-6 py-4 border-t border-[#1e3a5f]">
                      {item.id === "who-made" ? (
                        <p className="text-gray-300 leading-relaxed">
                          The incinerator was made by the{" "}
                          <span className="font-pixel">
                            <span className="text-[#00ff00]">Sol</span>
                            <span className="text-white">Works</span>
                          </span>{" "}
                          team. You can find more info by visiting our Discord or Twitter in the links above!
                        </p>
                      ) : (
                        <p className="text-gray-300 leading-relaxed">{item.answer}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )

      case "why":
        return (
          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-white mb-4">Why SOLCINERATOR?</h1>
            <p className="text-gray-300 leading-relaxed">
              SOLCINERATOR is Solana's original wallet cleanup tool. Since 2021, SOLCINERATOR has processed millions of
              wallets, recovering millions in SOL by clearing rent fees (Solana's storage costs) locked in unwanted or
              forgotten on-chain assets, including:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 pl-4">
              <li>Token accounts with zero balance</li>
              <li>Spam tokens and NFTs</li>
              <li>Solana Name Service (SNS) domains</li>
              <li>Compressed NFTs (cNFTs) — burned for a clutter-free wallet, even though they don't carry rent</li>
            </ul>
            <div className="bg-[#0a0e1a] border border-[#1e3a5f] p-6 rounded-lg mt-6">
              <h3 className="text-xl font-bold text-white mb-3">Jupiter DEX Integration</h3>
              <p className="text-gray-300">
                With built-in Jupiter DEX integration, instantly swap reclaimed SOL for USDC, USDT, JUP, BONK, or any
                token in one seamless, in-app flow.
              </p>
            </div>
          </div>
        )

      case "swapping":
        return (
          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-white mb-4">Seamless Token Swapping</h1>
            <p className="text-gray-300 leading-relaxed">
              After reclaiming your SOL, you can instantly swap it for other tokens using our integrated Jupiter DEX
              functionality. No need to leave the app or use external services.
            </p>
            <div className="bg-[#0a0e1a] border border-[#1e3a5f] p-6 rounded-lg">
              <h3 className="text-xl font-bold text-white mb-3">Supported Tokens</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-300 pl-4">
                <li>USDC - USD Coin</li>
                <li>USDT - Tether</li>
                <li>JUP - Jupiter</li>
                <li>BONK - Bonk</li>
                <li>Any SPL token available on Jupiter</li>
              </ul>
            </div>
          </div>
        )

      case "cleanup":
        return (
          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-white mb-4">Cleanup</h1>

            <div className="bg-[#0a0e1a] border border-[#1e3a5f] p-6 rounded-lg">
              <h2 className="text-2xl font-bold text-white mb-4">Cleanup FAQ</h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">What does cleanup do?</h3>
                  <p className="text-gray-300">
                    Cleanup helps you reclaim SOL by identifying and closing unused token accounts and resizing NFTs,
                    freeing up storage rent.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Is cleanup safe?</h3>
                  <p className="text-gray-300">
                    Cleanup is 100% safe to use. It does not burn any items. Closing token accounts is a reversible
                    operation, and resizing NFTs is sanctioned by Metaplex.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white mb-2">What are vacant accounts?</h3>
                  <p className="text-gray-300">
                    When purchasing tokens, NFTs, or other assets, you need to create an account for the item to live
                    in. Once this NFT or token has been sold, transferred, and so on, this storage is left unused, and
                    can be reclaimed. This does not burn any of your assets, and is a reversible process. It will not
                    invalidate any airdrops.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white mb-2">What does resize NFTs mean?</h3>
                  <p className="text-gray-300">
                    Metaplex, the company that created most NFT standards, discovered a way to reduce the amount of on
                    chain storage required for an NFT. By resizing your NFTs, you can reclaim a small amount of SOL.
                    This process is safe, it does not burn your NFT.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 mt-8">
              <h2 className="text-2xl font-bold text-white">How to Use Cleanup</h2>

              <div className="bg-[#0a0e1a] border border-[#1e3a5f] p-6 rounded-lg">
                <h3 className="text-xl font-bold text-white mb-4">Closing Vacant Accounts</h3>
                <ol className="space-y-4 text-gray-300">
                  <li>
                    <span className="font-bold text-white">1. Connect Wallet</span> - Connect your Solana wallet to get
                    started.
                  </li>
                  <li>
                    <span className="font-bold text-white">2. Select 'Vacant Accounts'</span> - If your wallet has
                    Vacant Accounts, you'll see the 'Vacant Accounts' logo with the number of accounts to close. Click
                    the logo — it will highlight as "marked for close".
                  </li>
                  <li>
                    <span className="font-bold text-white">3. Click Cleanup</span> - The Cleanup button is on the right
                    side of the screen. Using a Ledger? Enable the toggle. You can swap reclaimed SOL for another
                    currency here if you'd like.
                  </li>
                  <li>
                    <span className="font-bold text-white">4. Confirm Transaction</span> - If you're ready, click
                    Confirm to close your Vacant Accounts and recover your SOL.
                  </li>
                  <li>
                    <span className="font-bold text-white">5. Sign Transaction</span> - Sign and confirm your
                    transaction in your wallet.
                  </li>
                  <li>
                    <span className="font-bold text-white">6. Success!</span> - 🧹 Cleanup complete. Accounts closed,
                    SOL reclaimed.
                  </li>
                </ol>
              </div>

              <div className="bg-[#0a0e1a] border border-[#1e3a5f] p-6 rounded-lg">
                <h3 className="text-xl font-bold text-white mb-4">Resizing NFTs</h3>
                <ol className="space-y-4 text-gray-300">
                  <li>
                    <span className="font-bold text-white">1. Connect Wallet</span> - Connect your Solana wallet.
                  </li>
                  <li>
                    <span className="font-bold text-white">2. Select 'Resize NFTs'</span> - If your wallet has any NFTs
                    that can be resized, you'll see the 'Resize NFTs' logo with the number of NFTs available to resize.
                  </li>
                  <li>
                    <span className="font-bold text-white">3. Click Resize</span> - The Resize button is on the right
                    side of the screen. Using a Ledger? Enable the toggle.
                  </li>
                  <li>
                    <span className="font-bold text-white">4. Confirm Transaction</span> - Click Confirm to resize your
                    NFTs and recover your SOL.
                  </li>
                  <li>
                    <span className="font-bold text-white">5. Sign Transaction</span> - Sign and confirm in your wallet.
                  </li>
                  <li>
                    <span className="font-bold text-white">6. Success!</span> - Congrats! NFTs resized, SOL recovered.
                  </li>
                </ol>
              </div>
            </div>
          </div>
        )

      case "tokens":
        return (
          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-white mb-4">Tokens</h1>
            <p className="text-gray-300 leading-relaxed">
              Learn how to safely burn tokens on Solana and reclaim SOL from unwanted assets.
            </p>

            <div className="bg-red-900/20 border border-red-500/50 p-6 rounded-lg shadow-[0_0_20px_rgba(255,0,0,0.15)]">
              <p className="text-red-300 font-bold">
                ⚠️ Be 100% certain these are the tokens you want to burn — burns are irreversible.
              </p>
            </div>

            <div className="bg-[#0a0e1a] border border-[#1e3a5f] p-6 rounded-lg">
              <h2 className="text-2xl font-bold text-white mb-4">How to Burn Tokens</h2>
              <ol className="space-y-4 text-gray-300">
                <li>
                  <span className="font-bold text-white">1. Connect Wallet</span> - Connect your Solana wallet.
                </li>
                <li>
                  <span className="font-bold text-white">2. Select Tokens</span> - Choose the tokens you want to burn
                  from your wallet.
                </li>
                <li>
                  <span className="font-bold text-white">3. Click Burn</span> - The Burn button is on the right side of
                  the screen. Using a Ledger? Enable the toggle. You can swap reclaimed SOL for another currency here if
                  you'd like.
                </li>
                <li>
                  <span className="font-bold text-white">4. Confirm Selection</span> - Double-check your selection! You
                  can't reverse a burn.
                </li>
                <li>
                  <span className="font-bold text-white">5. Sign Transaction</span> - Sign and confirm your transaction
                  in your wallet.
                </li>
                <li>
                  <span className="font-bold text-white">6. Success!</span> - Your tokens were burned and your SOL was
                  recovered.
                </li>
              </ol>
            </div>
          </div>
        )

      case "nfts":
        return (
          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-white mb-4">NFTs</h1>
            <p className="text-gray-300 leading-relaxed">
              How to burn Solana NFTs to declutter your wallet and reclaim locked-up SOL.
            </p>

            <div className="bg-red-900/20 border border-red-500/50 p-6 rounded-lg shadow-[0_0_20px_rgba(255,0,0,0.15)]">
              <p className="text-red-300 font-bold">
                ⚠️ Double-check your NFT selection — burns are permanent and cannot be undone.
              </p>
            </div>

            <div className="bg-[#0a0e1a] border border-[#1e3a5f] p-6 rounded-lg">
              <h2 className="text-2xl font-bold text-white mb-4">How to Burn NFTs</h2>
              <ol className="space-y-4 text-gray-300">
                <li>
                  <span className="font-bold text-white">1. Connect Wallet</span> - Connect your Solana wallet.
                </li>
                <li>
                  <span className="font-bold text-white">2. Select NFTs</span> - Choose the NFTs you want to burn.
                </li>
                <li>
                  <span className="font-bold text-white">3. Click Burn</span> - The Burn button is on the right side of
                  the screen. Using a Ledger? Enable the toggle.
                </li>
                <li>
                  <span className="font-bold text-white">4. Confirm Selection</span> - This is your last chance. Once
                  you burn, it's gone forever. No do-overs.
                </li>
                <li>
                  <span className="font-bold text-white">5. Sign Transaction</span> - Sign and confirm in your wallet.
                </li>
                <li>
                  <span className="font-bold text-white">6. Success!</span> - 🔥 NFTs incinerated. SOL secured.
                </li>
              </ol>
            </div>
          </div>
        )

      case "cnfts":
        return (
          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-white mb-4">cNFTs (Compressed NFTs)</h1>
            <p className="text-gray-300 leading-relaxed">
              Learn how to burn cNFTs to tidy up your wallet and remove unwanted assets.
            </p>

            <div className="bg-yellow-900/20 border border-yellow-500/50 p-6 rounded-lg shadow-[0_0_20px_rgba(255,255,0,0.15)]">
              <p className="text-yellow-300">
                ℹ️ Note: cNFTs don't carry rent, so burning them won't return SOL. This is purely for wallet cleanup.
              </p>
            </div>

            <div className="bg-red-900/20 border border-red-500/50 p-6 rounded-lg shadow-[0_0_20px_rgba(255,0,0,0.15)]">
              <p className="text-red-300 font-bold">
                ⚠️ No take-backs. Burning cNFTs is final — double-check your list.
              </p>
            </div>

            <div className="bg-[#0a0e1a] border border-[#1e3a5f] p-6 rounded-lg">
              <h2 className="text-2xl font-bold text-white mb-4">How to Burn cNFTs</h2>
              <ol className="space-y-4 text-gray-300">
                <li>
                  <span className="font-bold text-white">1. Connect Wallet</span> - Connect your Solana wallet.
                </li>
                <li>
                  <span className="font-bold text-white">2. Select cNFTs</span> - Choose the compressed NFTs you want to
                  burn.
                </li>
                <li>
                  <span className="font-bold text-white">3. Click Burn</span> - The Burn button is on the right side of
                  the screen. Using a Ledger? Enable the toggle.
                </li>
                <li>
                  <span className="font-bold text-white">4. Confirm Selection</span> - Once you burn these cNFTs,
                  they're gone forever. No reversing it.
                </li>
                <li>
                  <span className="font-bold text-white">5. Sign Transaction</span> - Sign and confirm in your wallet.
                </li>
                <li>
                  <span className="font-bold text-white">6. Success!</span> - cNFTs burned. No SOL returned — just a
                  cleaner wallet.
                </li>
              </ol>
            </div>
          </div>
        )

      case "domains":
        return (
          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-white mb-4">Domains</h1>
            <p className="text-gray-300 leading-relaxed">
              How to burn Solana domains and reclaim the SOL locked in rent.
            </p>

            <div className="bg-red-900/20 border border-red-500/50 p-6 rounded-lg shadow-[0_0_20px_rgba(255,0,0,0.15)]">
              <p className="text-red-300 font-bold">⚠️ Be certain — burning your domain is final and irreversible.</p>
            </div>

            <div className="bg-[#0a0e1a] border border-[#1e3a5f] p-6 rounded-lg">
              <h2 className="text-2xl font-bold text-white mb-4">How to Burn Domains</h2>
              <ol className="space-y-4 text-gray-300">
                <li>
                  <span className="font-bold text-white">1. Connect Wallet</span> - Connect your Solana wallet.
                </li>
                <li>
                  <span className="font-bold text-white">2. Select Domains</span> - Choose the domains you want to burn.
                </li>
                <li>
                  <span className="font-bold text-white">3. Click Burn</span> - The Burn button is on the right side of
                  the screen. If you're using a ledger, enable the ledger toggle. You can also swap SOL for a different
                  currency, if desired.
                </li>
                <li>
                  <span className="font-bold text-white">4. Confirm Selection</span> - Final check: Are these the
                  Domains you want to burn? You can't undo this.
                </li>
                <li>
                  <span className="font-bold text-white">5. Sign Transaction</span> - Ready to burn? Click Confirm and
                  follow your wallet prompts to reclaim your SOL.
                </li>
                <li>
                  <span className="font-bold text-white">6. Success!</span> - Domain incinerated. Rent returned. Cleanup
                  complete.
                </li>
              </ol>
            </div>
          </div>
        )

      case "lp":
        return (
          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-white mb-4">LP (Liquidity Pool Tokens)</h1>
            <p className="text-gray-300 leading-relaxed">
              Answers to common questions about accessing and burning LP tokens.
            </p>

            <div className="bg-[#0a0e1a] border border-[#1e3a5f] p-6 rounded-lg">
              <h2 className="text-2xl font-bold text-white mb-4">What are LP Tokens?</h2>
              <p className="text-gray-300">
                LP (Liquidity Pool) tokens represent your share in a liquidity pool on decentralized exchanges. When you
                provide liquidity to a pool, you receive LP tokens that can be burned to reclaim your SOL.
              </p>
            </div>

            <div className="bg-[#0a0e1a] border border-[#1e3a5f] p-6 rounded-lg">
              <h2 className="text-2xl font-bold text-white mb-4">How to Burn LP Tokens</h2>
              <ol className="space-y-4 text-gray-300">
                <li>
                  <span className="font-bold text-white">1. Connect Wallet</span> - Connect your Solana wallet.
                </li>
                <li>
                  <span className="font-bold text-white">2. Select LP Tokens</span> - Choose the LP tokens you want to
                  burn.
                </li>
                <li>
                  <span className="font-bold text-white">3. Click Burn</span> - The Burn button is on the right side of
                  the screen. Using a Ledger? Enable the toggle. You can swap reclaimed SOL for another currency here if
                  you'd like.
                </li>
                <li>
                  <span className="font-bold text-white">4. Sign Transaction</span> - Sign and confirm your transaction
                  in your wallet.
                </li>
                <li>
                  <span className="font-bold text-white">5. Success!</span> - Done! LP tokens burned, SOL reclaimed.
                </li>
              </ol>
            </div>
          </div>
        )

      case "unknown":
        return (
          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-white mb-4">Unknown Tab</h1>
            <p className="text-gray-300 leading-relaxed">
              Answers to common questions about accessing and using the Unknown Tab.
            </p>

            <div className="bg-red-900/20 border border-red-500/50 p-6 rounded-lg shadow-[0_0_20px_rgba(255,0,0,0.15)]">
              <p className="text-red-300 font-bold">
                ⚠️ Unknown items may be NFTs, whitelist tokens, or other valuable assets. If you don't know what an item
                is, do NOT burn it. By using this feature, you accept full responsibility for what you burn.
              </p>
            </div>

            <div className="bg-[#0a0e1a] border border-[#1e3a5f] p-6 rounded-lg">
              <h2 className="text-2xl font-bold text-white mb-4">How to Burn Unknown Items</h2>
              <ol className="space-y-4 text-gray-300">
                <li>
                  <span className="font-bold text-white">1. Connect Wallet</span> - Connect your Solana wallet.
                </li>
                <li>
                  <span className="font-bold text-white">2. Navigate to Unknown Tab</span> - Access the Unknown tab to
                  see unidentified items in your wallet.
                </li>
                <li>
                  <span className="font-bold text-white">3. Select Items</span> - Carefully select only the items you
                  are certain you want to burn.
                </li>
                <li>
                  <span className="font-bold text-white">4. Click Burn</span> - The Burn button is on the right side of
                  the screen. Using a Ledger? Enable the toggle. You can swap reclaimed SOL for another currency here if
                  you'd like.
                </li>
                <li>
                  <span className="font-bold text-white">5. Confirm Selection</span> - Do you know what you're burning?
                  Double-check now — there's no going back.
                </li>
                <li>
                  <span className="font-bold text-white">6. Sign Transaction</span> - Sign and confirm in your wallet.
                </li>
                <li>
                  <span className="font-bold text-white">7. Success!</span> - You cleaned house. Unknown items burned.
                  SOL secured.
                </li>
              </ol>
            </div>
          </div>
        )

      case "api":
        return (
          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-white mb-4">API Documentation</h1>
            <p className="text-gray-300 leading-relaxed">
              Integrate SOLCINERATOR functionality into your own applications using our API.
            </p>

            <div className="bg-[#0a0e1a] border border-[#1e3a5f] p-6 rounded-lg">
              <h2 className="text-2xl font-bold text-white mb-4">Base URL</h2>
              <div className="bg-[#0f1419] p-4 rounded font-mono text-sm text-gray-300">
                https://api.solcinerator.com/v1
              </div>
            </div>

            <div className="bg-[#0a0e1a] border border-[#1e3a5f] p-6 rounded-lg">
              <h2 className="text-2xl font-bold text-white mb-4">Authentication</h2>
              <p className="text-gray-300 mb-4">All API requests require an API key in the header:</p>
              <div className="bg-[#0f1419] p-4 rounded font-mono text-sm text-gray-300">
                <div>Authorization: Bearer YOUR_API_KEY</div>
              </div>
            </div>

            <div className="bg-[#0a0e1a] border border-[#1e3a5f] p-6 rounded-lg">
              <h2 className="text-2xl font-bold text-white mb-4">Get Wallet Assets</h2>
              <p className="text-gray-300 mb-4">Retrieve all assets in a wallet that can be cleaned up or burned.</p>
              <div className="bg-[#0f1419] p-4 rounded font-mono text-sm text-gray-300 space-y-2">
                <div className="text-[#00ff00]">GET /wallet/assets</div>
                <div className="mt-4">
                  <div className="text-gray-500">// Request</div>
                  <div>curl -X GET \</div>
                  <div className="pl-4">'https://api.solcinerator.com/v1/wallet/assets?address=YOUR_WALLET' \</div>
                  <div className="pl-4">-H 'Authorization: Bearer YOUR_API_KEY'</div>
                </div>
                <div className="mt-4">
                  <div className="text-gray-500">// Response</div>
                  <div>{"{"}</div>
                  <div className="pl-4">"vacantAccounts": 5,</div>
                  <div className="pl-4">"tokens": 12,</div>
                  <div className="pl-4">"nfts": 3,</div>
                  <div className="pl-4">"cnfts": 8,</div>
                  <div className="pl-4">"domains": 1,</div>
                  <div className="pl-4">"lpTokens": 2,</div>
                  <div className="pl-4">"unknown": 4</div>
                  <div>{"}"}</div>
                </div>
              </div>
            </div>

            <div className="bg-[#0a0e1a] border border-[#1e3a5f] p-6 rounded-lg">
              <h2 className="text-2xl font-bold text-white mb-4">Close Vacant Accounts</h2>
              <p className="text-gray-300 mb-4">Close vacant token accounts and reclaim SOL.</p>
              <div className="bg-[#0f1419] p-4 rounded font-mono text-sm text-gray-300 space-y-2">
                <div className="text-[#00ff00]">POST /cleanup/vacant-accounts</div>
                <div className="mt-4">
                  <div className="text-gray-500">// Request</div>
                  <div>curl -X POST \</div>
                  <div className="pl-4">'https://api.solcinerator.com/v1/cleanup/vacant-accounts' \</div>
                  <div className="pl-4">-H 'Authorization: Bearer YOUR_API_KEY' \</div>
                  <div className="pl-4">-H 'Content-Type: application/json' \</div>
                  <div className="pl-4">-d '{"{"}</div>
                  <div className="pl-8">"walletAddress": "YOUR_WALLET",</div>
                  <div className="pl-8">"accounts": ["account1", "account2"]</div>
                  <div className="pl-4">{"}"}'</div>
                </div>
                <div className="mt-4">
                  <div className="text-gray-500">// Response</div>
                  <div>{"{"}</div>
                  <div className="pl-4">"success": true,</div>
                  <div className="pl-4">"transaction": "TRANSACTION_SIGNATURE",</div>
                  <div className="pl-4">"solReclaimed": 0.0234</div>
                  <div>{"}"}</div>
                </div>
              </div>
            </div>

            <div className="bg-[#0a0e1a] border border-[#1e3a5f] p-6 rounded-lg">
              <h2 className="text-2xl font-bold text-white mb-4">Burn Tokens</h2>
              <p className="text-gray-300 mb-4">Burn unwanted tokens and reclaim SOL.</p>
              <div className="bg-[#0f1419] p-4 rounded font-mono text-sm text-gray-300 space-y-2">
                <div className="text-[#00ff00]">POST /burn/tokens</div>
                <div className="mt-4">
                  <div className="text-gray-500">// Request</div>
                  <div>curl -X POST \</div>
                  <div className="pl-4">'https://api.solcinerator.com/v1/burn/tokens' \</div>
                  <div className="pl-4">-H 'Authorization: Bearer YOUR_API_KEY' \</div>
                  <div className="pl-4">-H 'Content-Type: application/json' \</div>
                  <div className="pl-4">-d '{"{"}</div>
                  <div className="pl-8">"walletAddress": "YOUR_WALLET",</div>
                  <div className="pl-8">"tokenMints": ["mint1", "mint2"]</div>
                  <div className="pl-4">{"}"}'</div>
                </div>
                <div className="mt-4">
                  <div className="text-gray-500">// Response</div>
                  <div>{"{"}</div>
                  <div className="pl-4">"success": true,</div>
                  <div className="pl-4">"transaction": "TRANSACTION_SIGNATURE",</div>
                  <div className="pl-4">"tokensBurned": 2,</div>
                  <div className="pl-4">"solReclaimed": 0.0156</div>
                  <div>{"}"}</div>
                </div>
              </div>
            </div>

            <div className="bg-[#0a0e1a] border border-[#1e3a5f] p-6 rounded-lg">
              <h2 className="text-2xl font-bold text-white mb-4">Burn NFTs</h2>
              <p className="text-gray-300 mb-4">Burn NFTs and reclaim SOL.</p>
              <div className="bg-[#0f1419] p-4 rounded font-mono text-sm text-gray-300 space-y-2">
                <div className="text-[#00ff00]">POST /burn/nfts</div>
                <div className="mt-4">
                  <div className="text-gray-500">// Request</div>
                  <div>curl -X POST \</div>
                  <div className="pl-4">'https://api.solcinerator.com/v1/burn/nfts' \</div>
                  <div className="pl-4">-H 'Authorization: Bearer YOUR_API_KEY' \</div>
                  <div className="pl-4">-H 'Content-Type: application/json' \</div>
                  <div className="pl-4">-d '{"{"}</div>
                  <div className="pl-8">"walletAddress": "YOUR_WALLET",</div>
                  <div className="pl-8">"nftMints": ["nft1", "nft2"]</div>
                  <div className="pl-4">{"}"}'</div>
                </div>
                <div className="mt-4">
                  <div className="text-gray-500">// Response</div>
                  <div>{"{"}</div>
                  <div className="pl-4">"success": true,</div>
                  <div className="pl-4">"transaction": "TRANSACTION_SIGNATURE",</div>
                  <div className="pl-4">"nftsBurned": 2,</div>
                  <div className="pl-4">"solReclaimed": 0.0312</div>
                  <div>{"}"}</div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-900/20 border border-yellow-500/50 p-6 rounded-lg shadow-[0_0_20px_rgba(255,255,0,0.15)]">
              <h3 className="text-lg font-bold text-yellow-300 mb-2">Rate Limits</h3>
              <p className="text-gray-300">
                API requests are limited to 100 requests per minute per API key. Contact us for higher limits.
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const groupedSections = sections.reduce(
    (acc, section) => {
      const category = section.category || "MAIN"
      if (!acc[category]) acc[category] = []
      acc[category].push(section)
      return acc
    },
    {} as Record<string, typeof sections>,
  )

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0e1a]">
      <header className="border-b border-[#1e3a5f] bg-[#0f1419] sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-bold">SOLCINERATOR</span>
          </Link>

          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Ask or search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0a0e1a] border border-[#1e3a5f] rounded-lg pl-10 pr-4 py-2 text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-[#00ff00]/50"
              />
              <kbd className="absolute right-3 top-1/2 transform -translate-y-1/2 px-2 py-1 text-xs text-gray-500 bg-[#1e3a5f] rounded">
                Ctrl K
              </kbd>
            </div>
          </div>

          <button className="lg:hidden text-white cursor-pointer" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        <aside
          className={`${
            mobileMenuOpen ? "block" : "hidden"
          } lg:block w-64 border-r border-[#1e3a5f] bg-[#0f1419] overflow-y-auto fixed lg:sticky top-[57px] h-[calc(100vh-57px)] z-40 lg:z-0`}
        >
          <nav className="p-4 space-y-6">
            {Object.entries(groupedSections).map(([category, items]) => (
              <div key={category}>
                {category !== "MAIN" && (
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-3">{category}</div>
                )}
                <div className="space-y-1">
                  {items.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => {
                        setActiveSection(section.id)
                        setMobileMenuOpen(false)
                      }}
                      className={`w-full text-left px-3 py-2 rounded text-sm transition-colors cursor-pointer ${
                        activeSection === section.id
                          ? "bg-[#00ff00]/10 text-[#00ff00] font-medium"
                          : "text-gray-400 hover:bg-[#1e3a5f]/30 hover:text-gray-200"
                      }`}
                    >
                      {section.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <div className="p-4 border-t border-[#1e3a5f] mt-auto">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Powered by</span>
              <span className="font-bold text-gray-400">GitBook</span>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-8">
            <div className="prose prose-invert max-w-none">{renderContent()}</div>
          </div>
        </main>

        <aside className="hidden xl:block w-64 border-l border-[#1e3a5f] bg-[#0f1419] overflow-y-auto sticky top-[57px] h-[calc(100vh-57px)]">
          <div className="p-4">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">On This Page</div>
            <nav className="space-y-2">
              {activeSection === "home" && (
                <>
                  <a href="#" className="block text-sm text-gray-400 hover:text-[#00ff00] transition-colors">
                    Why SOLCINERATOR?
                  </a>
                  <a href="#" className="block text-sm text-gray-400 hover:text-[#00ff00] transition-colors">
                    Seamless Token Swapping
                  </a>
                  <a href="#" className="block text-sm text-gray-400 hover:text-[#00ff00] transition-colors">
                    Ready to Reclaim Your SOL
                  </a>
                </>
              )}
              {activeSection === "faq" && (
                <>
                  {faqItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => toggleFaq(item.id)}
                      className="block text-sm text-left text-gray-400 hover:text-[#00ff00] transition-colors cursor-pointer w-full"
                    >
                      {item.question}
                    </button>
                  ))}
                </>
              )}
            </nav>
          </div>
        </aside>
      </div>
    </div>
  )
}
