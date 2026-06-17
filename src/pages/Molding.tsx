import React, { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import { useAppStore } from '@/store';
import {
  Factory, Clock, User, Layers, Box, AlertTriangle,
  Play, Calendar, Timer, StopCircle, ChevronRight, X
} from 'lucide-react';
import type { Order } from '@/types';

const formatRuntime = (minutes: number): string => {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hrs}h ${mins}m`;
};

const formatDateTime = (iso: string): string => {
  if (!iso) return '-';
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

type TabKey = 'monitor' | 'pending';

interface StartProductionForm {
  orderId: string;
  machineId: string;
  moldId: string;
  cycleTime: number;
  operator: string;
}

interface EndProductionForm {
  productionId: string;
  moldCavities: number;
  shots: number;
  output: number;
  defectQty: number;
}

const Molding: React.FC = () => {
  const { machines, orders, molds, productionRecords, machineParams, startProduction, endProduction } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabKey>('monitor');
  const [startModalOpen, setStartModalOpen] = useState(false);
  const [endModalOpen, setEndModalOpen] = useState(false);
  const [startForm, setStartForm] = useState<StartProductionForm | null>(null);
  const [endForm, setEndForm] = useState<EndProductionForm | null>(null);

  const runningMachines = machines.filter(m => m.status === 'running');
  const pendingOrders = orders.filter(o => o.status === 'scheduled' && o.machineId && o.moldId);

  const getMachineCardData = (machine: typeof machines[0]) => {
    const order = orders.find(o => o.id === machine.currentOrder);
    const mold = molds.find(m => m.id === machine.currentMold);
    const record = productionRecords.find(
      r => r.machineId === machine.id && !r.endTime
    );
    return { order, mold, record };
  };

  const openStartModal = (order: Order) => {
    const machine = machines.find(m => m.id === order.machineId);
    const param = machineParams.find(p => p.machineId === order.machineId);
    setStartForm({
      orderId: order.id,
      machineId: order.machineId!,
      moldId: order.moldId!,
      cycleTime: param?.cycleTime ?? 30,
      operator: machine?.operator ?? '',
    });
    setStartModalOpen(true);
  };

  const openEndModal = (productionId: string, moldCavities: number) => {
    setEndForm({
      productionId,
      moldCavities,
      shots: 0,
      output: 0,
      defectQty: 0,
    });
    setEndModalOpen(true);
  };

  const handleConfirmStart = () => {
    if (!startForm) return;
    startProduction(
      startForm.orderId,
      startForm.machineId,
      startForm.moldId,
      startForm.cycleTime,
      startForm.operator || '未填写'
    );
    setStartModalOpen(false);
    setStartForm(null);
  };

  const handleConfirmEnd = () => {
    if (!endForm) return;
    if (endForm.shots <= 0 || endForm.output < 0) return;
    endProduction(endForm.productionId, endForm.shots, endForm.output, endForm.defectQty);
    setEndModalOpen(false);
    setEndForm(null);
  };

  const onShotsChange = (shots: number) => {
    if (!endForm) return;
    setEndForm({
      ...endForm,
      shots,
      output: shots * endForm.moldCavities,
    });
  };

  return (
    <div className="p-6">
      <PageHeader
        title="注塑成型"
        description="实时监控机台生产状态与生产记录"
      />

      <div className="flex items-center space-x-2 mb-6 bg-industrial-900/50 p-1.5 rounded-lg w-fit border border-industrial-700">
        <button
          onClick={() => setActiveTab('monitor')}
          className={`px-5 py-2 rounded-md text-sm font-medium transition-all flex items-center ${
            activeTab === 'monitor'
              ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
              : 'text-industrial-400 hover:text-white hover:bg-industrial-800'
          }`}
        >
          <Play className="w-4 h-4 mr-2" />
          生产监控
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-5 py-2 rounded-md text-sm font-medium transition-all flex items-center ${
            activeTab === 'pending'
              ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
              : 'text-industrial-400 hover:text-white hover:bg-industrial-800'
          }`}
        >
          <Clock className="w-4 h-4 mr-2" />
          待生产
          {pendingOrders.length > 0 && (
            <span className="ml-2 bg-amber-500/20 text-amber-400 text-xs px-2 py-0.5 rounded-full">
              {pendingOrders.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'monitor' && (
        <>
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Play className="w-5 h-5 mr-2 text-emerald-400" />
              正在生产 ({runningMachines.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              {runningMachines.map(machine => {
                const { order, mold, record } = getMachineCardData(machine);
                const passRate = record && record.output > 0
                  ? ((record.output - record.defectQty) / record.output * 100).toFixed(1)
                  : '-';
                return (
                  <div key={machine.id} className="card-industrial p-4 hover:shadow-industrial transition-all flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <span className="status-dot status-running mr-2 animate-pulse-slow"></span>
                        <span className="text-white font-bold text-base">{machine.machineNo}</span>
                        <span className="text-industrial-400 text-sm ml-2">{machine.name}</span>
                      </div>
                      <span className="text-xs text-industrial-400">{machine.tonnage}T</span>
                    </div>
                    <div className="space-y-2 text-sm flex-1">
                      <div className="flex justify-between">
                        <span className="text-industrial-400 flex items-center"><Layers className="w-3.5 h-3.5 mr-1" />订单号</span>
                        <span className="text-white font-medium">{order?.orderNo || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-industrial-400 flex items-center"><Box className="w-3.5 h-3.5 mr-1" />模具</span>
                        <span className="text-white">{mold?.name || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-industrial-400 flex items-center"><Timer className="w-3.5 h-3.5 mr-1" />成型周期</span>
                        <span className="text-white">{record?.cycleTime || '-'} s</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-industrial-400 flex items-center"><Layers className="w-3.5 h-3.5 mr-1" />模次</span>
                        <span className="text-white">{record?.shots || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-industrial-400 flex items-center"><Factory className="w-3.5 h-3.5 mr-1" />产量</span>
                        <span className="text-emerald-400 font-medium">{record?.output || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-industrial-400 flex items-center"><AlertTriangle className="w-3.5 h-3.5 mr-1" />不良数</span>
                        <span className="text-red-400 font-medium">{record?.defectQty || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-industrial-400">合格率</span>
                        <span className={Number(passRate) >= 95 ? 'text-emerald-400' : 'text-amber-400'}>{passRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-industrial-400 flex items-center"><Clock className="w-3.5 h-3.5 mr-1" />运行时间</span>
                        <span className="text-white">{formatRuntime(machine.runtime)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-industrial-400 flex items-center"><User className="w-3.5 h-3.5 mr-1" />操作员</span>
                        <span className="text-white">{machine.operator || '-'}</span>
                      </div>
                    </div>
                    {record && (
                      <div className="mt-4 pt-3 border-t border-industrial-700/60">
                        <button
                          onClick={() => openEndModal(record.id, mold?.cavities ?? 1)}
                          className="w-full py-2.5 px-3 bg-gradient-to-r from-red-600/90 to-red-700/90 hover:from-red-600 hover:to-red-700 text-white rounded-lg text-sm font-medium transition-all flex items-center justify-center shadow-lg shadow-red-900/20"
                        >
                          <StopCircle className="w-4 h-4 mr-2" />
                          结束本次批次
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
              {runningMachines.length === 0 && (
                <div className="col-span-full py-16 text-center text-industrial-500">
                  <Factory className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">暂无正在生产的机台</p>
                  <p className="text-xs mt-1">请在"待生产"标签页开始生产</p>
                </div>
              )}
            </div>
          </div>

          <div className="card-industrial overflow-hidden">
            <div className="p-4 border-b border-industrial-700 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-primary-400" />
              <h3 className="text-lg font-semibold text-white">生产记录</h3>
            </div>
            <div className="overflow-x-auto scrollbar-thin">
              <table className="table-industrial">
                <thead>
                  <tr>
                    <th>日期时间</th>
                    <th>订单号</th>
                    <th>机台</th>
                    <th>模具</th>
                    <th>开始时间</th>
                    <th>结束时间</th>
                    <th>成型周期(s)</th>
                    <th>模次</th>
                    <th>产量</th>
                    <th>不良数</th>
                    <th>合格率</th>
                    <th>操作员</th>
                  </tr>
                </thead>
                <tbody>
                  {productionRecords.map(record => {
                    const rate = record.output > 0
                      ? ((record.output - record.defectQty) / record.output * 100).toFixed(1)
                      : '-';
                    const isRunning = !record.endTime;
                    return (
                      <tr key={record.id}>
                        <td className="text-white">{formatDateTime(record.startTime)}</td>
                        <td className="text-primary-400">{record.orderNo}</td>
                        <td className="text-white">{record.machineName}</td>
                        <td className="text-white">{record.moldName}</td>
                        <td className="text-industrial-300">{formatDateTime(record.startTime)}</td>
                        <td className="text-industrial-300">
                          {isRunning ? (
                            <span className="badge badge-success">生产中</span>
                          ) : formatDateTime(record.endTime || '')}
                        </td>
                        <td className="text-white">{record.cycleTime}</td>
                        <td className="text-white">{record.shots}</td>
                        <td className="text-emerald-400 font-medium">{record.output}</td>
                        <td className="text-red-400 font-medium">{record.defectQty}</td>
                        <td>
                          <span className={rate !== '-' && Number(rate) >= 95 ? 'text-emerald-400' : 'text-amber-400'}>{rate}%</span>
                        </td>
                        <td className="text-white">{record.operator}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'pending' && (
        <div className="card-industrial overflow-hidden">
          <div className="p-4 border-b border-industrial-700 flex items-center justify-between">
            <div className="flex items-center">
              <Clock className="w-5 h-5 mr-2 text-amber-400" />
              <h3 className="text-lg font-semibold text-white">待生产订单</h3>
              <span className="ml-3 text-xs text-industrial-400">已排产且分配机台与模具</span>
            </div>
            <span className="badge badge-warning">{pendingOrders.length} 条</span>
          </div>
          <div className="overflow-x-auto scrollbar-thin">
            <table className="table-industrial">
              <thead>
                <tr>
                  <th>订单号</th>
                  <th>产品名</th>
                  <th>客户</th>
                  <th>机台</th>
                  <th>模具</th>
                  <th>计划日期</th>
                  <th>数量</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {pendingOrders.map(order => {
                  const machine = machines.find(m => m.id === order.machineId);
                  const mold = molds.find(m => m.id === order.moldId);
                  return (
                    <tr key={order.id}>
                      <td className="text-primary-400 font-medium">{order.orderNo}</td>
                      <td className="text-white">{order.productName}</td>
                      <td className="text-industrial-300">{order.customer}</td>
                      <td className="text-white">
                        {machine ? (
                          <span className="flex items-center">
                            <span className="w-2 h-2 rounded-full bg-primary-400 mr-2"></span>
                            {machine.machineNo} {machine.name}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="text-white">{mold ? `${mold.moldNo} ${mold.name}` : '-'}</td>
                      <td className="text-industrial-300">{order.scheduledDate}</td>
                      <td className="text-white">{order.quantity.toLocaleString()}</td>
                      <td>
                        <button
                          onClick={() => openStartModal(order)}
                          className="inline-flex items-center px-3 py-1.5 bg-emerald-600/90 hover:bg-emerald-600 text-white text-xs rounded-md transition-all shadow-sm shadow-emerald-900/30"
                        >
                          <Play className="w-3.5 h-3.5 mr-1.5" />
                          开始生产
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {pendingOrders.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-16 text-industrial-500">
                      <Clock className="w-12 h-12 mx-auto mb-3 opacity-40" />
                      <p className="text-sm">暂无待生产订单</p>
                      <p className="text-xs mt-1">请先在订单排产页面分配机台与模具</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {startModalOpen && startForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="card-industrial p-6 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Play className="w-5 h-5 mr-2 text-emerald-400" />
                开始生产确认
              </h3>
              <button
                onClick={() => { setStartModalOpen(false); setStartForm(null); }}
                className="text-industrial-400 hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 p-3 bg-industrial-900/60 rounded-lg border border-industrial-700/60">
                <div>
                  <p className="text-xs text-industrial-400 mb-0.5">订单</p>
                  <p className="text-sm text-white font-medium">
                    {orders.find(o => o.id === startForm.orderId)?.orderNo}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-industrial-400 mb-0.5">机台</p>
                  <p className="text-sm text-white font-medium">
                    {machines.find(m => m.id === startForm.machineId)?.machineNo}
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-sm text-industrial-300 mb-1.5">
                  成型周期（s）<span className="text-red-400 ml-1">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  value={startForm.cycleTime}
                  onChange={(e) => setStartForm({ ...startForm, cycleTime: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 bg-industrial-900 border border-industrial-600 rounded-lg text-white text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm text-industrial-300 mb-1.5">
                  操作员姓名<span className="text-red-400 ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={startForm.operator}
                  onChange={(e) => setStartForm({ ...startForm, operator: e.target.value })}
                  placeholder="请输入操作员姓名"
                  className="w-full px-3 py-2.5 bg-industrial-900 border border-industrial-600 rounded-lg text-white text-sm placeholder:text-industrial-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                />
              </div>
            </div>
            <div className="flex items-center space-x-3 mt-6">
              <button
                onClick={() => { setStartModalOpen(false); setStartForm(null); }}
                className="flex-1 py-2.5 px-4 bg-industrial-700 hover:bg-industrial-600 text-white rounded-lg text-sm font-medium transition-all"
              >
                取消
              </button>
              <button
                onClick={handleConfirmStart}
                className="flex-1 py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-lg text-sm font-medium transition-all flex items-center justify-center shadow-lg shadow-emerald-900/30"
              >
                <ChevronRight className="w-4 h-4 mr-1" />
                确认开始
              </button>
            </div>
          </div>
        </div>
      )}

      {endModalOpen && endForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="card-industrial p-6 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <StopCircle className="w-5 h-5 mr-2 text-red-400" />
                结束生产确认
              </h3>
              <button
                onClick={() => { setEndModalOpen(false); setEndForm(null); }}
                className="text-industrial-400 hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="p-3 bg-industrial-900/60 rounded-lg border border-industrial-700/60">
                <p className="text-xs text-industrial-400 mb-1">提示</p>
                <p className="text-sm text-white">
                  模具穴数：<span className="font-medium text-primary-400">{endForm.moldCavities}</span> 腔
                  <span className="text-industrial-400 mx-2">·</span>
                  默认产出 = 模次 × {endForm.moldCavities}
                </p>
              </div>
              <div>
                <label className="block text-sm text-industrial-300 mb-1.5">
                  模次（shots）<span className="text-red-400 ml-1">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  value={endForm.shots || ''}
                  onChange={(e) => onShotsChange(Number(e.target.value))}
                  placeholder="请输入模次"
                  className="w-full px-3 py-2.5 bg-industrial-900 border border-industrial-600 rounded-lg text-white text-sm placeholder:text-industrial-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm text-industrial-300 mb-1.5">
                  产出数量<span className="text-red-400 ml-1">*</span>
                </label>
                <input
                  type="number"
                  min={0}
                  value={endForm.output || ''}
                  onChange={(e) => setEndForm({ ...endForm, output: Number(e.target.value) })}
                  placeholder="请输入产出数量"
                  className="w-full px-3 py-2.5 bg-industrial-900 border border-industrial-600 rounded-lg text-white text-sm placeholder:text-industrial-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm text-industrial-300 mb-1.5">
                  不良数<span className="text-red-400 ml-1">*</span>
                </label>
                <input
                  type="number"
                  min={0}
                  value={endForm.defectQty || ''}
                  onChange={(e) => setEndForm({ ...endForm, defectQty: Number(e.target.value) })}
                  placeholder="请输入不良数，默认 0"
                  className="w-full px-3 py-2.5 bg-industrial-900 border border-industrial-600 rounded-lg text-white text-sm placeholder:text-industrial-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                />
              </div>
              {endForm.output > 0 && (
                <div className="p-3 bg-primary-900/20 rounded-lg border border-primary-700/40">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-industrial-300">预计合格率</span>
                    <span className={((endForm.output - endForm.defectQty) / endForm.output * 100) >= 95 ? 'text-emerald-400 font-medium' : 'text-amber-400 font-medium'}>
                      {((endForm.output - endForm.defectQty) / endForm.output * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-3 mt-6">
              <button
                onClick={() => { setEndModalOpen(false); setEndForm(null); }}
                className="flex-1 py-2.5 px-4 bg-industrial-700 hover:bg-industrial-600 text-white rounded-lg text-sm font-medium transition-all"
              >
                取消
              </button>
              <button
                onClick={handleConfirmEnd}
                disabled={endForm.shots <= 0 || endForm.output < 0}
                className="flex-1 py-2.5 px-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-all flex items-center justify-center shadow-lg shadow-red-900/30 disabled:shadow-none"
              >
                <StopCircle className="w-4 h-4 mr-1.5" />
                确认结束
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Molding;
