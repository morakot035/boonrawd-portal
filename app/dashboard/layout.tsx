import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#F5F0E8' }}>
      <Sidebar />
      {/* pt-14 on mobile for fixed topbar, md:pt-0 on desktop */}
      <main className="flex-1 overflow-auto min-w-0 pt-14 md:pt-0">
        {children}
      </main>
    </div>
  );
}
