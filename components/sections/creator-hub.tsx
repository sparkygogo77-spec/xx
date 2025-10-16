"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { TrendingUp, Lock, LockOpen, BarChart3, ChevronDown, ExternalLink, Clock } from "lucide-react"
import { useConnection } from "@solana/wallet-adapter-react"
import { Transaction, VersionedTransaction } from "@solana/web3.js"
import { Buffer } from "buffer"

export function CreatorHub() {
  const { publicKey, signTransaction, sendTransaction } = useWallet()
  const { connection } = useConnection()

  const [autoCollectThreshold, setAutoCollectThreshold] = useState(101) // Default to "Do not collect"
  const [isLocked, setIsLocked] = useState(false)
  const [refreshProgress, setRefreshProgress] = useState(360)
  const [manualInput, setManualInput] = useState("101.00")
  const [selectedPeriod, setSelectedPeriod] = useState("1D")
  const [chartType, setChartType] = useState<"line" | "interval">("line")
  const [isShaking, setIsShaking] = useState(false)
  const [isLoadingValues, setIsLoadingValues] = useState(true)
  const [loadingBarProgress, setLoadingBarProgress] = useState(0)
  const [unclaimedBalance, setUnclaimedBalance] = useState(0)
  const [openFaqItems, setOpenFaqItems] = useState<Set<string>>(new Set())
  const [totalRewards, setTotalRewards] = useState(0)
  const [totalRewardsUSD, setTotalRewardsUSD] = useState(0)
  const [createdTokens, setCreatedTokens] = useState<any[]>([])
  const [rewardsHistory, setRewardsHistory] = useState<any[]>([])
  const [isClaiming, setIsClaiming] = useState(false)
  const [solPrice, setSolPrice] = useState(0)

  useEffect(() => {
    const loadingInterval = setInterval(() => {
      setLoadingBarProgress((prev) => {
        if (prev >= 100) {
          clearInterval(loadingInterval)
          return 100
        }
        return prev + 10
      })
    }, 50)

    const valuesTimeout = setTimeout(() => {
      setIsLoadingValues(false)
    }, 600)

    return () => {
      clearInterval(loadingInterval)
      clearTimeout(valuesTimeout)
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshProgress((prev) => {
        const newProgress = prev - 12
        return newProgress <= 0 ? 360 : newProgress
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    setManualInput(autoCollectThreshold > 100 ? "101.00" : autoCollectThreshold.toFixed(2))
  }, [autoCollectThreshold])

  const generateThresholdValues = () => {
    const values = []
    for (let i = 0; i <= 50; i++) {
      const value = 0.5 * Math.pow(1.15, i)
      if (value <= 100) {
        values.push(value)
      }
    }
    values.push(101)
    return values
  }

  const thresholdValues = generateThresholdValues()

  const handleManualInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setManualInput(value)
  }

  const handleManualInputBlur = () => {
    const numValue = Number.parseFloat(manualInput)
    if (!Number.isNaN(numValue)) {
      if (numValue < 0.5) {
        setAutoCollectThreshold(0.5)
      } else if (numValue > 100) {
        setAutoCollectThreshold(101)
      } else {
        const closest = thresholdValues.reduce((prev, curr) => {
          return Math.abs(curr - numValue) < Math.abs(prev - numValue) ? curr : prev
        })
        setAutoCollectThreshold(closest)
      }
    } else {
      setManualInput(autoCollectThreshold > 100 ? "101.00" : autoCollectThreshold.toFixed(2))
    }
  }

  const handleRefreshClick = () => {
    setRefreshProgress(360)
    setIsShaking(true)
    setTimeout(() => setIsShaking(false), 500)
  }

  const handleCollectClick = async () => {
    if (unclaimedBalance === 0) {
      setIsShaking(true)
      setTimeout(() => setIsShaking(false), 500)
      return
    }

    if (!publicKey || !signTransaction) {
      alert("Please connect your wallet")
      return
    }

    setIsClaiming(true)

    try {
      console.log("[v0] Building claim transaction...")

      const response = await fetch("/api/pumpfun-claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet: publicKey.toBase58(),
          priorityFee: 0.0001,
        }),
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      console.log("[v0] Transaction built, signing...")

      // Deserialize and sign transaction
      const txBuffer = Buffer.from(data.transaction, "base64")
      let transaction: Transaction | VersionedTransaction

      try {
        transaction = VersionedTransaction.deserialize(txBuffer)
      } catch {
        transaction = Transaction.from(txBuffer)
      }

      const signedTx = await signTransaction(transaction)

      console.log("[v0] Sending transaction...")

      const signature = await connection.sendRawTransaction(signedTx.serialize())

      console.log("[v0] Transaction sent:", signature)

      await connection.confirmTransaction(signature, "confirmed")

      console.log("[v0] Transaction confirmed!")

      alert(`Successfully claimed ${unclaimedBalance.toFixed(4)} SOL!`)

      // Refresh rewards data
      window.location.reload()
    } catch (error) {
      console.error("[v0] Error claiming rewards:", error)
      alert(`Failed to claim rewards: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsClaiming(false)
    }
  }

  const getDashCount = () => {
    const dashCounts: Record<string, number> = {
      "1D": 24,
      "1W": 7,
      "1M": 30,
      "3M": 12,
      "1Y": 12,
      all: 12,
    }
    return dashCounts[selectedPeriod] || 12
  }

  const formatThreshold = (value: number) => {
    if (value > 100) return "Do not collect"
    return `${value.toFixed(2)} SOL`
  }

  const formatWalletAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  const toggleFaqItem = (id: string) => {
    setOpenFaqItems((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const faqItems = [
    {
      id: "where-sol",
      question: "Where is the reclaimed SOL coming from?",
      answer:
        "Any accounts on Solana require a small storage fee to open them. By burning a token, we can close this account and reclaim the storage fee.",
    },
    {
      id: "how-much",
      question: "How much can I reclaim from burning?",
      answer:
        "Most NFTs will give you 0.01 SOL when you burn. Most tokens will give you 0.002 SOL. Certain NFTs, such as scam tokens, will also only return 0.002 SOL.",
    },
    {
      id: "cleanup",
      question: "What does 'cleanup' do?",
      answer:
        "Cleanup closes vacant token accounts and unused serum accounts. This operation is completely safe to perform and does not affect the NFTs & tokens in your wallet.",
    },
    {
      id: "fees",
      question: "Do you charge any fees?",
      answer:
        "Yes, we charge roughly 2-5% fees depending on the exact type of item being burnt. Note: this fee is taken from the reclaimed SOL - you will never lose SOL by burning, you can only gain it.",
    },
  ]

  useEffect(() => {
    const fetchSolPrice = async () => {
      try {
        const response = await fetch("/api/sol-price")
        const data = await response.json()
        setSolPrice(data.price || 0)
      } catch (error) {
        console.error("[v0] Error fetching SOL price:", error)
      }
    }
    fetchSolPrice()
    const interval = setInterval(fetchSolPrice, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const fetchRewards = async () => {
      if (!publicKey) return

      try {
        const response = await fetch(`/api/pumpfun-rewards?wallet=${publicKey.toBase58()}`)
        const data = await response.json()

        if (data.error) {
          console.error("[v0] Error fetching rewards:", data.error)
          return
        }

        setTotalRewards(data.totalRewards || 0)
        setUnclaimedBalance(0) // Always 0
        setTotalRewardsUSD((data.totalRewards || 0) * solPrice)
        setCreatedTokens(data.createdTokens || [])
        setRewardsHistory(data.collectionHistory || [])

        setIsLoadingValues(false)
      } catch (error) {
        console.error("[v0] Error fetching rewards:", error)
        setIsLoadingValues(false)
      }
    }

    fetchRewards()
    const interval = setInterval(fetchRewards, 30000)
    return () => clearInterval(interval)
  }, [publicKey, solPrice])

  const getChartData = () => {
    if (rewardsHistory.length === 0) return []

    const now = Date.now() / 1000
    let startTime = now

    switch (selectedPeriod) {
      case "1D":
        startTime = now - 24 * 60 * 60
        break
      case "1W":
        startTime = now - 7 * 24 * 60 * 60
        break
      case "1M":
        startTime = now - 30 * 24 * 60 * 60
        break
      case "3M":
        startTime = now - 90 * 24 * 60 * 60
        break
      case "1Y":
        startTime = now - 365 * 24 * 60 * 60
        break
      case "all":
        startTime = 0
        break
    }

    return rewardsHistory.filter((claim) => claim.timestamp >= startTime).sort((a, b) => a.timestamp - b.timestamp)
  }

  const chartData = getChartData()

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="text-white text-sm mb-1">Connected Wallet</div>
          <div className="text-[#00ff00] text-xl font-bold font-mono border-2 border-[#00ff00] px-4 py-2 bg-[#00ff00]/5 shadow-[0_0_15px_rgba(0,255,0,0.3)] hover:shadow-[0_0_25px_rgba(0,255,0,0.5)] transition-all duration-300">
            {publicKey ? formatWalletAddress(publicKey.toBase58()) : "Not connected"}
          </div>
        </div>
      </div>

      {loadingBarProgress < 100 && (
        <div className="w-full h-1 bg-[#2d3748] mb-4 overflow-hidden">
          <div
            className="h-full bg-[#00ff00] transition-all duration-100 ease-out"
            style={{ width: `${loadingBarProgress}%` }}
          />
        </div>
      )}

      <div
        className="border p-6 shadow-[0_0_20px_rgba(255,255,255,0.08)]"
        style={{ borderColor: "#2d3748", backgroundColor: "#151922" }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">creator rewards</h2>
          <button
            className="px-4 py-2 bg-[#2d3748] text-white text-sm border border-[#4a5568] hover:bg-[#4a5568] transition-colors"
            onClick={() => window.open("https://pump.fun", "_blank")}
          >
            share
          </button>
        </div>

        <div className={`grid grid-cols-2 gap-8 mb-6 ${isShaking ? "animate-shake" : ""}`}>
          <div>
            <div className="text-sm text-white mb-1">total</div>
            <div className="text-3xl font-bold text-white">
              {isLoadingValues ? "$xx.xx" : `$${totalRewardsUSD.toFixed(2)}`}
            </div>
            <div className="text-sm text-white">{isLoadingValues ? "x.xxx SOL" : `${totalRewards.toFixed(3)} SOL`}</div>
          </div>
          <div className="flex items-center gap-6">
            <div className="mr-4">
              <div className="text-sm text-white mb-1">unclaimed</div>
              <div className="text-3xl font-bold text-white">{isLoadingValues ? "$0.00" : "$0.00"}</div>
              <div className="text-sm text-white">{isLoadingValues ? "0.000 SOL" : "0.000 SOL"}</div>
            </div>
            <button
              onClick={handleCollectClick}
              disabled={true}
              className="px-8 py-4 font-black text-2xl self-end mb-1 uppercase transition-all duration-150 ease-out border-2 bg-[#4a5568] text-[#718096] border-[#2d3748] shadow-[0_4px_0_#2d3748,0_6px_12px_rgba(0,0,0,0.4)] cursor-not-allowed opacity-60"
            >
              claim rewards
            </button>
          </div>
        </div>

        <div className="border h-64 relative mb-4" style={{ borderColor: "#2d3748", backgroundColor: "#0a0e1a" }}>
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
            {chartData.length > 0 ? (
              <>
                {chartType === "line" ? (
                  <polyline
                    points={chartData
                      .map((claim, i) => {
                        const x = (i / (chartData.length - 1 || 1)) * 100
                        const y = 100 - (claim.amount / Math.max(...chartData.map((c) => c.amount))) * 80
                        return `${x},${y}`
                      })
                      .join(" ")}
                    fill="none"
                    stroke="#00ff00"
                    strokeWidth="2"
                  />
                ) : (
                  chartData.map((claim, i) => {
                    const barWidth = 100 / chartData.length
                    const x = (i * 100) / chartData.length
                    const height = (claim.amount / Math.max(...chartData.map((c) => c.amount))) * 80
                    return (
                      <line
                        key={i}
                        x1={`${x + barWidth / 2}%`}
                        y1="100%"
                        x2={`${x + barWidth / 2}%`}
                        y2={`${100 - height}%`}
                        stroke="#00ff00"
                        strokeWidth="3"
                      />
                    )
                  })
                )}
              </>
            ) : (
              <line x1="0" y1="100%" x2="100%" y2="100%" stroke="#00ff00" strokeWidth="2" />
            )}
          </svg>
          {chartData.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-[#a0aec0]">
                <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No collection data yet</p>
                <p className="text-xs mt-1">Collect creator fees to see them here</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {["1D", "1W", "1M", "3M", "1Y", "all"].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-3 py-1 text-sm border transition-colors cursor-pointer ${
                  selectedPeriod === period
                    ? "border-[#00ff00] text-[#00ff00] bg-[#00ff00]/10"
                    : "text-white hover:border-[#00ff00] hover:text-[#00ff00]"
                }`}
                style={{ borderColor: selectedPeriod === period ? "#00ff00" : "#2d3748" }}
              >
                {period}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 mr-4">
              <label className="text-xs text-white">Auto-collect:</label>
              <input
                type="text"
                value={manualInput}
                onChange={handleManualInputChange}
                onBlur={handleManualInputBlur}
                disabled={isLocked}
                className="w-16 px-2 py-1 bg-[#0a0e1a] border text-[#00ff00] text-xs font-mono text-center disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:border-[#00ff00] cursor-pointer"
                style={{ borderColor: isLocked ? "#ff0000" : "#2d3748" }}
                placeholder="0.00"
              />
              <span className="text-xs text-white">SOL</span>
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max={thresholdValues.length - 1}
                  value={thresholdValues.indexOf(autoCollectThreshold)}
                  onChange={(e) =>
                    !isLocked && setAutoCollectThreshold(thresholdValues[Number.parseInt(e.target.value)])
                  }
                  disabled={isLocked}
                  className="w-32 h-2 bg-[#2d3748] appearance-none cursor-pointer slider disabled:cursor-not-allowed disabled:opacity-50"
                  style={{
                    background: isLocked
                      ? `linear-gradient(to right, #ff0000 0%, #ff0000 ${
                          (thresholdValues.indexOf(autoCollectThreshold) / (thresholdValues.length - 1)) * 100
                        }%, #2d3748 ${
                          (thresholdValues.indexOf(autoCollectThreshold) / (thresholdValues.length - 1)) * 100
                        }%, #2d3748 100%)`
                      : `linear-gradient(to right, #00ff00 0%, #00ff00 ${
                          (thresholdValues.indexOf(autoCollectThreshold) / (thresholdValues.length - 1)) * 100
                        }%, #2d3748 ${
                          (thresholdValues.indexOf(autoCollectThreshold) / (thresholdValues.length - 1)) * 100
                        }%, #2d3748 100%)`,
                  }}
                />
              </div>
              <button
                onClick={() => setIsLocked(!isLocked)}
                className={`px-2 py-1 border transition-colors cursor-pointer ${
                  isLocked
                    ? "border-[#ff0000] text-[#ff0000] hover:bg-[#ff0000] hover:text-white"
                    : "border-[#2d3748] text-white hover:border-[#00ff00] hover:text-[#00ff00]"
                }`}
                title={isLocked ? "Unlock threshold" : "Lock threshold"}
              >
                {isLocked ? <Lock className="w-3 h-3" /> : <LockOpen className="w-3 h-3" />}
              </button>
              <button
                onClick={handleRefreshClick}
                className="relative w-6 h-6 hover:opacity-80 transition-opacity cursor-pointer"
              >
                <svg className="w-6 h-6" viewBox="0 0 32 32">
                  <circle cx="16" cy="16" r="14" fill="none" stroke="#2d3748" strokeWidth="2" />
                  <circle
                    cx="16"
                    cy="16"
                    r="14"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeDasharray="87.96"
                    strokeDashoffset={87.96 - (87.96 * refreshProgress) / 360}
                    strokeLinecap="round"
                    style={{
                      transform: "rotate(-90deg)",
                      transformOrigin: "center",
                      transition: "stroke-dashoffset 0.3s ease-out",
                    }}
                  />
                </svg>
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setChartType("line")}
                className={`w-8 h-8 border flex items-center justify-center transition-colors cursor-pointer ${
                  chartType === "line"
                    ? "border-[#00ff00] text-[#00ff00] bg-[#00ff00]/10"
                    : "text-white hover:border-[#00ff00] hover:text-[#00ff00]"
                }`}
                style={{ borderColor: chartType === "line" ? "#00ff00" : "#2d3748" }}
                title="Line chart"
              >
                <TrendingUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => setChartType("interval")}
                className={`w-8 h-8 border flex items-center justify-center transition-colors cursor-pointer ${
                  chartType === "interval"
                    ? "border-[#00ff00] text-[#00ff00] bg-[#00ff00]/10"
                    : "text-white hover:border-[#00ff00] hover:text-[#00ff00]"
                }`}
                style={{ borderColor: chartType === "interval" ? "#00ff00" : "#2d3748" }}
                title="Interval chart"
              >
                <BarChart3 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="border p-6 shadow-[0_0_20px_rgba(255,255,255,0.08)]"
        style={{ borderColor: "#2d3748", backgroundColor: "#151922" }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#00ff00]">coins</h2>
          <span className="text-sm text-white">profit</span>
        </div>
        {createdTokens.length > 0 ? (
          <div className="space-y-3">
            {createdTokens.map((token, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border border-[#2d3748] bg-[#0a0e1a] hover:bg-[#151922] transition-colors"
              >
                <div className="flex items-center gap-3">
                  {token.image ? (
                    <img
                      src={token.image || "/placeholder.svg"}
                      alt={token.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-[#2d3748] rounded-full flex items-center justify-center text-[#00ff00] font-bold">
                      {token.symbol?.charAt(0) || "?"}
                    </div>
                  )}
                  <div>
                    <div className="text-white font-bold">{token.name || "Unknown"}</div>
                    <div className="text-sm text-[#a0aec0]">{token.symbol || "???"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-[#00ff00] font-bold">
                      {token.profit ? `${token.profit.toFixed(4)} SOL` : "0.0000 SOL"}
                    </div>
                    <div className="text-xs text-[#a0aec0]">
                      {token.profit ? `$${(token.profit * solPrice).toFixed(2)}` : "$0.00"}
                    </div>
                  </div>
                  <a
                    href={`https://pump.fun/${token.mint}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#00ff00] hover:text-[#00dd00]"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-white">
            <p>No coins created yet</p>
            <p className="text-sm mt-2 text-[#a0aec0]">
              Launch your first token on{" "}
              <a href="https://pump.fun" target="_blank" rel="noopener noreferrer" className="text-[#00ff00]">
                pump.fun
              </a>{" "}
              to see it here
            </p>
          </div>
        )}
      </div>

      {rewardsHistory.length > 0 && (
        <div
          className="border p-6 shadow-[0_0_20px_rgba(255,255,255,0.08)]"
          style={{ borderColor: "#2d3748", backgroundColor: "#151922" }}
        >
          <h2 className="text-xl font-bold text-white mb-4">Collection History</h2>
          <div className="space-y-2">
            {rewardsHistory.map((claim, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border border-[#2d3748] bg-[#0a0e1a] text-sm"
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-[#00ff00]" />
                  <span className="text-[#a0aec0]">{new Date(claim.timestamp * 1000).toLocaleDateString()}</span>
                  <span className="text-white text-xs">{claim.description}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[#00ff00] font-bold">
                    +{claim.amount.toFixed(4)} SOL (${(claim.amount * solPrice).toFixed(2)})
                  </span>
                  <a
                    href={`https://solscan.io/tx/${claim.signature}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#00ff00] hover:text-[#00dd00]"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div
        className="border p-6 shadow-[0_0_20px_rgba(255,255,255,0.08)]"
        style={{ borderColor: "#2d3748", backgroundColor: "#151922" }}
      >
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {faqItems.map((item) => (
            <div key={item.id} className="border border-[#2d3748]" style={{ backgroundColor: "#0a0e1a" }}>
              <button
                onClick={() => toggleFaqItem(item.id)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-[#151922] transition-colors"
              >
                <span className="text-[#00ff00] font-bold text-sm">{item.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-[#00ff00] transition-transform ${
                    openFaqItems.has(item.id) ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openFaqItems.has(item.id) && (
                <div className="p-4 pt-0 text-[#a0aec0] text-sm leading-relaxed border-t border-[#2d3748]">
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
