import { Connection, PublicKey } from "@solana/web3.js"

// PumpFun program constants
export const PUMPFUN_PROGRAM_ID = "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P"
export const PUMPFUN_FEE_RECIPIENT = "CebN5WGQ4jvEPvsVU4EoHEpgzq1VV7AbicfhtW4xC9iM"

// Token metadata types
export interface TokenMetadata {
  mint: string
  name: string
  symbol: string
  image?: string
  description?: string
  twitter?: string
  telegram?: string
  website?: string
  createdAt?: number
}

// Creator rewards types
export interface CreatorReward {
  mint: string
  tokenInfo: TokenMetadata
  totalFeesCollected: number
  unclaimedFees: number
  lastClaimTime?: number
  totalVolume: number
  holders: number
  marketCap?: number
  priceUSD?: number
  priceChange24h?: number
  bondingCurveProgress?: number
  isGraduated?: boolean
}

// Chart data types
export interface ChartDataPoint {
  timestamp: number
  value: number
  label: string
}

export interface RewardsHistory {
  timestamp: number
  amount: number
  signature: string
  tokenMint: string
  description: string
}

// Helius API configuration
const HELIUS_API_KEY = typeof window === 'undefined' ? process.env.NEXT_PUBLIC_HELIUS_API_KEY || "3a766df3-6f66-4393-aa48-26790fdfc444" : "3a766df3-6f66-4393-aa48-26790fdfc444"
const HELIUS_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`

// Cache management
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

function getCached(key: string) {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }
  return null
}

function setCache(key: string, data: any) {
  cache.set(key, { data, timestamp: Date.now() })
}

// Fetch token metadata from pump.fun API
export async function fetchTokenMetadata(mintAddress: string): Promise<TokenMetadata | null> {
  const cacheKey = `metadata-${mintAddress}`
  const cached = getCached(cacheKey)
  if (cached) return cached

  try {
    const response = await fetch(`https://pump.fun/api/token/${mintAddress}`)
    if (!response.ok) return null
    
    const data = await response.json()
    
    const metadata: TokenMetadata = {
      mint: mintAddress,
      name: data.name || "Unknown",
      symbol: data.symbol || "???",
      image: data.image || data.imageUri,
      description: data.description,
      twitter: data.twitter,
      telegram: data.telegram,
      website: data.website,
      createdAt: data.createdAt
    }
    
    setCache(cacheKey, metadata)
    return metadata
  } catch (error) {
    console.error("Error fetching token metadata:", error)
    
    // Fallback to on-chain metadata
    return await fetchOnChainMetadata(mintAddress)
  }
}

// Fetch on-chain metadata using Helius
async function fetchOnChainMetadata(mintAddress: string): Promise<TokenMetadata | null> {
  try {
    const response = await fetch(HELIUS_RPC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "get-asset",
        method: "getAsset",
        params: { id: mintAddress }
      })
    })
    
    if (!response.ok) return null
    
    const data = await response.json()
    
    if (!data.result) return null
    
    const content = data.result.content
    
    return {
      mint: mintAddress,
      name: content?.metadata?.name || "Unknown",
      symbol: content?.metadata?.symbol || "???",
      image: content?.links?.image || content?.files?.[0]?.uri,
      description: content?.metadata?.description
    }
  } catch (error) {
    console.error("Error fetching on-chain metadata:", error)
    return null
  }
}

