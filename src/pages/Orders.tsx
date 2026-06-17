import React, { useState, useMemo, useCallback } from 'react';
import { Search, Filter, Plus, Calendar, User, Box, X, Settings, Layers, CheckCircle2, AlertTriangle, ChevronLeft, ChevronRight, List, GanttChart, Clock, ArrowRight } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { useAppStore } from '@/store';
import type { Order, OrderStatus, Machine } from '@/types';

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

const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

interface ScheduleModalProps {
  order: Order;
  onClose: () => void;
  onSave: (orderId: string, machineId: string, moldId: string, scheduledDate: string) => void;
}

const ScheduleModal: React.FC<ScheduleModalProps> = ({ order, onClose, onSave }) => {
  const { machines, molds, orders, getAvailableMachines } = useAppStore();
  const [machineId, setMachineId] = useState('');
  const [moldId, setMoldId] = useState('');
  const [scheduledDate, setScheduledDate] = useState(order.scheduledDate || new Date().toISOString().split('T')[0]);

  const availableMachines = machines.filter(m => m.status === 'idle' || m.status === 'running');
  const availableMolds = molds.filter(m => m.status === 'off_machine');

  const selectedMachine = machines.find(m => m.id === machineId);
  const selectedMold = molds.find(m => m.id === moldId);

  const canSave = machineId && moldId && scheduledDate;

  const conflicts = useMemo(() => {
    if (!machineId || !scheduledDate) return [];
    return orders.filter(o =>
      o.machineId === machineId &&
      o.scheduledDate === scheduledDate &&
      o.status !== 'completed' &&
      o.status !== 'pending' &&
      o.id !== order.id
    );
  }, [orders, machineId, scheduledDate, order.id]);

  const suggestedMachines = useMemo(() => {
    if (!machineId || conflicts.length === 0) return [];
    return getAvailableMachines(scheduledDate, machineId);
  }, [getAvailableMachines, scheduledDate, machineId, conflicts.length]);

  const handleSave = () => {
    if (canSave) {
      if (conflicts.length > 0) {
        if (!window.confirm(`该机台当天已有 ${conflicts.length} 个订单排产，确认强制排产吗？`)) return;
      }
      onSave(order.id, machineId, moldId, scheduledDate);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="card-industrial w-full max-w-lg p-0 animate-slide-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-industrial-700">
          <div>
            <h3 className="text-white font-semibold text-base">订单排产</h3>
            <p className="text-industrial-400 text-sm mt-0.5">{order.orderNo} - {order.productName}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-industrial-700 transition-colors">
            <X className="w-5 h-5 text-industrial-300" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-industrial-400">客户</p>
              <p className="text-white font-medium">{order.customer}</p>
            </div>
            <div>
              <p className="text-industrial-400">数量</p>
              <p className="text-white font-medium">{order.quantity.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-industrial-400">原料</p>
              <p className="text-white font-medium">{order.material}</p>
            </div>
            <div>
              <p className="text-industrial-400">颜色</p>
              <p className="text-white font-medium">{order.color}</p>
            </div>
            <div>
              <p className="text-industrial-400">交期</p>
              <p className="text-white font-medium">{order.dueDate}</p>
            </div>
          </div>

          <div className="border-t border-industrial-700 pt-4 space-y-4">
            <div>
              <label className="block text-sm text-industrial-300 mb-1.5">
                <Settings className="w-3.5 h-3.5 inline mr-1.5" />
                选择机台 <span className="text-red-400">*</span>
              </label>
              <select
                value={machineId}
                onChange={e => setMachineId(e.target.value)}
                className="input-industrial appearance-none"
              >
                <option value="">请选择机台</option>
                {availableMachines.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.machineNo} {m.name} ({m.tonnage}T) - {m.status === 'idle' ? '空闲' : '运行中'}
                  </option>
                ))}
              </select>
              {selectedMachine && (
                <div className="mt-2 p-2 bg-industrial-900/50 rounded-lg text-xs text-industrial-300 flex items-center gap-3">
                  <span>吨位: {selectedMachine.tonnage}T</span>
                  <span>操作员: {selectedMachine.operator || '未分配'}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm text-industrial-300 mb-1.5">
                <Layers className="w-3.5 h-3.5 inline mr-1.5" />
                选择模具 <span className="text-red-400">*</span>
              </label>
              <select
                value={moldId}
                onChange={e => setMoldId(e.target.value)}
                className="input-industrial appearance-none"
              >
                <option value="">请选择模具</option>
                {availableMolds.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.moldNo} {m.name} ({m.cavities}腔) - 已用{m.usageCount}次
                  </option>
                ))}
              </select>
              {selectedMold && (
                <div className="mt-2 p-2 bg-industrial-900/50 rounded-lg text-xs text-industrial-300 flex items-center gap-3">
                  <span>腔数: {selectedMold.cavities}</span>
                  <span>寿命: {selectedMold.usageCount}/{selectedMold.lifeCycle}</span>
                  <span>材质: {selectedMold.material}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm text-industrial-300 mb-1.5">
                <Calendar className="w-3.5 h-3.5 inline mr-1.5" />
                计划生产日期 <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={e => setScheduledDate(e.target.value)}
                className="input-industrial"
              />
            </div>
          </div>

          {conflicts.length > 0 && (
            <div className="border border-red-500/60 rounded-lg p-4 bg-red-900/10 space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-red-400 font-medium text-sm">
                  该机台当天已有 {conflicts.length} 个订单排产
                </span>
              </div>
              <div className="space-y-1.5">
                {conflicts.map(c => (
                  <div key={c.id} className="flex items-center gap-3 text-xs bg-red-900/20 rounded px-3 py-2">
                    <span className="text-white font-medium">{c.orderNo}</span>
                    <span className="text-industrial-300">{c.productName}</span>
                    <span className="text-industrial-400">{c.quantity.toLocaleString()} 件</span>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-industrial-300 text-xs mb-2">建议空闲机台：</p>
                {suggestedMachines.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {suggestedMachines.map(m => (
                      <button
                        key={m.id}
                        onClick={() => setMachineId(m.id)}
                        className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                          machineId === m.id
                            ? 'border-primary-400 bg-primary-500/30 text-primary-200'
                            : 'border-primary-500/50 bg-primary-500/10 text-primary-300 hover:bg-primary-500/20'
                        }`}
                      >
                        {m.machineNo} {m.name} ({m.tonnage}T)
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-industrial-500 text-xs">当天无空闲机台可替换</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-5 border-t border-industrial-700">
          <button onClick={onClose} className="btn-secondary">取消</button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className={`flex items-center gap-2 ${!canSave ? 'opacity-40 cursor-not-allowed' : ''} ${
              conflicts.length > 0
                ? 'bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg font-medium transition-colors'
                : 'btn-primary'
            }`}
          >
            <CheckCircle2 size={16} />
            {conflicts.length > 0 ? '确认排产（存在冲突）' : '确认排产'}
          </button>
        </div>
      </div>
    </div>
  );
};

interface QuickScheduleModalProps {
  machineId: string;
  machineName: string;
  scheduledDate: string;
  onClose: () => void;
  onSave: (orderId: string, machineId: string, moldId: string, scheduledDate: string) => void;
}

const QuickScheduleModal: React.FC<QuickScheduleModalProps> = ({ machineId, machineName, scheduledDate, onClose, onSave }) => {
  const { orders, molds, machines, getAvailableMachines } = useAppStore();
  const [orderId, setOrderId] = useState('');
  const [moldId, setMoldId] = useState('');

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const availableMolds = molds.filter(m => m.status === 'off_machine');
  const selectedOrder = orders.find(o => o.id === orderId);
  const selectedMold = molds.find(m => m.id === moldId);
  const machineObj = machines.find(m => m.id === machineId);

  const canSave = orderId && moldId && scheduledDate;

  const conflicts = useMemo(() => {
    if (!machineId || !scheduledDate) return [];
    return orders.filter(o =>
      o.machineId === machineId &&
      o.scheduledDate === scheduledDate &&
      o.status !== 'completed' &&
      o.status !== 'pending'
    );
  }, [orders, machineId, scheduledDate]);

  const suggestedMachines = useMemo(() => {
    if (!machineId || conflicts.length === 0) return [];
    return getAvailableMachines(scheduledDate, machineId);
  }, [getAvailableMachines, scheduledDate, machineId, conflicts.length]);

  const [selectedAltMachine, setSelectedAltMachine] = useState<string | null>(null);

  const handleSave = () => {
    if (canSave) {
      const targetMachineId = selectedAltMachine || machineId;
      if (conflicts.length > 0 && !selectedAltMachine) {
        if (!window.confirm(`该机台当天已有 ${conflicts.length} 个订单排产，确认强制排产吗？`)) return;
      }
      onSave(orderId, targetMachineId, moldId, scheduledDate);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="card-industrial w-full max-w-lg p-0 animate-slide-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-industrial-700">
          <div>
            <h3 className="text-white font-semibold text-base">快速排产</h3>
            <p className="text-industrial-400 text-sm mt-0.5">{machineName} · {scheduledDate}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-industrial-700 transition-colors">
            <X className="w-5 h-5 text-industrial-300" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {machineObj && (
            <div className="p-3 bg-industrial-900/50 rounded-lg text-xs text-industrial-300 flex items-center gap-4">
              <span><span className="text-industrial-500">机台:</span> {machineObj.machineNo} {machineObj.name}</span>
              <span><span className="text-industrial-500">吨位:</span> {machineObj.tonnage}T</span>
              <span><span className="text-industrial-500">日期:</span> {scheduledDate}</span>
            </div>
          )}

          <div>
            <label className="block text-sm text-industrial-300 mb-1.5">
              <Box className="w-3.5 h-3.5 inline mr-1.5" />
              选择订单 <span className="text-red-400">*</span>
            </label>
            <select
              value={orderId}
              onChange={e => setOrderId(e.target.value)}
              className="input-industrial appearance-none"
            >
              <option value="">请选择待排产订单</option>
              {pendingOrders.map(o => (
                <option key={o.id} value={o.id}>
                  {o.orderNo} - {o.productName} ({o.customer} / {o.quantity.toLocaleString()}件)
                </option>
              ))}
            </select>
            {selectedOrder && (
              <div className="mt-2 p-2 bg-industrial-900/50 rounded-lg text-xs text-industrial-300 grid grid-cols-2 gap-2">
                <span>客户: {selectedOrder.customer}</span>
                <span>数量: {selectedOrder.quantity.toLocaleString()}</span>
                <span>原料: {selectedOrder.material}</span>
                <span>交期: {selectedOrder.dueDate}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm text-industrial-300 mb-1.5">
              <Layers className="w-3.5 h-3.5 inline mr-1.5" />
              选择模具 <span className="text-red-400">*</span>
            </label>
            <select
              value={moldId}
              onChange={e => setMoldId(e.target.value)}
              className="input-industrial appearance-none"
            >
              <option value="">请选择模具</option>
              {availableMolds.map(m => (
                <option key={m.id} value={m.id}>
                  {m.moldNo} {m.name} ({m.cavities}腔)
                </option>
              ))}
            </select>
            {selectedMold && (
              <div className="mt-2 p-2 bg-industrial-900/50 rounded-lg text-xs text-industrial-300 flex items-center gap-3">
                <span>腔数: {selectedMold.cavities}</span>
                <span>寿命: {selectedMold.usageCount}/{selectedMold.lifeCycle}</span>
              </div>
            )}
          </div>

          {conflicts.length > 0 && (
            <div className="border border-red-500/60 rounded-lg p-4 bg-red-900/10 space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-red-400 font-medium text-sm">
                  该机台当天已有 {conflicts.length} 个订单排产
                </span>
              </div>
              <div className="space-y-1.5">
                {conflicts.map(c => (
                  <div key={c.id} className="flex items-center gap-3 text-xs bg-red-900/20 rounded px-3 py-2">
                    <span className="text-white font-medium">{c.orderNo}</span>
                    <span className="text-industrial-300">{c.productName}</span>
                    <span className="text-industrial-400">{c.quantity.toLocaleString()} 件</span>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-industrial-300 text-xs mb-2">建议空闲机台：</p>
                {suggestedMachines.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {suggestedMachines.map(m => (
                      <button
                        key={m.id}
                        onClick={() => setSelectedAltMachine(selectedAltMachine === m.id ? null : m.id)}
                        className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                          selectedAltMachine === m.id
                            ? 'border-primary-400 bg-primary-500/30 text-primary-200'
                            : 'border-primary-500/50 bg-primary-500/10 text-primary-300 hover:bg-primary-500/20'
                        }`}
                      >
                        {m.machineNo} {m.name} ({m.tonnage}T)
                        {selectedAltMachine === m.id && ' ✓'}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-industrial-500 text-xs">当天无空闲机台可替换</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-5 border-t border-industrial-700">
          <button onClick={onClose} className="btn-secondary">取消</button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className={`flex items-center gap-2 ${!canSave ? 'opacity-40 cursor-not-allowed' : ''} ${
              conflicts.length > 0
                ? 'bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg font-medium transition-colors'
                : 'btn-primary'
            }`}
          >
            <CheckCircle2 size={16} />
            {selectedAltMachine ? '排产到选中机台' : conflicts.length > 0 ? '确认排产（存在冲突）' : '确认排产'}
          </button>
        </div>
      </div>
    </div>
  );
};

interface DayLoadModalProps {
  machineId: string;
  machineName: string;
  date: string;
  onClose: () => void;
  onReschedule: (orderId: string, targetMachineId: string) => void;
  openDrawer: (orderId: string) => void;
}

const DayLoadModal: React.FC<DayLoadModalProps> = ({ machineId, machineName, date, onClose, onReschedule, openDrawer }) => {
  const { orders, machines, getAvailableMachines } = useAppStore();

  const dayOrders = useMemo(() => {
    return orders.filter(o =>
      o.machineId === machineId &&
      o.scheduledDate === date &&
      o.status !== 'completed' &&
      o.status !== 'pending'
    );
  }, [orders, machineId, date]);

  const availableMachines = useMemo(() => {
    return getAvailableMachines(date, machineId);
  }, [getAvailableMachines, date, machineId]);

  const hasConflict = dayOrders.length > 1;

  const getEstHours = (quantity: number) => {
    return Math.ceil(quantity / 1000 + 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="card-industrial w-full max-w-2xl p-0 animate-slide-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-industrial-700">
          <div>
            <h3 className="text-white font-semibold text-base">日负荷详情</h3>
            <p className="text-industrial-400 text-sm mt-0.5">{machineName} · {date}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-industrial-700 transition-colors">
            <X className="w-5 h-5 text-industrial-300" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="overflow-x-auto">
            <table className="table-industrial">
              <thead>
                <tr>
                  <th>订单号</th>
                  <th>产品名</th>
                  <th>数量</th>
                  <th>预计用时</th>
                  <th>状态</th>
                </tr>
              </thead>
              <tbody>
                {dayOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-industrial-400">
                      当天暂无排产订单
                    </td>
                  </tr>
                ) : (
                  dayOrders.map(o => {
                    const badge = statusBadgeMap[o.status];
                    return (
                      <tr key={o.id}>
                        <td>
                          <button
                            onClick={() => openDrawer(o.id)}
                            className="text-blue-400 hover:text-blue-300 hover:underline font-medium"
                          >
                            {o.orderNo}
                          </button>
                        </td>
                        <td className="text-white">{o.productName}</td>
                        <td className="text-industrial-300">{o.quantity.toLocaleString()}</td>
                        <td className="text-industrial-300">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-industrial-500" />
                            {getEstHours(o.quantity)} 小时
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${badge.className}`}>{badge.label}</span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {hasConflict && (
            <div className="border border-amber-500/40 rounded-lg p-4 bg-amber-900/10 space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span className="text-amber-400 font-medium text-sm">
                  该机台当天排产 {dayOrders.length} 个订单，建议拆分到其他机台
                </span>
              </div>

              {availableMachines.length > 0 ? (
                <div>
                  <p className="text-industrial-300 text-xs mb-2">建议空闲机台：</p>
                  <div className="flex flex-wrap gap-2">
                    {availableMachines.map(m => (
                      <button
                        key={m.id}
                        onClick={() => onReschedule(dayOrders[0].id, m.id)}
                        className="px-3 py-1.5 text-xs rounded-lg border border-primary-500/50 bg-primary-500/10 text-primary-300 hover:bg-primary-500/20 transition-colors flex items-center gap-1.5"
                      >
                        <ArrowRight className="w-3 h-3" />
                        {m.machineNo} {m.name} ({m.tonnage}T)
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-industrial-500 text-xs">当天无空闲机台可替换</p>
              )}
            </div>
          )}

          {!hasConflict && dayOrders.length === 1 && (
            <div className="flex items-center gap-2 p-3 bg-emerald-900/10 border border-emerald-500/30 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 text-sm">该机台当天仅有 1 个订单排产，无冲突</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-5 border-t border-industrial-700">
          <button onClick={onClose} className="btn-secondary">关闭</button>
        </div>
      </div>
    </div>
  );
};

const getMachineStatusDot = (status: Machine['status']) => {
  switch (status) {
    case 'running':
      return 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.6)]';
    case 'idle':
      return 'bg-emerald-500';
    case 'maintenance':
      return 'bg-red-500';
    default:
      return 'bg-industrial-500';
  }
};

const getOrderCardStyle = (status: OrderStatus) => {
  switch (status) {
    case 'scheduled':
      return 'bg-primary-500/15 border-primary-500/60 hover:bg-primary-500/25';
    case 'producing':
      return 'bg-amber-500/15 border-amber-500/60 hover:bg-amber-500/25';
    case 'completed':
      return 'bg-emerald-500/15 border-emerald-500/60 hover:bg-emerald-500/25';
    default:
      return 'bg-industrial-700/50 border-industrial-600';
  }
};

const getOrderProgressColor = (progress: number): string => {
  if (progress >= 100) return 'bg-emerald-500';
  if (progress >= 70) return 'bg-primary-500';
  if (progress >= 30) return 'bg-amber-500';
  return 'bg-red-500';
};

type ViewTab = 'list' | 'timeline';

const Orders: React.FC = () => {
  const { orders, machines, scheduleOrder, openDrawer, getAvailableMachines } = useAppStore();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [schedulingOrder, setSchedulingOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState<ViewTab>('list');
  const [quickSchedule, setQuickSchedule] = useState<{ machineId: string; machineName: string; scheduledDate: string } | null>(null);
  const [dayLoadInfo, setDayLoadInfo] = useState<{ machineId: string; machineName: string; date: string } | null>(null);
  const dateScrollRef = React.useRef<HTMLDivElement>(null);

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

  const dates = useMemo(() => {
    const result: { date: string; display: string; shortDate: string; weekDay: string; isToday: boolean }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      result.push({
        date: dateStr,
        display: `${mm}-${dd}`,
        shortDate: `${mm}/${dd}`,
        weekDay: weekDays[d.getDay()],
        isToday: i === 0,
      });
    }
    return result;
  }, []);

  const conflictMap = useMemo(() => {
    const map: Record<string, number> = {};
    orders.forEach((o) => {
      if (o.scheduledDate && o.machineId && ['scheduled', 'producing', 'completed'].includes(o.status)) {
        const key = `${o.machineId}_${o.scheduledDate}`;
        map[key] = (map[key] || 0) + 1;
      }
    });
    return map;
  }, [orders]);

  const timelineStats = useMemo(() => {
    const dateRange = dates.map(d => d.date);
    const scheduledOrders = orders.filter(o =>
      o.scheduledDate &&
      o.machineId &&
      dateRange.includes(o.scheduledDate) &&
      ['scheduled', 'producing', 'completed'].includes(o.status)
    );
    const scheduledMachineIds = new Set(scheduledOrders.map(o => o.machineId!));
    let conflictCount = 0;
    Object.values(conflictMap).forEach(cnt => {
      if (cnt >= 2) conflictCount++;
    });
    return {
      machineCount: scheduledMachineIds.size,
      orderCount: scheduledOrders.length,
      conflictCount,
    };
  }, [orders, dates, conflictMap]);

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

  const handleSchedule = (orderId: string, machineId: string, moldId: string, scheduledDate: string) => {
    scheduleOrder(orderId, machineId, moldId, scheduledDate);
    setSchedulingOrder(null);
    setQuickSchedule(null);
  };

  const handleReschedule = useCallback((orderId: string, targetMachineId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order || !order.moldId) return;
    scheduleOrder(orderId, targetMachineId, order.moldId, order.scheduledDate);
    setDayLoadInfo(null);
  }, [orders, scheduleOrder]);

  const handleQuickScheduleClick = (machine: Machine, date: string, hasOrders: boolean) => {
    if (hasOrders) {
      setDayLoadInfo({
        machineId: machine.id,
        machineName: `${machine.machineNo} ${machine.name}`,
        date,
      });
    } else {
      setQuickSchedule({
        machineId: machine.id,
        machineName: `${machine.machineNo} ${machine.name}`,
        scheduledDate: date,
      });
    }
  };

  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => o.status === 'pending').length;
    const producing = orders.filter((o) => o.status === 'producing').length;
    const completed = orders.filter((o) => o.status === 'completed').length;
    return { total, pending, producing, completed };
  }, [orders]);

  const getOrdersForCell = (machineId: string, date: string) => {
    return orders.filter(o =>
      o.scheduledDate === date &&
      o.machineId === machineId &&
      ['scheduled', 'producing', 'completed'].includes(o.status)
    );
  };

  const scrollDates = (direction: 'left' | 'right') => {
    if (dateScrollRef.current) {
      const scrollAmount = 200;
      dateScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="订单排产管理"
        description="管理生产订单，安排机台与模具，跟踪生产进度与交付状态"
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

      <div className="card-industrial p-1.5 flex items-center gap-1 w-fit">
        <button
          onClick={() => setActiveTab('list')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'list'
              ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
              : 'text-industrial-300 hover:bg-industrial-700 hover:text-white'
          }`}
        >
          <List className="w-4 h-4" />
          列表视图
        </button>
        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'timeline'
              ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
              : 'text-industrial-300 hover:bg-industrial-700 hover:text-white'
          }`}
        >
          <GanttChart className="w-4 h-4" />
          排产时间轴
        </button>
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

      {activeTab === 'list' ? (
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
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="text-center py-12 text-industrial-400">
                      暂无符合条件的订单数据
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order: Order) => {
                    const progress = Math.round((order.completedQty / order.quantity) * 100);
                    const badge = statusBadgeMap[order.status];
                    const machineObj = order.machineId ? machines.find(m => m.id === order.machineId) : null;
                    return (
                      <tr key={order.id} className="align-middle">
                        <td>
                          <button
                            onClick={() => openDrawer(order.id)}
                            className="text-blue-400 hover:text-blue-300 hover:underline font-medium"
                          >
                            {order.orderNo}
                          </button>
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
                          {machineObj ? (
                            <span className="text-primary-400">{machineObj.machineNo}</span>
                          ) : '-'}
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
                        <td>
                          {order.status === 'pending' && (
                            <button
                              onClick={() => setSchedulingOrder(order)}
                              className="btn-primary px-3 py-1.5 text-xs flex items-center gap-1.5"
                            >
                              <Settings size={12} />
                              排产
                            </button>
                          )}
                          {order.status === 'scheduled' && (
                            <span className="text-xs text-primary-400 flex items-center gap-1">
                              <CheckCircle2 size={12} />
                              已排产
                            </span>
                          )}
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
      ) : (
        <div className="card-industrial p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-industrial-700 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-industrial-400">
                共 <span className="text-white font-semibold">{timelineStats.machineCount}</span> 台机台排产
              </span>
              <span className="w-px h-4 bg-industrial-600"></span>
              <span className="text-industrial-400">
                <span className="text-white font-semibold">{timelineStats.orderCount}</span> 个订单
              </span>
              <span className="w-px h-4 bg-industrial-600"></span>
              <span className={timelineStats.conflictCount > 0 ? 'text-red-400' : 'text-industrial-400'}>
                <AlertTriangle className={`w-3.5 h-3.5 inline mr-1 ${timelineStats.conflictCount > 0 ? '' : 'opacity-40'}`} />
                <span className="font-semibold">{timelineStats.conflictCount}</span> 个冲突
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-industrial-400">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>空闲</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_4px_rgba(245,158,11,0.6)]"></span>
                <span>运行中</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                <span>维护</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="flex">
              <div className="w-44 shrink-0 border-r border-industrial-700 bg-industrial-850/50">
                <div className="h-16 px-4 flex items-center justify-between border-b border-industrial-700 sticky top-0 bg-industrial-850/95 z-10">
                  <span className="text-xs text-industrial-400 font-medium">机台 / 日期</span>
                </div>
                <div>
                  {machines.map((machine) => (
                    <div
                      key={machine.id}
                      className="h-36 px-4 flex items-center border-b border-industrial-700/60 hover:bg-industrial-700/20 transition-colors"
                    >
                      <div className="flex items-center gap-3 w-full">
                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${getMachineStatusDot(machine.status)}`}></span>
                        <div className="min-w-0">
                          <p className="text-white font-semibold text-sm truncate">{machine.machineNo}</p>
                          <p className="text-industrial-400 text-xs truncate">{machine.tonnage}T · {machine.name}</p>
                          {machine.operator && (
                            <p className="text-industrial-500 text-[11px] truncate mt-0.5">
                              <User className="w-3 h-3 inline mr-1 opacity-70" />
                              {machine.operator}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-x-auto scrollbar-thin" ref={dateScrollRef}>
                <div className="min-w-[980px]">
                  <div className="flex items-sticky sticky top-0 bg-industrial-850/95 z-10 border-b border-industrial-700">
                    <button
                      onClick={() => scrollDates('left')}
                      className="w-8 shrink-0 flex items-center justify-center text-industrial-400 hover:text-white hover:bg-industrial-700/50 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {dates.map((d) => (
                      <div
                        key={d.date}
                        className={`flex-1 min-w-[140px] h-16 px-3 py-2 flex flex-col items-center justify-center border-r border-industrial-700 last:border-r-0 transition-colors ${
                          d.isToday
                            ? 'bg-primary-500/10 border-b-2 border-b-primary-500'
                            : ''
                        }`}
                      >
                        <div className={`text-xs px-2 py-0.5 rounded-full mb-1 ${
                          d.isToday ? 'bg-primary-600 text-white font-medium' : 'text-industrial-500'
                        }`}>
                          {d.weekDay}
                        </div>
                        <span className={`font-bold text-lg ${d.isToday ? 'text-white' : 'text-industrial-200'}`}>
                          {d.display}
                        </span>
                        {d.isToday && (
                          <span className="text-[10px] text-primary-400 mt-0.5">今天</span>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => scrollDates('right')}
                      className="w-8 shrink-0 flex items-center justify-center text-industrial-400 hover:text-white hover:bg-industrial-700/50 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    {machines.map((machine) => (
                      <div key={machine.id} className="flex border-b border-industrial-700/60 last:border-b-0">
                        {dates.map((d) => {
                          const cellOrders = getOrdersForCell(machine.id, d.date);
                          const key = `${machine.id}_${d.date}`;
                          const hasConflict = (conflictMap[key] || 0) >= 2;
                          const hasOrders = cellOrders.length > 0;
                          return (
                            <div
                              key={key}
                              onClick={() => handleQuickScheduleClick(machine, d.date, hasOrders)}
                              className={`flex-1 min-w-[140px] h-36 border-r border-industrial-700/60 last:border-r-0 p-2 relative cursor-pointer transition-colors group ${
                                hasConflict ? 'bg-red-500/5' : 'hover:bg-industrial-700/30'
                              }`}
                            >
                              {hasConflict && (
                                <div className="absolute top-1.5 right-1.5 z-10">
                                  <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-red-500/90 text-white font-medium shadow-lg">
                                    <AlertTriangle className="w-3 h-3" />
                                    排产冲突
                                  </span>
                                </div>
                              )}

                              {cellOrders.length === 0 ? (
                                <div className="w-full h-full flex items-center justify-center text-industrial-600 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                  <span className="flex items-center gap-1 px-2 py-1 rounded bg-industrial-700/40 text-industrial-400">
                                    <Plus className="w-3 h-3" />
                                    点击排产
                                  </span>
                                </div>
                              ) : (
                                <div className="space-y-1.5">
                                  {cellOrders.map((order, idx) => {
                                    const progress = Math.round((order.completedQty / order.quantity) * 100);
                                    return (
                                      <div
                                        key={order.id}
                                        className={`relative rounded-lg border px-2 py-1.5 transition-all ${getOrderCardStyle(order.status)} ${
                                          hasConflict && idx > 0 ? 'ring-1 ring-red-500/40' : ''
                                        }`}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (order.status === 'pending') {
                                            setSchedulingOrder(order);
                                          } else {
                                            openDrawer(order.id);
                                          }
                                        }}
                                      >
                                        <div className="text-[11px] font-semibold text-white truncate leading-tight">
                                          {order.orderNo}
                                        </div>
                                        <div className="text-[10px] text-industrial-300 truncate leading-tight mt-0.5">
                                          {order.productName}
                                        </div>
                                        <div className="mt-1">
                                          <div className="flex justify-between text-[9px] text-industrial-400 mb-0.5">
                                            <span>{order.completedQty.toLocaleString()}</span>
                                            <span className="font-medium">{progress}%</span>
                                            <span>{order.quantity.toLocaleString()}</span>
                                          </div>
                                          <div className="w-full bg-industrial-700/60 rounded-full h-1">
                                            <div
                                              className={`h-1 rounded-full transition-all ${getOrderProgressColor(progress)}`}
                                              style={{ width: `${Math.min(progress, 100)}%` }}
                                            ></div>
                                          </div>
                                        </div>
                                        {hasConflict && idx > 0 && (
                                          <div className="absolute -top-0.5 -left-0.5 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_4px_rgba(239,68,68,0.8)]"></div>
                                        )}
                                      </div>
                                    );
                                  })}
                                  <div className="text-[9px] text-industrial-500 text-center mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    点击查看日负荷详情
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-5 py-3 border-t border-industrial-700 flex items-center justify-between text-xs text-industrial-400">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded border bg-primary-500/15 border-primary-500/60"></span>
                <span>已排产</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded border bg-amber-500/15 border-amber-500/60"></span>
                <span>生产中</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded border bg-emerald-500/15 border-emerald-500/60"></span>
                <span>已完成</span>
              </div>
            </div>
            <span>共 {machines.length} 台机台 · 显示未来 7 天排产</span>
          </div>
        </div>
      )}

      {schedulingOrder && (
        <ScheduleModal
          order={schedulingOrder}
          onClose={() => setSchedulingOrder(null)}
          onSave={handleSchedule}
        />
      )}

      {quickSchedule && (
        <QuickScheduleModal
          machineId={quickSchedule.machineId}
          machineName={quickSchedule.machineName}
          scheduledDate={quickSchedule.scheduledDate}
          onClose={() => setQuickSchedule(null)}
          onSave={handleSchedule}
        />
      )}

      {dayLoadInfo && (
        <DayLoadModal
          machineId={dayLoadInfo.machineId}
          machineName={dayLoadInfo.machineName}
          date={dayLoadInfo.date}
          onClose={() => setDayLoadInfo(null)}
          onReschedule={handleReschedule}
          openDrawer={openDrawer}
        />
      )}
    </div>
  );
};

export default Orders;
