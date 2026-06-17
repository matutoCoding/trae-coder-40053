import React from 'react';
import {
  LayoutDashboard, ClipboardList, Droplets, Settings,
  Factory, ShieldCheck, Layers, Zap
} from 'lucide-react';
import { useAppStore } from '@/store';
import { cn } from '@/lib/utils';

interface SidebarProps {
  onNavigate: (route: string) => void;
}

const navItems = [
  { id: 'dashboard', name: '生产概览', icon: LayoutDashboard, route: '/dashboard' },
  { id: 'orders', name: '订单排产', icon: ClipboardList, route: '/orders' },
  { id: 'materials', name: '原料配色', icon: Droplets, route: '/materials' },
  { id: 'machines', name: '机台调机', icon: Settings, route: '/machines' },
  { id: 'molding', name: '注塑成型', icon: Factory, route: '/molding' },
  { id: 'quality', name: '产品质检', icon: ShieldCheck, route: '/quality' },
  { id: 'molds', name: '模具管理', icon: Layers, route: '/molds' },
  { id: 'energy', name: '能耗统计', icon: Zap, route: '/energy' },
];

const Sidebar: React.FC<SidebarProps> = ({ onNavigate }) => {
  const { activeTab, setActiveTab } = useAppStore();

  const handleClick = (id: string, route: string) => {
    setActiveTab(id);
    onNavigate(route);
  };

  return (
    <aside className="w-60 bg-industrial-900 border-r border-industrial-700 flex flex-col h-screen fixed left-0 top-0">
      <div className="h-16 flex items-center px-5 border-b border-industrial-700">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mr-3">
          <Factory className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-white font-bold text-base">注塑车间管理系统</h1>
          <p className="text-industrial-400 text-xs">Injection Molding MES</p>
        </div>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto scrollbar-thin">
        <p className="px-5 text-xs font-medium text-industrial-500 uppercase tracking-wider mb-2">功能模块</p>
        <ul className="space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => handleClick(item.id, item.route)}
                  className={cn(
                    "w-full flex items-center px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group",
                    isActive
                      ? "bg-primary-600/20 text-primary-400 border border-primary-700/50"
                      : "text-industrial-300 hover:bg-industrial-800 hover:text-white"
                  )}
                >
                  <Icon className={cn("w-5 h-5 mr-3 transition-colors",
                    isActive ? "text-primary-400" : "text-industrial-400 group-hover:text-white")} />
                  <span className="font-medium">{item.name}</span>
                  {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500" />}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-industrial-700">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-500 to-accent-700 flex items-center justify-center">
            <span className="text-white text-sm font-bold">管</span>
          </div>
          <div className="ml-3">
            <p className="text-white text-sm font-medium">管理员</p>
            <p className="text-industrial-400 text-xs">admin@factory.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
