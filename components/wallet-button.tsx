"use client"

import type React from "react"

import { useWallet } from "@solana/wallet-adapter-react"
import { useWalletModal } from "@solana/wallet-adapter-react-ui"
import { useEffect, useState, useRef } from "react"

export function WalletButton() {
  const { publicKey, connected, connecting, disconnect } = useWallet()
  const { setVisible } = useWalletModal()
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Auto-open wallet modal on page load if not connected
  useEffect(() => {
    if (!connected && !connecting) {
      // Small delay to ensure UI is ready
      const timer = setTimeout(() => {
        setVisible(true)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [connected, connecting, setVisible])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showDropdown])

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (connected) {
      setShowDropdown(!showDropdown)
    } else {
      setVisible(true)
    }
  }

  const handleDisconnect = () => {
    setShowDropdown(false)
    disconnect()
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleClick}
        className="px-4 py-2 border-2 border-[#00ff00] bg-[#00ff00] text-black hover:bg-[#00dd00] hover:shadow-[0_0_20px_rgba(0,255,0,0.5)] transition-all duration-200 text-sm font-black uppercase tracking-wide"
      >
        {connecting
          ? "connecting..."
          : connected && publicKey
            ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`
            : "connect wallet"}
      </button>

      {showDropdown && connected && (
        <div
          className="absolute top-full mt-2 right-0 border-2 min-w-[200px] z-50 shadow-lg"
          style={{ borderColor: "#4a5568", backgroundColor: "#1a202c" }}
        >
          <button
            onClick={handleDisconnect}
            className="w-full px-4 py-3 text-left text-[#fc8181] hover:bg-[#742a2a] hover:text-white transition-colors text-sm"
          >
            Disconnect wallet
          </button>
        </div>
      )}
    </div>
  )
}
