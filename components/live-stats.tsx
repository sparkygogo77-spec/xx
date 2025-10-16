"use client"

import { useState, useEffect } from "react"
import { TrendingUp, TrendingDown } from "lucide-react"

export function LiveStats() {
  const [price, setPrice] = useState<number | null>(null)
  const [priceChange, setPriceChange] = useState<number | null>(null)

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await fetch("/api/sol-price")
        const data = await response.json()
        setPrice(data.price)
        setPriceChange(data.change24h)
      } catch (error) {
        console.error("Failed to fetch price:", error)
      }
    }

    fetchPrice()
    const interval = setInterval(fetchPrice, 30000)
    return () => clearInterval(interval)
  }, [])

  const isPositive = priceChange !== null && priceChange >= 0

  return (
    <div className="flex items-center gap-1">
      <img src="/solana-logo.png" alt="Solana" className="h-6 w-auto" />
      <div className="flex items-center gap-2">
        <span
          className={`font-semibold text-sm ${priceChange !== null ? (isPositive ? "text-[#00ff00]" : "text-red-500") : "text-white"}`}
        >
          ${price !== null ? price.toFixed(2) : "---"}
        </span>
        {priceChange !== null && (
          <div
            className={`flex items-center gap-0.5 text-xs font-medium ${isPositive ? "text-[#00ff00]" : "text-red-500"}`}
          >
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>
              {isPositive ? "+" : ""}
              {priceChange.toFixed(2)}%
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
