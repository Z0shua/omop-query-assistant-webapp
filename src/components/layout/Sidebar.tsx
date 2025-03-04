
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Search, 
  History, 
  Settings, 
  Database, 
  ChevronLeft,
  HelpCircle,
  FileText
} from 'lucide-react';

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Query Builder', path: '/query', icon: Search },
    { name: 'Query History', path: '/history', icon: History },
    { name: 'Database Info', path: '/database', icon: Database },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <aside 
      className={`fixed left-0 h-full z-40 transition-all duration-300 ease-in-out pt-16 ${
        collapsed 
          ? 'w-16 sm:w-16' 
          : 'w-64 sm:w-64'
      } bg-sidebar border-r border-sidebar-border hidden sm:block`}
    >
      <div className="h-full flex flex-col justify-between py-6">
        <nav className="px-2 space-y-1">
          {navItems.map((item) => (
            <Link 
              key={item.name}
              to={item.path}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive(item.path) 
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
              }`}
            >
              <item.icon className={`h-5 w-5 ${collapsed ? 'mx-auto' : 'mr-3'}`} />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>

        <div className="px-2 space-y-2">
          <Link
            to="/help"
            className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-colors"
          >
            <HelpCircle className={`h-5 w-5 ${collapsed ? 'mx-auto' : 'mr-3'}`} />
            {!collapsed && <span>Help & Documentation</span>}
          </Link>
          
          <Link
            to="/examples"
            className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-colors"
          >
            <FileText className={`h-5 w-5 ${collapsed ? 'mx-auto' : 'mr-3'}`} />
            {!collapsed && <span>Example Queries</span>}
          </Link>
          
          <div className="border-t border-sidebar-border pt-2 mt-2">
            <Button
              variant="ghost"
              onClick={() => setCollapsed(!collapsed)}
              className="w-full justify-center"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <ChevronLeft className={`h-5 w-5 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
              {!collapsed && <span className="ml-2">Collapse</span>}
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
