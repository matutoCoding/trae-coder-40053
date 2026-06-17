import React from 'react';
import PageHeader from '@/components/PageHeader';
import { useAppStore } from '@/store';
import {
  Factory, Clock, User, Layers, Box, AlertTriangle,
  Play, Calendar, Timer
} from 'lucide-react';

const formatRuntime = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hrs}h ${mins}m`;
};

const formatDateTime = (iso: string): string => {
  if (!iso) return '-';
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const Molding: React.FC = () => {
  const { machines, orders, molds, productionRecords } = useAppStore();

  const runningMachines = machines.filter(m => m.status === 'running');

  const getMachineCardData = (machine: typeof machines[0]) => {
    const order = orders.find(o => o.id === machine.currentOrder);
    const mold = molds.find(m => m.id === machine.currentMold);
    const record = productionRecords.find(
      r => r.machineId === machine.id && !r.endTime
    );
    return { order, mold, record };
  };

  return (
    <div className="p-6">
      <PageHeader
        title="注塑成型"
        description="实时监控机台生产状态与生产记录"
      />

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
              <div key={machine.id} className="card-industrial p-4 hover:shadow-industrial transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <span className="status-dot status-running mr-2 animate-pulse-slow"></span>
                    <span className="text-white font-bold text-base">{machine.machineNo}</span>
                    <span className="text-industrial-400 text-sm ml-2">{machine.name}</span>
                  </div>
                  <span className="text-xs text-industrial-400">{machine.tonnage}T</span>
                </div>
                <div className="space-y-2 text-sm">
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
              </div>
            );
          })}
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
                const rate = ((record.output - record.defectQty) / record.output * 100).toFixed(1);
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
                      <span className={Number(rate) >= 95 ? 'text-emerald-400' : 'text-amber-400'}>{rate}%</span>
                    </td>
                    <td className="text-white">{record.operator}</td>
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

export default Molding;
