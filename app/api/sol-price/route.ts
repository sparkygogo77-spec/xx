import { NextResponse } from "next/server"

let priceCache: { price: number; change24h: number; timestamp: number } | null = null
const CACHE_DURATION = 15 * 60 * 1000 // 15 minutes

export async function GET() {
  try {
    if (priceCache && Date.now() - priceCache.timestamp < CACHE_DURATION) {
      return NextResponse.json({
        price: priceCache.price,
        change24h: priceCache.change24h,
      })
    }

    try {
      const krakenResponse = await fetch("https://api.kraken.com/0/public/Ticker?pair=SOLUSD", {
        headers: { Accept: "application/json" },
        next: { revalidate: 900 },
      })

      if (krakenResponse.ok) {
        const krakenData = await krakenResponse.json()

        if (krakenData.result && krakenData.result.SOLUSD) {
          const price = Number.parseFloat(krakenData.result.SOLUSD.c[0])
          const open = Number.parseFloat(krakenData.result.SOLUSD.o)
          const change24h = ((price - open) / open) * 100

          priceCache = {
            price,
            change24h,
            timestamp: Date.now(),
          }

          return NextResponse.json({
            price: priceCache.price,
            change24h: priceCache.change24h,
          })
        }
      }
    } catch (krakenError) {
      console.log("[v0] Kraken API failed, trying CoinGecko")
    }

    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd&include_24hr_change=true",
      {
        headers: { Accept: "application/json" },
        next: { revalidate: 900 },
      },
    )

    if (!response.ok) {
      console.log("[v0] CoinGecko API error:", response.status)
      if (priceCache) {
        return NextResponse.json({
          price: priceCache.price,
          change24h: priceCache.change24h,
        })
      }
      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    const data = await response.json()

    priceCache = {
      price: data.solana?.usd || 0,
      change24h: data.solana?.usd_24h_change || 0,
      timestamp: Date.now(),
    }

    return NextResponse.json({
      price: priceCache.price,
      change24h: priceCache.change24h,
    })
  } catch (error) {
    console.log("[v0] Error fetching SOL price, using fallback")
    if (priceCache) {
      return NextResponse.json({
        price: priceCache.price,
        change24h: priceCache.change24h,
      })
    }
    return NextResponse.json({ price: 200, change24h: 0 }, { status: 200 })
  }
}
