"use client"

import { Flame, Sparkles, Coins, ImageIcon, FileCode, Globe, Droplet, HelpCircle } from "lucide-react"

interface SidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const navItems = [
    { id: "creator-hub", label: "Creator Hub", icon: Sparkles },
    { id: "cleanup", label: "Cleanup", icon: Flame },
    { id: "tokens", label: "Tokens", icon: Coins },
    { id: "nfts", label: "NFTs", icon: ImageIcon },
    { id: "cnfts", label: "cNFTs", icon: FileCode },
    { id: "domains", label: "Domains", icon: Globe },
    { id: "lp", label: "LP", icon: Droplet },
    { id: "unknown", label: "Unknown", icon: HelpCircle },
  ]

  return (
    <aside
      className="fixed left-0 top-[73px] bottom-[73px] w-64 border-r overflow-y-auto"
      style={{ backgroundColor: "#151922", borderColor: "#2d3748" }}
    >
      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeSection === item.id

          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                isActive
                  ? "bg-[#00ff00] text-black font-bold"
                  : "text-[#a0aec0] hover:bg-[#1a1f2e] hover:text-[#00ff00]"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm">{item.label}</span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
