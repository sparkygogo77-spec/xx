import { useState, useEffect, useCallback } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import {
  getCreatorRewards,
  getRewardsHistory,
  getSolPrice,
  type CreatorReward,
  type RewardsHistory,
  type ChartDataPoint
} from '@/lib/pumpfun-service'

export interface PumpFunData {
  rewards: CreatorReward[]
  history: RewardsHistory[]
  solPrice: number
  totals: {
    collected: number
    unclaimed: number
    volume: number
    holders: number
    tokensCreated: number
  }
}

export function usePumpFunData() {
  const { publicKey } = useWallet()
  const [data, setData] = useState<PumpFunData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!publicKey) {
      setData(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Try to fetch from API first (with caching)
      const response = await fetch(`/api/pumpfun-rewards?wallet=${publicKey.toBase58()}`)
      
      if (response.ok) {
        const apiData = await response.json()
        
        if (apiData.success && apiData.data) {
          setData({
            rewards: apiData.data.rewards || [],
            history: apiData.data.history || [],
            solPrice: apiData.data.solPrice || 150,
            totals: apiData.data.totals || {
              collected: 0,
              unclaimed: 0,
              volume: 0,
              holders: 0,
              tokensCreated: 0
            }
          })
          return
        }
      }
      
      // Fallback to direct service calls
      const [rewards, history, solPrice] = await Promise.all([
        getCreatorRewards(publicKey.toBase58()),
        getRewardsHistory(publicKey.toBase58()),
        getSolPrice()
      ])

      const totals = {
        collected: rewards.reduce((sum, r) => sum + r.totalFeesCollected, 0),
        unclaimed: rewards.reduce((sum, r) => sum + r.unclaimedFees, 0),
        volume: rewards.reduce((sum, r) => sum + r.totalVolume, 0),
        holders: rewards.reduce((sum, r) => sum + r.holders, 0),
        tokensCreated: rewards.length
      }

      setData({
        rewards,
        history,
        solPrice,
        totals
      })
    } catch (err) {
      console.error('Error fetching PumpFun data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
      
      // Set default data on error
      setData({
        rewards: [],
        history: [],
        solPrice: 150,
        totals: {
          collected: 0,
          unclaimed: 0,
          volume: 0,
          holders: 0,
          tokensCreated: 0
        }
      })
    } finally {
      setLoading(false)
    }
  }, [publicKey])

  const refresh = useCallback(async () => {
    if (!publicKey) return

    try {
      // Invalidate cache and refresh
      const response = await fetch('/api/pumpfun-rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet: publicKey.toBase58(),
          action: 'refresh'
        })
      })

      if (response.ok) {
        const apiData = await response.json()
        
        if (apiData.success && apiData.data) {
          setData({
            rewards: apiData.data.rewards || [],
            history: apiData.data.history || [],
            solPrice: apiData.data.solPrice || 150,
            totals: apiData.data.totals || {
              collected: 0,
              unclaimed: 0,
              volume: 0,
              holders: 0,
              tokensCreated: 0
            }
          })
        }
      } else {
        // Fallback to regular fetch
        await fetchData()
      }
    } catch (err) {
      console.error('Error refreshing data:', err)
      await fetchData()
    }
  }, [publicKey, fetchData])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Auto-refresh every 30 seconds if wallet is connected
  useEffect(() => {
    if (!publicKey) return

    const interval = setInterval(() => {
      fetchData()
    }, 30000)

    return () => clearInterval(interval)
  }, [publicKey, fetchData])

  return {
    data,
    loading,
    error,
    refresh,
    refetch: fetchData
  }
}

// Hook for claiming fees
export function useClaimFees() {
  const { publicKey, signTransaction } = useWallet()
  const [claiming, setClaiming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const claim = useCallback(async (amount: number) => {
    if (!publicKey || !signTransaction || amount === 0) {
      setError('Invalid claim request')
      return false
    }

    setClaiming(true)
    setError(null)

    try {
      const response = await fetch('/api/pumpfun-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet: publicKey.toBase58(),
          priorityFee: 0.0001
        })
      })

      const data = await response.json()

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to build claim transaction')
      }

      // Transaction signing and sending would be handled here
      // This is a placeholder - actual implementation would use the connection
      
      return true
    } catch (err) {
      console.error('Error claiming fees:', err)
      setError(err instanceof Error ? err.message : 'Failed to claim fees')
      return false
    } finally {
      setClaiming(false)
    }
  }, [publicKey, signTransaction])

  return {
    claim,
    claiming,
    error
  }
}
