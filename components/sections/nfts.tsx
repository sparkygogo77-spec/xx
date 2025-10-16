"use client"

export function NFTs() {
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-3xl font-bold text-[#00ff00]">NFTs</h1>
      </div>

      <div
        className="border p-8 text-center space-y-6 shadow-[0_0_20px_rgba(255,255,255,0.08)]"
        style={{ borderColor: "#2d3748", backgroundColor: "#151922" }}
      >
        <h2 className="text-2xl font-bold text-white">All clean!</h2>

        <p className="text-[#a0aec0]">No NFTs found. Ensure you have the correct wallet selected.</p>

        <div className="flex justify-center py-8">
          <img
            src="/question-mark-green.png"
            alt="Question mark"
            className="w-32 h-32 pixelated animate-bounce"
            style={{ imageRendering: "pixelated", filter: "hue-rotate(90deg) saturate(2)" }}
          />
        </div>

        <div className="text-sm text-[#a0aec0] space-y-2">
          <p>Can't find an NFT you're looking for?</p>
          <p>
            It may be in the <span className="text-[#00ff00]">"Unknown"</span> tab accessed by enabling pro mode on the
            bottom left.
          </p>
          <p className="text-xs text-[#718096]">
            This happens when we can't fetch the metadata for the NFT and hide it to prevent accidental burns.
          </p>
        </div>
      </div>
    </div>
  )
}
