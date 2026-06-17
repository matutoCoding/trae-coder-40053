import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  trend?: { value: number; isUp: boolean };
  color?: 'primary' | 'accent' | 'success' | 'danger';
}

const colorMap = {
  primary: 'from-primary-500 to-primary-700 bg-primary-500/10 text-primary-400',
  accent: 'from-accent-500 to-accent-700 bg-accent-500/10 text-accent-400',
  success: 'from-emerald-500 to-emerald-700 bg-emerald-500/10 text-emerald-400',
  danger: 'from-red-500 to-red-700 bg-red-500/10 text-red-400',
};

const StatCard: React.FC<StatCardProps> = ({ title, value, unit, icon: Icon, trend, color = 'primary' }) => {
  return (
    <div className="card-industrial p-5 hover:shadow-industrial transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-industrial-400 text-sm font-medium">{title}</p>
          <div className="mt-2 flex items-baseline">
            <span className="text-2xl font-bold text-white group-hover:text-primary-400 transition-colors">{value}</span>
            {unit && <span className="ml-1.5 text-industrial-400 text-sm">{unit}</span>}
          </div>
          {trend && (
            <div className={cn("mt-2 flex items-center text-xs font-medium",
              trend.isUp ? "text-emerald-400" : "text-red-400")}>
              {trend.isUp ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              <span>{trend.isUp ? '+' : ''}{trend.value}% 较昨日</span>
            </div>
          )}
        </div>
        <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center", colorMap[color])}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
