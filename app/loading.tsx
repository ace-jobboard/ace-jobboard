import Image from "next/image"

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-6">
      <div className="animate-pulse-soft">
        <Image
          src="/ace-logo.png"
          alt="ACE Education"
          width={140}
          height={46}
          className="h-12 w-auto object-contain opacity-80"
          priority
        />
      </div>
      <div className="flex gap-1.5">
        <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  )
}
