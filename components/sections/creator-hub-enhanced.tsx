"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useConnection } from "@solana/wallet-adapter-react"
import { Transaction, VersionedTransaction } from "@solana/web3.js"
import { 
  TrendingUp, 
  Lock, 
  LockOpen, 
  BarChart3, 
  ChevronDown, 
  ExternalLink, 
  Clock,
  DollarSign,
  Users,
  Activity,
  TrendingDown,
  Zap,
  Award,
  RefreshCw,
  Copy,
  Check
} from "lucide-react"
import { 
  LineChart, 
  Line, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell
} from "recharts"
// Note: Buffer is available globally in Node.js environments
import {
  getCreatorRewards,
  getRewardsHistory,
  formatRewardsChartData,
  getSolPrice,
  type CreatorReward,
  type RewardsHistory
} from "@/lib/pumpfun-service"

export function CreatorHubEnhanced() {
  const { publicKey, signTransaction, sendTransaction } = useWallet()
  const { connection } = useConnection()

  // State management
  const [autoCollectThreshold, setAutoCollectThreshold] = useState(101)
  const [isLocked, setIsLocked] = useState(false)
  const [refreshProgress, setRefreshProgress] = useState(360)
  const [manualInput, setManualInput] = useState("101.00")
  const [selectedPeriod, setSelectedPeriod] = useState<"1D" | "1W" | "1M" | "3M" | "1Y" | "ALL">("1W")
  const [chartType, setChartType] = useState<"line" | "bar" | "area">("area")
  const [isShaking, setIsShaking] = useState(false)
  const [isLoadingValues, setIsLoadingValues] = useState(true)
  const [loadingBarProgress, setLoadingBarProgress] = useState(0)
  const [openFaqItems, setOpenFaqItems] = useState<Set<string>>(new Set())
  const [isClaiming, setIsClaiming] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [copiedAddress, setCopiedAddress] = useState(false)
  
  // Data state
  const [creatorRewards, setCreatorRewards] = useState<CreatorReward[]>([])
  const [rewardsHistory, setRewardsHistory] = useState<RewardsHistory[]>([])
  const [solPrice, setSolPrice] = useState(150)
  const [totalRewards, setTotalRewards] = useState(0)
  const [unclaimedBalance, setUnclaimedBalance] = useState(0)
  const [totalVolume, setTotalVolume] = useState(0)
  const [totalHolders, setTotalHolders] = useState(0)

  // Loading effect
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

  // Refresh timer
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshProgress((prev) => {
        const newProgress = prev - 12
        if (newProgress <= 0) {
          handleRefreshData()
          return 360
        }
        return newProgress
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [publicKey])

  // Load data when wallet connects
  useEffect(() => {
    if (publicKey) {
      loadWalletData()
    }
  }, [publicKey])

  // Load SOL price
  useEffect(() => {
    getSolPrice().then(setSolPrice)
  }, [])

  // Auto-collect threshold sync
  useEffect(() => {
    setManualInput(autoCollectThreshold > 100 ? "101.00" : autoCollectThreshold.toFixed(2))
  }, [autoCollectThreshold])

  // Load wallet data
  const loadWalletData = async () => {
    if (!publicKey) return

    setIsLoadingValues(true)
    try {
      const [rewards, history, price] = await Promise.all([
        getCreatorRewards(publicKey.toBase58()),
        getRewardsHistory(publicKey.toBase58()),
        getSolPrice()
      ])

      setCreatorRewards(rewards)
      setRewardsHistory(history)
      setSolPrice(price)

      // Calculate totals
      const totalCollected = rewards.reduce((sum, r) => sum + r.totalFeesCollected, 0)
      const totalUnclaimed = rewards.reduce((sum, r) => sum + r.unclaimedFees, 0)
      const totalVol = rewards.reduce((sum, r) => sum + r.totalVolume, 0)
      const totalHold = rewards.reduce((sum, r) => sum + r.holders, 0)

      setTotalRewards(totalCollected)
      setUnclaimedBalance(totalUnclaimed)
      setTotalVolume(totalVol)
      setTotalHolders(totalHold)
    } catch (error) {
      console.error("Error loading wallet data:", error)
    } finally {
      setIsLoadingValues(false)
    }
  }

  // Refresh data
  const handleRefreshData = async () => {
    if (!publicKey || isRefreshing) return

    setIsRefreshing(true)
    setIsShaking(true)
    
    try {
      await loadWalletData()
    } finally {
      setIsRefreshing(false)
      setTimeout(() => setIsShaking(false), 500)
    }
  }

  // Handle manual refresh click
  const handleRefreshClick = () => {
    setRefreshProgress(360)
    handleRefreshData()
  }

  // Copy wallet address
  const copyWalletAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toBase58())
      setCopiedAddress(true)
      setTimeout(() => setCopiedAddress(false), 2000)
    }
  }

  // Generate threshold values
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

  // Handle manual input
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

  // Handle collect click
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

      const txBuffer = Uint8Array.from(atob(data.transaction), c => c.charCodeAt(0))
      let transaction: Transaction | VersionedTransaction

      try {
        transaction = VersionedTransaction.deserialize(txBuffer)
      } catch {
        transaction = Transaction.from(txBuffer as Buffer)
      }

      const signedTx = await signTransaction(transaction)
      const signature = await connection.sendRawTransaction(signedTx.serialize())
      await connection.confirmTransaction(signature, "confirmed")

      alert(`Successfully claimed ${unclaimedBalance.toFixed(4)} SOL!`)
      
      // Refresh data
      await loadWalletData()
    } catch (error) {
      console.error("Error claiming rewards:", error)
      alert(`Failed to claim rewards: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsClaiming(false)
    }
  }

  // Format functions
  const formatThreshold = (value: number) => {
    if (value > 100) return "Do not collect"
    return `${value.toFixed(2)} SOL`
  }

  const formatWalletAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(2)}K`
    return num.toFixed(2)
  }

  const formatUSD = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  // Chart data
  const chartData = useMemo(() => {
    return formatRewardsChartData(rewardsHistory, selectedPeriod)
  }, [rewardsHistory, selectedPeriod])

  // Top tokens pie chart data
  const topTokensData = useMemo(() => {
    const sorted = [...creatorRewards].sort((a, b) => b.totalFeesCollected - a.totalFeesCollected).slice(0, 5)
    const colors = ['#00ff00', '#00dd00', '#00bb00', '#009900', '#007700']
    
    return sorted.map((token, index) => ({
      name: token.tokenInfo.symbol,
      value: token.totalFeesCollected,
      color: colors[index]
    }))
  }, [creatorRewards])

  // Toggle FAQ
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
      question: "Where are the creator fees coming from?",
      answer: "When users trade your tokens on pump.fun, you earn 1% of all trading fees as the creator. These fees accumulate in your creator account and can be claimed at any time."
    },
    {
      id: "how-much",
      question: "How much can I earn?",
      answer: "You earn 1% of all trading volume on your tokens. The more popular and actively traded your tokens are, the more fees you'll collect. Successful tokens can generate significant ongoing revenue."
    },
    {
      id: "auto-collect",
      question: "What is auto-collect?",
      answer: "Auto-collect automatically claims your creator fees when they reach a specified threshold. This ensures you regularly receive your earnings without manual intervention."
    },
    {
      id: "graduated",
      question: "What happens when a token graduates?",
      answer: "When your token reaches ~$69k market cap, it graduates from the bonding curve to Raydium. You continue earning fees from all trading activity, including on Raydium."
    }
  ]

  if (!publicKey) {
    return (
      <div className="space-y-6">
        <div
          className="border p-12 text-center shadow-[0_0_20px_rgba(255,255,255,0.08)]"
          style={{ borderColor: "#2d3748", backgroundColor: "#151922" }}
        >
          <div className="flex justify-center mb-6">
            <Zap className="w-16 h-16 text-[#00ff00]" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-[#a0aec0] mb-6">
            Connect your wallet to view and manage your pump.fun creator rewards
          </p>
          <p className="text-sm text-[#a0aec0]">
            Track your token performance, claim fees, and monitor your earnings in real-time
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className="border p-4 shadow-[0_0_20px_rgba(0,255,0,0.1)]"
          style={{ borderColor: "#2d3748", backgroundColor: "#151922" }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#a0aec0] text-sm">Total Earned</span>
            <DollarSign className="w-4 h-4 text-[#00ff00]" />
          </div>
          <div className="text-2xl font-bold text-white">
            {isLoadingValues ? "..." : `${totalRewards.toFixed(4)} SOL`}
          </div>
          <div className="text-sm text-[#00ff00]">
            {formatUSD(totalRewards * solPrice)}
          </div>
        </div>

        <div
          className="border p-4 shadow-[0_0_20px_rgba(0,255,0,0.1)]"
          style={{ borderColor: "#2d3748", backgroundColor: "#151922" }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#a0aec0] text-sm">Unclaimed</span>
            <Clock className="w-4 h-4 text-yellow-500" />
          </div>
          <div className="text-2xl font-bold text-white">
            {isLoadingValues ? "..." : `${unclaimedBalance.toFixed(4)} SOL`}
          </div>
          <div className="text-sm text-yellow-500">
            {formatUSD(unclaimedBalance * solPrice)}
          </div>
        </div>

        <div
          className="border p-4 shadow-[0_0_20px_rgba(0,255,0,0.1)]"
          style={{ borderColor: "#2d3748", backgroundColor: "#151922" }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#a0aec0] text-sm">Total Volume</span>
            <Activity className="w-4 h-4 text-[#00ff00]" />
          </div>
          <div className="text-2xl font-bold text-white">
            {isLoadingValues ? "..." : `${formatNumber(totalVolume)} SOL`}
          </div>
          <div className="text-sm text-[#a0aec0]">
            {formatUSD(totalVolume * solPrice)}
          </div>
        </div>

        <div
          className="border p-4 shadow-[0_0_20px_rgba(0,255,0,0.1)]"
          style={{ borderColor: "#2d3748", backgroundColor: "#151922" }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#a0aec0] text-sm">Total Holders</span>
            <Users className="w-4 h-4 text-[#00ff00]" />
          </div>
          <div className="text-2xl font-bold text-white">
            {isLoadingValues ? "..." : formatNumber(totalHolders)}
          </div>
          <div className="text-sm text-[#a0aec0]">
            Across {creatorRewards.length} tokens
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart Section */}
        <div
          className="border p-6 shadow-[0_0_20px_rgba(255,255,255,0.08)]"
          style={{ borderColor: "#2d3748", backgroundColor: "#151922" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#00ff00]">Earnings Chart</h2>
            <div className="flex items-center gap-2">
              {/* Period Selector */}
              <div className="flex gap-1">
                {(["1D", "1W", "1M", "3M", "1Y", "ALL"] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={`px-3 py-1 text-xs font-mono transition-colors ${
                      selectedPeriod === period
                        ? "text-[#00ff00] bg-[#00ff00]/10 border border-[#00ff00]"
                        : "text-white border border-[#2d3748] hover:border-[#00ff00]"
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>

              {/* Chart Type Selector */}
              <div className="flex gap-1 ml-2">
                <button
                  onClick={() => setChartType("area")}
                  className={`p-1.5 border transition-colors ${
                    chartType === "area"
                      ? "border-[#00ff00] text-[#00ff00]"
                      : "border-[#2d3748] text-white hover:border-[#00ff00]"
                  }`}
                  title="Area chart"
                >
                  <TrendingUp className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setChartType("bar")}
                  className={`p-1.5 border transition-colors ${
                    chartType === "bar"
                      ? "border-[#00ff00] text-[#00ff00]"
                      : "border-[#2d3748] text-white hover:border-[#00ff00]"
                  }`}
                  title="Bar chart"
                >
                  <BarChart3 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="h-64">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                {chartType === "area" ? (
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                    <XAxis dataKey="label" stroke="#a0aec0" />
                    <YAxis stroke="#a0aec0" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#151922",
                        border: "1px solid #2d3748",
                        borderRadius: "4px"
                      }}
                      labelStyle={{ color: "#a0aec0" }}
                      itemStyle={{ color: "#00ff00" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#00ff00"
                      fill="url(#colorGradient)"
                      strokeWidth={2}
                    />
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00ff00" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#00ff00" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                  </AreaChart>
                ) : chartType === "bar" ? (
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                    <XAxis dataKey="label" stroke="#a0aec0" />
                    <YAxis stroke="#a0aec0" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#151922",
                        border: "1px solid #2d3748",
                        borderRadius: "4px"
                      }}
                      labelStyle={{ color: "#a0aec0" }}
                      itemStyle={{ color: "#00ff00" }}
                    />
                    <Bar dataKey="value" fill="#00ff00" />
                  </BarChart>
                ) : (
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                    <XAxis dataKey="label" stroke="#a0aec0" />
                    <YAxis stroke="#a0aec0" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#151922",
                        border: "1px solid #2d3748",
                        borderRadius: "4px"
                      }}
                      labelStyle={{ color: "#a0aec0" }}
                      itemStyle={{ color: "#00ff00" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#00ff00"
                      strokeWidth={2}
                      dot={{ fill: "#00ff00", r: 4 }}
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-[#a0aec0]">
                No data available for the selected period
              </div>
            )}
          </div>
        </div>

        {/* Top Tokens Distribution */}
        <div
          className="border p-6 shadow-[0_0_20px_rgba(255,255,255,0.08)]"
          style={{ borderColor: "#2d3748", backgroundColor: "#151922" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#00ff00]">Top Earners</h2>
            <Award className="w-5 h-5 text-[#00ff00]" />
          </div>

          {topTokensData.length > 0 ? (
            <div className="flex items-center gap-6">
              <div className="h-48 flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={topTokensData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={2}
                    >
                      {topTokensData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#151922",
                        border: "1px solid #2d3748",
                        borderRadius: "4px"
                      }}
                      formatter={(value: number) => `${value.toFixed(4)} SOL`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2">
                {topTokensData.map((token, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: token.color }}
                    />
                    <span className="text-white text-sm">{token.name}</span>
                    <span className="text-[#a0aec0] text-xs">
                      {token.value.toFixed(3)} SOL
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-[#a0aec0]">
              No tokens created yet
            </div>
          )}
        </div>
      </div>

      {/* Collection Settings */}
      <div
        className="border p-6 shadow-[0_0_20px_rgba(255,255,255,0.08)]"
        style={{ borderColor: "#2d3748", backgroundColor: "#151922" }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-white">Collection Settings</h2>
            <button
              onClick={copyWalletAddress}
              className="flex items-center gap-2 px-3 py-1 text-sm border border-[#2d3748] text-[#a0aec0] hover:border-[#00ff00] hover:text-[#00ff00] transition-colors"
            >
              {copiedAddress ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {formatWalletAddress(publicKey.toBase58())}
            </button>
          </div>

          <button
            onClick={handleRefreshClick}
            className={`flex items-center gap-2 px-4 py-2 border transition-colors ${
              isRefreshing
                ? "border-[#00ff00] text-[#00ff00] bg-[#00ff00]/10"
                : "border-[#2d3748] text-white hover:border-[#00ff00] hover:text-[#00ff00]"
            }`}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-white">Auto-Collect Threshold</span>
              <input
                type="text"
                value={manualInput}
                onChange={handleManualInputChange}
                onBlur={handleManualInputBlur}
                disabled={isLocked}
                className="w-24 px-2 py-1 text-right bg-[#0a0e1a] border border-[#2d3748] text-white focus:border-[#00ff00] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1">
                <input
                  type="range"
                  min={0}
                  max={thresholdValues.length - 1}
                  step={1}
                  value={thresholdValues.indexOf(autoCollectThreshold)}
                  onChange={(e) => setAutoCollectThreshold(thresholdValues[Number(e.target.value)])}
                  disabled={isLocked}
                  className="w-full"
                  style={{
                    background: `linear-gradient(to right, ${
                      isLocked ? "#ff0000" : "#00ff00"
                    } 0%, ${
                      isLocked ? "#ff0000" : "#00ff00"
                    } ${
                      (thresholdValues.indexOf(autoCollectThreshold) / (thresholdValues.length - 1)) * 100
                    }%, #2d3748 ${
                      (thresholdValues.indexOf(autoCollectThreshold) / (thresholdValues.length - 1)) * 100
                    }%, #2d3748 100%)`
                  }}
                />
              </div>

              <button
                onClick={() => setIsLocked(!isLocked)}
                className={`p-2 border transition-colors ${
                  isLocked
                    ? "border-[#ff0000] text-[#ff0000] hover:bg-[#ff0000] hover:text-white"
                    : "border-[#2d3748] text-white hover:border-[#00ff00] hover:text-[#00ff00]"
                }`}
              >
                {isLocked ? <Lock className="w-4 h-4" /> : <LockOpen className="w-4 h-4" />}
              </button>
            </div>

            <p className="text-xs text-[#a0aec0] mt-2">
              {formatThreshold(autoCollectThreshold)}
            </p>
          </div>

          <div className="flex items-center justify-center">
            <button
              onClick={handleCollectClick}
              disabled={unclaimedBalance === 0 || isClaiming}
              className={`px-8 py-3 font-bold transition-all ${
                unclaimedBalance > 0 && !isClaiming
                  ? "bg-[#00ff00] text-black hover:bg-[#00dd00] cursor-pointer shadow-[0_0_20px_rgba(0,255,0,0.3)]"
                  : "bg-[#2d3748] text-[#a0aec0] cursor-not-allowed"
              } ${isShaking ? "animate-pulse" : ""}`}
            >
              {isClaiming ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Claiming...
                </span>
              ) : (
                `Collect ${unclaimedBalance.toFixed(4)} SOL (${formatUSD(unclaimedBalance * solPrice)})`
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tokens List */}
      <div
        className="border p-6 shadow-[0_0_20px_rgba(255,255,255,0.08)]"
        style={{ borderColor: "#2d3748", backgroundColor: "#151922" }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#00ff00]">Your Tokens</h2>
          <span className="text-sm text-[#a0aec0]">{creatorRewards.length} total</span>
        </div>

        {creatorRewards.length > 0 ? (
          <div className="space-y-3">
            {creatorRewards.map((token, index) => (
              <div
                key={index}
                className="p-4 border border-[#2d3748] bg-[#0a0e1a] hover:bg-[#151922] transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {token.tokenInfo.image ? (
                      <img
                        src={token.tokenInfo.image}
                        alt={token.tokenInfo.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-[#2d3748] rounded-full flex items-center justify-center text-[#00ff00] font-bold">
                        {token.tokenInfo.symbol?.charAt(0) || "?"}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold">{token.tokenInfo.name}</span>
                        {token.isGraduated && (
                          <span className="px-2 py-0.5 text-xs bg-[#00ff00] text-black font-bold rounded">
                            GRADUATED
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-[#a0aec0]">{token.tokenInfo.symbol}</span>
                        <span className="text-[#a0aec0]">{token.holders} holders</span>
                        {token.priceChange24h !== undefined && (
                          <span className={token.priceChange24h >= 0 ? "text-[#00ff00]" : "text-red-500"}>
                            {token.priceChange24h >= 0 ? <TrendingUp className="inline w-3 h-3" /> : <TrendingDown className="inline w-3 h-3" />}
                            {Math.abs(token.priceChange24h).toFixed(1)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {token.bondingCurveProgress !== undefined && token.bondingCurveProgress < 100 && (
                      <div className="text-center">
                        <div className="text-xs text-[#a0aec0] mb-1">Bonding</div>
                        <div className="w-24 h-2 bg-[#2d3748] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#00ff00] transition-all"
                            style={{ width: `${token.bondingCurveProgress}%` }}
                          />
                        </div>
                        <div className="text-xs text-[#00ff00] mt-1">
                          {token.bondingCurveProgress.toFixed(1)}%
                        </div>
                      </div>
                    )}

                    <div className="text-right">
                      <div className="text-[#00ff00] font-bold">
                        {token.totalFeesCollected.toFixed(4)} SOL
                      </div>
                      <div className="text-xs text-[#a0aec0]">
                        {formatUSD(token.totalFeesCollected * solPrice)}
                      </div>
                      {token.unclaimedFees > 0 && (
                        <div className="text-xs text-yellow-500 mt-1">
                          +{token.unclaimedFees.toFixed(4)} unclaimed
                        </div>
                      )}
                    </div>

                    <a
                      href={`https://pump.fun/${token.mint}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#00ff00] hover:text-[#00dd00] transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-white">
            <p>No tokens created yet</p>
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

      {/* Collection History */}
      {rewardsHistory.length > 0 && (
        <div
          className="border p-6 shadow-[0_0_20px_rgba(255,255,255,0.08)]"
          style={{ borderColor: "#2d3748", backgroundColor: "#151922" }}
        >
          <h2 className="text-xl font-bold text-white mb-4">Collection History</h2>
          <div className="space-y-2">
            {rewardsHistory.slice(0, 10).map((claim, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border border-[#2d3748] bg-[#0a0e1a] text-sm"
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-[#00ff00]" />
                  <span className="text-[#a0aec0]">
                    {new Date(claim.timestamp * 1000).toLocaleDateString()}
                  </span>
                  <span className="text-white text-xs">{claim.description}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[#00ff00] font-bold">
                    +{claim.amount.toFixed(4)} SOL ({formatUSD(claim.amount * solPrice)})
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

      {/* FAQ Section */}
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
