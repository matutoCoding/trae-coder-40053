import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  Package, Activity, CheckCircle, Zap, Clock,
  Cpu, Wrench, Pause
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import { useAppStore } from '@/store';
import type { Order, Machine } from '@/types';

const PIE_COLORS = ['#3b82f6', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6'];

const machineStatusMap: Record<Machine['status'], { label: string; icon: React.ElementType; className: string }> = {
  running: { label: '运行中', icon: Cpu, className: 'status-running' },
  idle: { label: '待机', icon: Pause, className: 'status-idle' },
  maintenance: { label: '维护中', icon: Wrench, className: 'status-maintenance' },
};

const orderStatusMap: Record<Order['status'], { label: string; className: string }> = {
  pending: { label: '待排产', className: 'badge-secondary' },
  scheduled: { label: '已排产', className: 'badge-info' },
  producing: { label: '生产中', className: 'badge-warning' },
  completed: { label: '已完成', className: 'badge-success' },
};

const formatRuntime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

const Dashboard: React.FC = () => {
  const { dashboardStats, hourlyOutput, defectStats, machines, orders } = useAppStore();

  const activeOrders = orders
    .filter(o => o.status !== 'completed')
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader
        title="生产仪表板"
        description="实时监控车间生产状态与关键指标"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="今日产量"
          value={dashboardStats.todayOutput.toLocaleString()}
          unit="件"
          icon={Package}
          trend={{ value: 8.5, isUp: true }}
          color="primary"
        />
        <StatCard
          title="机台开动率"
          value={dashboardStats.runningRate}
          unit="%"
          icon={Activity}
          trend={{ value: 3.2, isUp: true }}
          color="accent"
        />
        <StatCard
          title="合格率"
          value={dashboardStats.passRate}
          unit="%"
          icon={CheckCircle}
          trend={{ value: 1.1, isUp: true }}
          color="success"
        />
        <StatCard
          title="今日能耗"
          value={dashboardStats.todayEnergy.toLocaleString()}
          unit="kWh"
          icon={Zap}
          trend={{ value: 2.8, isUp: false }}
          color="danger"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card-industrial p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">每小时产量趋势</h3>
            <span className="text-industrial-400 text-xs">今日数据</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyOutput} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Bar dataKey="output" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-industrial p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">不良品分布</h3>
            <span className="text-industrial-400 text-xs">累计统计</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={defectStats}
                  cx="50%"
                  cy="45%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {defectStats.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => <span style={{ color: '#94a3b8', fontSize: 12 }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card-industrial p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">机台状态</h3>
            <div className="flex items-center space-x-3 text-xs text-industrial-400">
              <span className="flex items-center"><span className="status-dot status-running mr-1.5"></span>运行中</span>
              <span className="flex items-center"><span className="status-dot status-idle mr-1.5"></span>待机</span>
              <span className="flex items-center"><span className="status-dot status-maintenance mr-1.5"></span>维护</span>
            </div>
          </div>
          <div className="space-y-2 max-h-72 overflow-y-auto scrollbar-thin">
            {machines.map((machine) => {
              const status = machineStatusMap[machine.status];
              const StatusIcon = status.icon;
              return (
                <div
                  key={machine.id}
                  className="flex items-center justify-between p-3 bg-industrial-900/50 rounded-lg border border-industrial-700"
                >
                  <div className="flex items-center space-x-3">
                    <span className={`status-dot ${status.className}`}></span>
                    <div>
                      <p className="text-white text-sm font-medium">{machine.machineNo} · {machine.name}</p>
                      <p className="text-industrial-400 text-xs">{machine.tonnage}T</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <span className={`badge ${status.className}`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {status.label}
                      </span>
                      {machine.status === 'running' && machine.runtime > 0 && (
                        <div className="flex items-center justify-end mt-1 text-xs text-industrial-400">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatRuntime(machine.runtime)}
                        </div>
                      )}
                    </div>
                    {machine.operator && (
                      <div className="text-right text-xs">
                        <p className="text-industrial-400">操作员</p>
                        <p className="text-white">{machine.operator}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card-industrial p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">近期订单进度</h3>
            <span className="text-industrial-400 text-xs">进行中</span>
          </div>
          <div className="space-y-3 max-h-72 overflow-y-auto scrollbar-thin">
            {activeOrders.map((order) => {
              const progress = Math.round((order.completedQty / order.quantity) * 100);
              const status = orderStatusMap[order.status];
              return (
                <div key={order.id} className="p-3 bg-industrial-900/50 rounded-lg border border-industrial-700">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-white text-sm font-medium">{order.orderNo}</p>
                      <p className="text-industrial-400 text-xs">{order.productName} · {order.customer}</p>
                    </div>
                    <span className={`badge ${status.className}`}>{status.label}</span>
                  </div>
                  <div className="mb-1">
                    <div className="flex justify-between text-xs text-industrial-400 mb-1">
                      <span>进度</span>
                      <span>{order.completedQty.toLocaleString()} / {order.quantity.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-industrial-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          progress >= 100 ? 'bg-emerald-500' : progress >= 50 ? 'bg-primary-500' : 'bg-accent-500'
                        }`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-industrial-400 mt-2">
                    <span>交期: {order.dueDate}</span>
                    <span className={progress >= 100 ? 'text-emerald-400 font-medium' : ''}>{progress}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
