import { NavLink, Outlet, useParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Inbox } from 'lucide-react';

const tabs = [
  { path: '', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { path: 'queues', label: 'Queues', icon: Inbox },
];

export function BmqLayout() {
  const { connId } = useParams();
  const basePath = `/c/${connId}/bullmq`;

  return (
    <div>
      <nav className="mb-6 flex items-center gap-1 overflow-x-auto border-b border-border pb-px">
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path ? `${basePath}/${tab.path}` : basePath}
            end={tab.end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2.5 text-xs font-medium transition-colors',
                isActive ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground',
              )
            }
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  );
}
