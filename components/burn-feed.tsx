"use client"

import { useState, useEffect } from "react"
import { ExternalLink, Flame } from "lucide-react"

interface BurnTransaction {
  signature: string
  blockTime: number
  type: string
  itemsBurned: number
  solReclaimed: number
}

export function BurnFeed() {
  const [transactions, setTransactions] = useState<BurnTransaction[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [newTxSignature, setNewTxSignature] = useState<string | null>(null)

  const fetchTransactions = async () => {
    try {
      const response = await fetch("/api/burn-transactions")
      const data = await response.json()

      if (data && data.transactions && Array.isArray(data.transactions)) {
        const parsedTxs = data.transactions

        if (transactions.length > 0 && parsedTxs[0]?.signature !== transactions[0]?.signature) {
          setNewTxSignature(parsedTxs[0].signature)
          setTimeout(() => setNewTxSignature(null), 1000)
        }

        setTransactions(parsedTxs)
      }
      setIsLoading(false)
    } catch (error) {
      console.error("[v0] Error fetching burn transactions:", error)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
    const interval = setInterval(fetchTransactions, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor(Date.now() / 1000 - timestamp)
    if (seconds < 60) return `${seconds}s ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  const truncateSignature = (sig: string) => {
    return `${sig.slice(0, 4)}...${sig.slice(-4)}`
  }

  const previewTxs = transactions.slice(0, 2)

  return (
    <div className="relative">
      {/* Header Preview */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 border border-[#00ff00] bg-[#0a0e1a] hover:bg-[#151922] transition-colors shadow-[0_0_15px_rgba(0,255,0,0.1)]"
        title="Live Burn Feed"
      >
        <Flame className="w-4 h-4 text-[#00ff00] animate-pulse" />
        <div className="flex flex-col items-start">
          {isLoading ? (
            <span className="text-[#00ff00] text-xs font-mono">Loading...</span>
          ) : previewTxs.length > 0 ? (
            <>
              <span className="text-[#00ff00] text-xs font-mono">{truncateSignature(previewTxs[0].signature)}</span>
              <span className="text-[#a0aec0] text-[10px]">{formatTimeAgo(previewTxs[0].blockTime)}</span>
            </>
          ) : (
            <span className="text-[#00ff00] text-xs font-mono">No burns yet</span>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-[#00ff00] transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Feed */}
      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-96 max-h-[600px] overflow-y-auto border-2 border-[#00ff00] shadow-[0_0_20px_rgba(0,255,0,0.15)] z-50"
          style={{ backgroundColor: "#0a0e1a" }}
        >
          <div className="sticky top-0 bg-[#151922] border-b border-[#00ff00] p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-[#00ff00]" />
              <h3 className="text-[#00ff00] font-bold text-sm">LIVE BURN FEED</h3>
            </div>
            <span className="text-[#a0aec0] text-xs">{transactions.length} burns</span>
          </div>

          <div className="divide-y divide-[#2d3748]">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="text-[#00ff00] text-sm animate-pulse">Loading transactions...</div>
              </div>
            ) : transactions.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-[#a0aec0] text-sm">No burn transactions yet</div>
              </div>
            ) : (
              transactions.map((tx) => (
                <div
                  key={tx.signature}
                  className={`p-3 hover:bg-[#151922] transition-all duration-300 ${
                    newTxSignature === tx.signature ? "animate-slideIn bg-[#00ff00]/10" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <a
                          href={`https://solscan.io/tx/${tx.signature}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#00ff00] text-xs font-mono hover:underline flex items-center gap-1"
                        >
                          {truncateSignature(tx.signature)}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <span className="text-[#a0aec0] text-[10px]">{formatTimeAgo(tx.blockTime)}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-white">
                          <span className="text-[#a0aec0]">Type:</span> {tx.type}
                        </span>
                        <span className="text-white">
                          <span className="text-[#a0aec0]">Items:</span> {tx.itemsBurned}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[#00ff00] text-xs font-bold">+{tx.solReclaimed} SOL</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="sticky bottom-0 bg-[#151922] border-t border-[#00ff00] p-2 text-center">
            <span className="text-[#a0aec0] text-[10px]">Updates every 30 seconds</span>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slideIn {
          animation: slideIn 0.5s ease-out;
        }
      `}</style>
    </div>
  )
}
