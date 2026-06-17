import React, { useState, useMemo } from 'react';
import { Search, Filter, Plus, Calendar, User, Box } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { useAppStore } from '@/store';
import type { Order, OrderStatus } from '@/types';

const statusOptions: { value: OrderStatus | 'all'; label: string; className: string }[] = [
  { value: 'all', label: '全部', className: 'badge-secondary' },
  { value: 'pending', label: '待排产', className: 'badge-secondary' },
  { value: 'scheduled', label: '已排产', className: 'badge-info' },
  { value: 'producing', label: '生产中', className: 'badge-warning' },
  { value: 'completed', label: '已完成', className: 'badge-success' },
];

const statusBadgeMap: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: '待排产', className: 'badge-secondary' },
  scheduled: { label: '已排产', className: 'badge-info' },
  producing: { label: '生产中', className: 'badge-warning' },
  completed: { label: '已完成', className: 'badge-success' },
};

const Orders: React.FC = () => {
  const { orders, machines } = useAppStore();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchSearch =
        order.orderNo.toLowerCase().includes(searchText.toLowerCase()) ||
        order.productName.toLowerCase().includes(searchText.toLowerCase()) ||
        order.customer.toLowerCase().includes(searchText.toLowerCase());
      const matchStatus = statusFilter === 'all' || order.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, searchText, statusFilter]);

  const getProgressColor = (progress: number): string => {
    if (progress >= 100) return 'bg-emerald-500';
    if (progress >= 70) return 'bg-primary-500';
    if (progress >= 30) return 'bg-accent-500';
    return 'bg-red-500';
  };

  const getMachineName = (machineId?: string): string => {
    if (!machineId) return '-';
    const machine = machines.find((m) => m.id === machineId);
    return machine ? `${machine.machineNo}` : '-';
  };

  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => o.status === 'pending').length;
    const producing = orders.filter((o) => o.status === 'producing').length;
    const completed = orders.filter((o) => o.status === 'completed').length;
    return { total, pending, producing, completed };
  }, [orders]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="订单排产管理"
        description="管理生产订单，跟踪生产进度与交付状态"
        actions={
          <button className="btn-primary flex items-center">
            <Plus className="w-4 h-4 mr-1.5" />
            新建订单
          </button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card-industrial p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-industrial-400 text-xs">全部订单</p>
              <p className="text-white text-2xl font-bold mt-1">{stats.total}</p>
            </div>
            <Box className="w-8 h-8 text-primary-400 opacity-70" />
          </div>
        </div>
        <div className="card-industrial p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-industrial-400 text-xs">待排产</p>
              <p className="text-white text-2xl font-bold mt-1">{stats.pending}</p>
            </div>
            <div className="w-3 h-3 rounded-full bg-industrial-500"></div>
          </div>
        </div>
        <div className="card-industrial p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-industrial-400 text-xs">生产中</p>
              <p className="text-white text-2xl font-bold mt-1">{stats.producing}</p>
            </div>
            <div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]"></div>
          </div>
        </div>
        <div className="card-industrial p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-industrial-400 text-xs">已完成</p>
              <p className="text-white text-2xl font-bold mt-1">{stats.completed}</p>
            </div>
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          </div>
        </div>
      </div>

      <div className="card-industrial p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-industrial-400" />
            <input
              type="text"
              placeholder="搜索订单号、产品名称、客户..."
              className="input-industrial pl-9"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-industrial-400" />
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setStatusFilter(option.value)}
                  className={`badge cursor-pointer transition-all ${
                    statusFilter === option.value
                      ? option.className + ' ring-1 ring-offset-0 ring-offset-transparent'
                      : 'bg-industrial-800 text-industrial-400 border border-industrial-600 hover:bg-industrial-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card-industrial overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="table-industrial">
            <thead>
              <tr>
                <th>订单号</th>
                <th>产品名称</th>
                <th>客户</th>
                <th>数量</th>
                <th>完成量</th>
                <th className="w-48">生产进度</th>
                <th>机台</th>
                <th>状态</th>
                <th>排产日期</th>
                <th>交期</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-industrial-400">
                    暂无符合条件的订单数据
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order: Order) => {
                  const progress = Math.round((order.completedQty / order.quantity) * 100);
                  const badge = statusBadgeMap[order.status];
                  return (
                    <tr key={order.id} className="align-middle">
                      <td>
                        <span className="text-white font-medium">{order.orderNo}</span>
                      </td>
                      <td>
                        <div>
                          <p className="text-white">{order.productName}</p>
                          <p className="text-industrial-400 text-xs">{order.material} · {order.color}</p>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center text-industrial-300">
                          <User className="w-3.5 h-3.5 mr-1.5 text-industrial-500" />
                          {order.customer}
                        </div>
                      </td>
                      <td className="text-white">
                        {order.quantity.toLocaleString()}
                      </td>
                      <td className="text-industrial-300">
                        {order.completedQty.toLocaleString()}
                      </td>
                      <td>
                        <div className="w-full">
                          <div className="flex justify-between text-xs text-industrial-400 mb-1">
                            <span></span>
                            <span className="font-medium text-white">{progress}%</span>
                          </div>
                          <div className="w-full bg-industrial-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${getProgressColor(progress)}`}
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="text-industrial-300">
                        {getMachineName(order.machineId)}
                      </td>
                      <td>
                        <span className={`badge ${badge.className}`}>{badge.label}</span>
                      </td>
                      <td>
                        <div className="flex items-center text-industrial-300 text-xs">
                          <Calendar className="w-3.5 h-3.5 mr-1.5 text-industrial-500" />
                          {order.scheduledDate || '-'}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center text-xs">
                          <Calendar className="w-3.5 h-3.5 mr-1.5 text-industrial-500" />
                          <span className={
                            new Date(order.dueDate) < new Date() && order.status !== 'completed'
                              ? 'text-red-400 font-medium'
                              : 'text-industrial-300'
                          }>
                            {order.dueDate}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-industrial-700 flex items-center justify-between text-xs text-industrial-400">
          <span>共 {filteredOrders.length} 条记录</span>
          <div className="flex items-center space-x-2">
            <button className="btn-secondary px-3 py-1 text-xs">上一页</button>
            <span className="text-white">1</span>
            <button className="btn-secondary px-3 py-1 text-xs">下一页</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;
