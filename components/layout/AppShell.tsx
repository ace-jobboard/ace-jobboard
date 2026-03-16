import Sidebar from "@/components/layout/Sidebar"
import Topbar from "@/components/layout/Topbar"

interface Props {
  children: React.ReactNode
  title?: string
  userName?: string
}

export default function AppShell({ children, title, userName }: Props) {
  return (
    <div className="min-h-screen bg-light">
      <Sidebar />
      <Topbar title={title} userName={userName} />
      <main className="pl-[70px] pt-14 min-h-screen">
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
