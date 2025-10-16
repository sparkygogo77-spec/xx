import { NextResponse } from "next/server"
import { 
  getCreatorRewards, 
  getRewardsHistory, 
  getSolPrice,
  type CreatorReward,
  type RewardsHistory
} from "@/lib/pumpfun-service"

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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get("wallet")

    if (!walletAddress) {
      return NextResponse.json({ error: "Wallet address required" }, { status: 400 })
    }

    // Check cache first
    const cacheKey = `rewards-${walletAddress}`
    const cached = getCached(cacheKey)
    if (cached) {
      return NextResponse.json(cached)
    }

    // Fetch fresh data
    const [rewards, history, solPrice] = await Promise.all([
      getCreatorRewards(walletAddress),
      getRewardsHistory(walletAddress),
      getSolPrice()
    ])

    // Calculate totals
    const totalCollected = rewards.reduce((sum: number, r: CreatorReward) => sum + r.totalFeesCollected, 0)
    const totalUnclaimed = rewards.reduce((sum: number, r: CreatorReward) => sum + r.unclaimedFees, 0)
    const totalVolume = rewards.reduce((sum: number, r: CreatorReward) => sum + r.totalVolume, 0)
    const totalHolders = rewards.reduce((sum: number, r: CreatorReward) => sum + r.holders, 0)

    const response = {
      success: true,
      data: {
        rewards,
        history,
        totals: {
          collected: totalCollected,
          unclaimed: totalUnclaimed,
          volume: totalVolume,
          holders: totalHolders,
          tokensCreated: rewards.length
        },
        solPrice
      }
    }

    // Cache the response
    setCache(cacheKey, response)

    return NextResponse.json(response)
  } catch (error: any) {
    console.error("[API] Error fetching rewards:", error?.message || error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch creator rewards",
        details: error?.message || "Unknown error",
        data: {
          rewards: [],
          history: [],
          totals: {
            collected: 0,
            unclaimed: 0,
            volume: 0,
            holders: 0,
            tokensCreated: 0
          },
          solPrice: 150
        }
      },
      { status: 200 } // Return 200 to avoid breaking the UI
    )
  }
}

export async function POST(request: Request) {
  try {
    const { wallet, action } = await request.json()

    if (!wallet) {
      return NextResponse.json({ error: "Wallet address required" }, { status: 400 })
    }

    // Handle cache invalidation
    if (action === "refresh") {
      const cacheKey = `rewards-${wallet}`
      cache.delete(cacheKey)
      
      // Fetch fresh data
      const [rewards, history, solPrice] = await Promise.all([
        getCreatorRewards(wallet),
        getRewardsHistory(wallet),
        getSolPrice()
      ])

      const totalCollected = rewards.reduce((sum: number, r: CreatorReward) => sum + r.totalFeesCollected, 0)
      const totalUnclaimed = rewards.reduce((sum: number, r: CreatorReward) => sum + r.unclaimedFees, 0)
      const totalVolume = rewards.reduce((sum: number, r: CreatorReward) => sum + r.totalVolume, 0)
      const totalHolders = rewards.reduce((sum: number, r: CreatorReward) => sum + r.holders, 0)

      const response = {
        success: true,
        refreshed: true,
        data: {
          rewards,
          history,
          totals: {
            collected: totalCollected,
            unclaimed: totalUnclaimed,
            volume: totalVolume,
            holders: totalHolders,
            tokensCreated: rewards.length
          },
          solPrice
        }
      }

      setCache(cacheKey, response)
      return NextResponse.json(response)
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error: any) {
    console.error("[API] Error in POST:", error?.message || error)
    return NextResponse.json(
      { error: "Failed to process request", details: error?.message || "Unknown error" },
      { status: 500 }
    )
  }
}