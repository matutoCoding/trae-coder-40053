import React from 'react';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import { useAppStore } from '@/store';
import {
  Zap, TrendingUp, DollarSign, BarChart3, Factory
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from 'recharts';

const Energy: React.FC = () => {
  const { dailyEnergy, energyRecords, machines } = useAppStore();

  const today = dailyEnergy[dailyEnergy.length - 1];

  const machineEnergyMap = new Map<string, { currentPower: number; totalEnergy: number }>();
  energyRecords.forEach(record => {
    const existing = machineEnergyMap.get(record.machineName) || { currentPower: 0, totalEnergy: 0 };
    machineEnergyMap.set(record.machineName, {
      currentPower: Math.max(existing.currentPower, record.power),
      totalEnergy: Math.max(existing.totalEnergy, record.energy),
    });
  });

  const machineEnergyList = Array.from(machineEnergyMap.entries())
    .map(([machineName, data]) => ({ machineName, ...data }))
    .sort((a, b) => b.totalEnergy - a.totalEnergy);

  const totalEnergyAll = machineEnergyList.reduce((sum, m) => sum + m.totalEnergy, 0);

  return (
    <div className="p-6">
      <PageHeader
        title="能耗统计"
        description="车间能耗监控、趋势分析与机台能耗排行"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard
          title="今日总能耗"
          value={today?.totalEnergy.toLocaleString() || 0}
          unit="kWh"
          icon={Zap}
          color="primary"
          trend={{ value: 5.2, isUp: true }}
        />
        <StatCard
          title="当前峰值功率"
          value={today?.peakPower || 0}
          unit="kW"
          icon={TrendingUp}
          color="accent"
        />
        <StatCard
          title="今日电费"
          value={today?.cost.toLocaleString() || 0}
          unit="元"
          icon={DollarSign}
          color="success"
          trend={{ value: 3.1, isUp: false }}
        />
      </div>

      <div className="card-industrial p-4 mb-6">
        <h4 className="text-white font-semibold mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-primary-400" />
          近7日能耗趋势
        </h4>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyEnergy} barGap={8}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
              <YAxis
                yAxisId="left"
                stroke="#64748b"
                fontSize={12}
                label={{ value: '能耗(kWh)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 12 }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#64748b"
                fontSize={12}
                label={{ value: '电费(元)', angle: 90, position: 'insideRight', fill: '#64748b', fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Legend wrapperStyle={{ color: '#94a3b8' }} />
              <Bar
                yAxisId="left"
                dataKey="totalEnergy"
                name="能耗(kWh)"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                yAxisId="right"
                dataKey="cost"
                name="电费(元)"
                fill="#f59e0b"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card-industrial overflow-hidden">
        <div className="p-4 border-b border-industrial-700 flex items-center">
          <Factory className="w-5 h-5 mr-2 text-accent-400" />
          <h3 className="text-lg font-semibold text-white">各机台能耗排行</h3>
        </div>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="table-industrial">
            <thead>
              <tr>
                <th>排名</th>
                <th>机台名称</th>
                <th>当前功率(kW)</th>
                <th>今日累计能耗(kWh)</th>
                <th>能耗占比</th>
              </tr>
            </thead>
            <tbody>
              {machineEnergyList.map((item, index) => {
                const percentage = totalEnergyAll > 0 ? (item.totalEnergy / totalEnergyAll * 100) : 0;
                const machine = machines.find(m => m.name === item.machineName);
                return (
                  <tr key={item.machineName}>
                    <td>
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                        index === 0 ? 'bg-amber-500/20 text-amber-400' :
                        index === 1 ? 'bg-industrial-400/20 text-industrial-300' :
                        index === 2 ? 'bg-orange-500/20 text-orange-400' :
                        'bg-industrial-700 text-industrial-400'
                      }`}>
                        {index + 1}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center">
                        <span className={`status-dot mr-2 ${
                          machine?.status === 'running' ? 'status-running' :
                          machine?.status === 'maintenance' ? 'status-maintenance' : 'status-idle'
                        }`}></span>
                        <span className="text-white">{item.machineName}</span>
                      </div>
                    </td>
                    <td>
                      <span className="text-white font-mono">{item.currentPower.toFixed(1)}</span>
                    </td>
                    <td>
                      <span className="text-emerald-400 font-medium font-mono">{item.totalEnergy.toFixed(1)}</span>
                    </td>
                    <td className="min-w-[200px]">
                      <div className="flex items-center">
                        <div className="flex-1 h-2 bg-industrial-700 rounded-full overflow-hidden mr-3">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-white min-w-[45px] text-right">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Energy;
