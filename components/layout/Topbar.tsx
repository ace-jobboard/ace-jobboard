"use client"

import { Bell, ChevronDown } from "lucide-react"
import AvatarCircle from "@/components/ui/avatar-circle"

interface Props {
  title: string
  userName?: string
}

export default function Topbar({ title, userName = "Admin" }: Props) {
  return (
    <header className="fixed top-0 left-[70px] right-0 h-14 bg-white border-b border-gray-200 flex items-center px-6 gap-4 z-40">
      <h1 className="text-base font-semibold text-navy flex-1">{title}</h1>

      <div className="flex items-center gap-3">
        <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Notifications">
          <Bell size={18} className="text-gray-500" />
        </button>

        <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded-lg transition-colors">
          <AvatarCircle name={userName} size="sm" />
          <span className="text-sm text-gray-700 font-medium hidden sm:block">{userName}</span>
          <ChevronDown size={14} className="text-gray-400" />
        </div>
      </div>
    </header>
  )
}