// Get all tokens created by a wallet on pump.fun
export async function getCreatedTokens(walletAddress: string): Promise<string[]> {
  const cacheKey = `created-tokens-${walletAddress}`
  const cached = getCached(cacheKey)
  if (cached) return cached

  try {
    const connection = new Connection(HELIUS_RPC_URL, "confirmed")
    const walletPubkey = new PublicKey(walletAddress)
    
    // Get all transaction signatures for the wallet
    const signatures = await connection.getSignaturesForAddress(walletPubkey, {
      limit: 1000
    })
    
    const createdMints = new Set<string>()
    
    // Process signatures in batches to find pump.fun creations
    const batchSize = 10
    for (let i = 0; i < signatures.length; i += batchSize) {
      const batch = signatures.slice(i, i + batchSize)
      
      const transactions = await Promise.all(
        batch.map((sig: any) => 
          connection.getParsedTransaction(sig.signature, {
            maxSupportedTransactionVersion: 0
          })
        )
      )
      
      for (const tx of transactions) {
        if (!tx || !tx.meta) continue
        
        // Check if transaction involves pump.fun program
        const involvesPumpFun = tx.transaction.message.accountKeys.some(
          (key: any) => key.pubkey.toString() === PUMPFUN_PROGRAM_ID
        )
        
        if (!involvesPumpFun) continue
        
        // Look for token creation instructions
        const instructions = tx.transaction.message.instructions
        
        for (const ix of instructions) {
          if (ix.programId.toString() === PUMPFUN_PROGRAM_ID) {
            // Parse inner instructions to find mint creation
            if (tx.meta.innerInstructions) {
              for (const inner of tx.meta.innerInstructions) {
                for (const innerIx of inner.instructions) {
                  const parsed = (innerIx as any).parsed
                  if (parsed?.type === "initializeMint" || parsed?.type === "createAccount") {
                    // Extract mint address from the instruction
                    const accounts = (ix as any).accounts
                    if (accounts && accounts.length > 0) {
                      createdMints.add(accounts[0])
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    
    const mints = Array.from(createdMints)
    setCache(cacheKey, mints)
    return mints
  } catch (error) {
    console.error("Error getting created tokens:", error)
    return []
  }
}

// Calculate creator fees for a token
export async function calculateCreatorFees(
  mintAddress: string,
  creatorAddress: string
): Promise<{ collected: number; unclaimed: number }> {
  const cacheKey = `fees-${mintAddress}-${creatorAddress}`
  const cached = getCached(cacheKey)
  if (cached) return cached

  try {
    const connection = new Connection(HELIUS_RPC_URL, "confirmed")
    
    // Get fee account (PDA)
    const [feeAccount] = PublicKey.findProgramAddressSync(
      [
        new TextEncoder().encode("fee_account"),
        new PublicKey(mintAddress).toBuffer(),
        new PublicKey(creatorAddress).toBuffer()
      ],
      new PublicKey(PUMPFUN_PROGRAM_ID)
    )
    
    // Get account info
    const accountInfo = await connection.getAccountInfo(feeAccount)
    
    if (!accountInfo) {
      return { collected: 0, unclaimed: 0 }
    }
    
    // Parse the account data to extract fee information
    // The unclaimed balance is stored in the account's lamports
    const unclaimed = accountInfo.lamports / 1e9
    
    // Get transaction history to calculate total collected
    const signatures = await connection.getSignaturesForAddress(feeAccount, {
      limit: 100
    })
    
    let collected = 0
    
    for (const sig of signatures) {
      const tx = await connection.getParsedTransaction(sig.signature, {
        maxSupportedTransactionVersion: 0
      })
      
      if (!tx || !tx.meta) continue
      
      // Look for SOL transfers from fee account to creator
      const postBalances = tx.meta.postBalances
      const preBalances = tx.meta.preBalances
      
      const creatorIndex = tx.transaction.message.accountKeys.findIndex(
        (key: any) => key.pubkey.toString() === creatorAddress
      )
      
      if (creatorIndex >= 0) {
        const balanceChange = (postBalances[creatorIndex] - preBalances[creatorIndex]) / 1e9
        if (balanceChange > 0) {
          collected += balanceChange
        }
      }
    }
    
    const fees = { collected, unclaimed }
    setCache(cacheKey, fees)
    return fees
  } catch (error) {
    console.error("Error calculating creator fees:", error)
    return { collected: 0, unclaimed: 0 }
  }
}

// Get token stats (holders, volume, etc.)
export async function getTokenStats(mintAddress: string): Promise<{
  holders: number
  volume24h: number
  marketCap: number
  priceUSD: number
  priceChange24h: number
  bondingCurveProgress: number
  isGraduated: boolean
}> {
  const cacheKey = `stats-${mintAddress}`
  const cached = getCached(cacheKey)
  if (cached) return cached

  try {
    // Try to fetch from pump.fun API
    const response = await fetch(`https://pump.fun/api/token/${mintAddress}/stats`)
    
    if (response.ok) {
      const data = await response.json()
      
      const stats = {
        holders: data.holders || 0,
        volume24h: data.volume24h || 0,
        marketCap: data.marketCap || 0,
        priceUSD: data.priceUSD || 0,
        priceChange24h: data.priceChange24h || 0,
        bondingCurveProgress: data.bondingCurveProgress || 0,
        isGraduated: data.isGraduated || false
      }
      
      setCache(cacheKey, stats)
      return stats
    }
    
    // Fallback to calculating from chain
    return await calculateTokenStatsFromChain(mintAddress)
  } catch (error) {
    console.error("Error getting token stats:", error)
    return {
      holders: 0,
      volume24h: 0,
      marketCap: 0,
      priceUSD: 0,
      priceChange24h: 0,
      bondingCurveProgress: 0,
      isGraduated: false
    }
  }
}

// Calculate token stats from chain data
async function calculateTokenStatsFromChain(mintAddress: string) {
  try {
    const connection = new Connection(HELIUS_RPC_URL, "confirmed")
    const mintPubkey = new PublicKey(mintAddress)
    
    // Get token supply
    const supply = await connection.getTokenSupply(mintPubkey)
    const totalSupply = Number(supply.value.amount) / Math.pow(10, supply.value.decimals)
    
    // Get token accounts to count holders
    const tokenAccounts = await connection.getParsedProgramAccounts(
      new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
      {
        filters: [
          { dataSize: 165 },
          { memcmp: { offset: 0, bytes: mintAddress } }
        ]
      }
    )
    
    const holders = tokenAccounts.length
    
    // Calculate bonding curve progress (simplified)
    // Pump.fun graduates to Raydium at ~$69k market cap
    const GRADUATION_MARKET_CAP = 69000
    const estimatedMarketCap = holders * 100 // Very rough estimate
    const bondingCurveProgress = Math.min(100, (estimatedMarketCap / GRADUATION_MARKET_CAP) * 100)
    
    return {
      holders,
      volume24h: 0, // Would need to analyze recent transactions
      marketCap: estimatedMarketCap,
      priceUSD: estimatedMarketCap / totalSupply,
      priceChange24h: 0,
      bondingCurveProgress,
      isGraduated: bondingCurveProgress >= 100
    }
  } catch (error) {
    console.error("Error calculating stats from chain:", error)
    return {
      holders: 0,
      volume24h: 0,
      marketCap: 0,
      priceUSD: 0,
      priceChange24h: 0,
      bondingCurveProgress: 0,
      isGraduated: false
    }
  }
}

// Get all creator rewards for a wallet
export async function getCreatorRewards(walletAddress: string): Promise<CreatorReward[]> {
  try {
    // Get all tokens created by the wallet
    const createdMints = await getCreatedTokens(walletAddress)
    
    if (createdMints.length === 0) {
      return []
    }
    
    // Fetch data for each token in parallel
    const rewards = await Promise.all(
      createdMints.map(async (mint) => {
        const [metadata, fees, stats] = await Promise.all([
          fetchTokenMetadata(mint),
          calculateCreatorFees(mint, walletAddress),
          getTokenStats(mint)
        ])
        
        return {
          mint,
          tokenInfo: metadata || {
            mint,
            name: "Unknown",
            symbol: "???"
          },
          totalFeesCollected: fees.collected,
          unclaimedFees: fees.unclaimed,
          totalVolume: stats.volume24h * 30, // Rough estimate of total volume
          holders: stats.holders,
          marketCap: stats.marketCap,
          priceUSD: stats.priceUSD,
          priceChange24h: stats.priceChange24h,
          bondingCurveProgress: stats.bondingCurveProgress,
          isGraduated: stats.isGraduated
        }
      })
    )
    
    // Sort by unclaimed fees (highest first)
    return rewards.sort((a, b) => b.unclaimedFees - a.unclaimedFees)
  } catch (error) {
    console.error("Error getting creator rewards:", error)
    return []
  }
}

// Get rewards history (claims)
export async function getRewardsHistory(walletAddress: string): Promise<RewardsHistory[]> {
  const cacheKey = `history-${walletAddress}`
  const cached = getCached(cacheKey)
  if (cached) return cached

  try {
    const connection = new Connection(HELIUS_RPC_URL, "confirmed")
    const walletPubkey = new PublicKey(walletAddress)
    
    // Get recent transactions
    const signatures = await connection.getSignaturesForAddress(walletPubkey, {
      limit: 100
    })
    
    const history: RewardsHistory[] = []
    
    for (const sig of signatures) {
      const tx = await connection.getParsedTransaction(sig.signature, {
        maxSupportedTransactionVersion: 0
      })
      
      if (!tx || !tx.meta) continue
      
      // Check if this is a pump.fun fee claim
      const involvesPumpFun = tx.transaction.message.accountKeys.some(
        (key: any) => key.pubkey.toString() === PUMPFUN_PROGRAM_ID
      )
      
      if (!involvesPumpFun) continue
      
      // Look for SOL transfers to the wallet
      const walletIndex = tx.transaction.message.accountKeys.findIndex(
        (key: any) => key.pubkey.toString() === walletAddress
      )
      
      if (walletIndex >= 0 && tx.meta.postBalances && tx.meta.preBalances) {
        const balanceChange = (tx.meta.postBalances[walletIndex] - tx.meta.preBalances[walletIndex]) / 1e9
        
        if (balanceChange > 0.01) { // Filter for significant claims
          history.push({
            timestamp: sig.blockTime || Date.now() / 1000,
            amount: balanceChange,
            signature: sig.signature,
            tokenMint: "", // Would need to parse from tx
            description: "Creator Fee Claim"
          })
        }
      }
    }
    
    setCache(cacheKey, history)
    return history
  } catch (error) {
    console.error("Error getting rewards history:", error)
    return []
  }
}

// Format chart data for rewards over time
export function formatRewardsChartData(
  history: RewardsHistory[],
  period: "1D" | "1W" | "1M" | "3M" | "1Y" | "ALL"
): ChartDataPoint[] {
  const now = Date.now() / 1000
  
  const periodSeconds = {
    "1D": 24 * 60 * 60,
    "1W": 7 * 24 * 60 * 60,
    "1M": 30 * 24 * 60 * 60,
    "3M": 90 * 24 * 60 * 60,
    "1Y": 365 * 24 * 60 * 60,
    "ALL": Number.MAX_SAFE_INTEGER
  }
  
  const cutoff = now - periodSeconds[period]
  
  // Filter history by period
  const filtered = history.filter(h => h.timestamp >= cutoff)
  
  // Group by day/week/month based on period
  const grouped = new Map<string, number>()
  
  for (const item of filtered) {
    const date = new Date(item.timestamp * 1000)
    let key: string
    
    if (period === "1D") {
      key = date.toLocaleTimeString("en-US", { hour: "2-digit" })
    } else if (period === "1W") {
      key = date.toLocaleDateString("en-US", { weekday: "short" })
    } else {
      key = date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    }
    
    grouped.set(key, (grouped.get(key) || 0) + item.amount)
  }
  
  // Convert to chart data
  return Array.from(grouped.entries()).map(([label, value]) => ({
    timestamp: Date.now(),
    value,
    label
  }))
}

// Calculate SOL price
export async function getSolPrice(): Promise<number> {
  const cached = getCached("sol-price")
  if (cached) return cached

  try {
    const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd")
    const data = await response.json()
    const price = data.solana?.usd || 0
    
    setCache("sol-price", price)
    return price
  } catch (error) {
    console.error("Error fetching SOL price:", error)
    return 150 // Fallback price
  }
}
