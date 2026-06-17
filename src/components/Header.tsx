import React from 'react';
import { Bell, Search, Clock, Calendar } from 'lucide-react';
import { useAppStore } from '@/store';

const Header: React.FC = () => {
  const { dashboardStats } = useAppStore();
  const now = new Date();
  const dateStr = now.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });

  return (
    <header className="h-16 bg-industrial-800/80 backdrop-blur-sm border-b border-industrial-700 flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-industrial-400" />
          <input
            type="text"
            placeholder="搜索订单、机台、模具..."
            className="w-72 pl-9 pr-4 py-2 bg-industrial-900 border border-industrial-700 rounded-lg text-sm text-white placeholder-industrial-400 focus:outline-none focus:border-primary-500 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-industrial-300 text-sm">
            <Calendar className="w-4 h-4 mr-2 text-industrial-400" />
            <span>{dateStr}</span>
          </div>
          <div className="flex items-center text-industrial-300 text-sm">
            <Clock className="w-4 h-4 mr-2 text-industrial-400" />
            <span>{now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

        <div className="h-6 w-px bg-industrial-700" />

        <div className="flex items-center space-x-3">
          <div className="text-right">
            <div className="flex items-center">
              <span className="status-dot status-running mr-2 animate-pulse" />
              <span className="text-white text-sm font-medium">{dashboardStats.runningMachines} 台运行中</span>
            </div>
            <p className="text-industrial-400 text-xs">机台开动率 {dashboardStats.runningRate}%</p>
          </div>
        </div>

        <button className="relative p-2 rounded-lg hover:bg-industrial-700 transition-colors">
          <Bell className="w-5 h-5 text-industrial-300" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>
      </div>
    </header>
  );
};

export default Header;
