import { Outlet } from 'react-router'
import { Sidebar } from './Sidebar'

export function AppLayout() {
  return (
    <div className="flex min-h-screen bg-page">
      <Sidebar />
      <main className="min-w-0 flex-1 px-8 pt-[30px] pb-16">
        <Outlet />
      </main>
    </div>
  )
}
