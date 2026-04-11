import { Outlet } from 'react-router-dom';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';
import { useSidebarStore } from '@/stores/sidebar-store';
import { cn } from '@/lib/utils';

export function AppLayout() {
  const collapsed = useSidebarStore((s) => s.collapsed);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div
        className={cn(
          'flex flex-1 flex-col overflow-hidden transition-all duration-300',
          collapsed ? 'ml-[60px]' : 'ml-[260px]',
        )}
      >
        <Topbar />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
