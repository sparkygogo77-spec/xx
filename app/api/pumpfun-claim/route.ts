import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { wallet, priorityFee = 0.0001 } = await request.json()

    if (!wallet) {
      return NextResponse.json({ error: "Wallet address required" }, { status: 400 })
    }

    const response = await fetch("https://pumpportal.fun/api/trade", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "collectCreatorFee",
        publicKey: wallet,
        priorityFee: priorityFee,
        pool: "pump", // pump.fun pool
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] PumpPortal API error:", errorText)
      return NextResponse.json(
        { error: "Failed to build claim transaction", details: errorText },
        { status: response.status },
      )
    }

    const data = await response.json()

    return NextResponse.json({
      transaction: data.transaction || data,
      success: true,
    })
  } catch (error) {
    console.error("[v0] Error building claim transaction:", error)
    return NextResponse.json(
      { error: "Failed to build claim transaction", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}