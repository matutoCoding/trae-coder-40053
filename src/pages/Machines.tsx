import { useState, useEffect } from 'react';
import PageHeader from '@/components/PageHeader';
import { useAppStore } from '@/store';
import type { MachineParam } from '@/types';
import {
  Cpu,
  Settings,
  History,
  User,
  Clock,
  Gauge,
  Save,
  RefreshCw,
} from 'lucide-react';

const statusMap = {
  running: { label: '运行中', badge: 'badge-success', dot: 'status-running' },
  idle: { label: '空闲', badge: 'badge-warning', dot: 'status-idle' },
  maintenance: { label: '维护中', badge: 'badge-danger', dot: 'badge-danger' },
};

function formatRuntime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

interface ParamForm {
  injectionPressure: number;
  holdingPressure: number;
  holdingTime: number;
  moldTemp: number;
  cycleTime: number;
  injectionSpeed: number;
  coolingTime: number;
}

const paramFields = [
  { key: 'injectionPressure', label: '注射压力', unit: 'MPa' },
  { key: 'holdingPressure', label: '保压压力', unit: 'MPa' },
  { key: 'holdingTime', label: '保压时间', unit: 's' },
  { key: 'moldTemp', label: '模温', unit: '℃' },
  { key: 'cycleTime', label: '成型周期', unit: 's' },
  { key: 'injectionSpeed', label: '注射速度', unit: '%' },
  { key: 'coolingTime', label: '冷却时间', unit: 's' },
];

export default function Machines() {
  const { machines, machineParams, updateMachineParam } = useAppStore();
  const [selectedId, setSelectedId] = useState<string | null>(machines[0]?.id ?? null);
  const [formData, setFormData] = useState<ParamForm>({
    injectionPressure: 0,
    holdingPressure: 0,
    holdingTime: 0,
    moldTemp: 0,
    cycleTime: 0,
    injectionSpeed: 0,
    coolingTime: 0,
  });

  const selectedMachine = machines.find((m) => m.id === selectedId);
  const currentParam = machineParams.find((p) => p.machineId === selectedId);

  useEffect(() => {
    if (currentParam) {
      setFormData({
        injectionPressure: currentParam.injectionPressure,
        holdingPressure: currentParam.holdingPressure,
        holdingTime: currentParam.holdingTime,
        moldTemp: currentParam.moldTemp,
        cycleTime: currentParam.cycleTime,
        injectionSpeed: currentParam.injectionSpeed,
        coolingTime: currentParam.coolingTime,
      });
    } else {
      setFormData({
        injectionPressure: 0,
        holdingPressure: 0,
        holdingTime: 0,
        moldTemp: 0,
        cycleTime: 0,
        injectionSpeed: 0,
        coolingTime: 0,
      });
    }
  }, [selectedId]);

  const handleChange = (key: keyof ParamForm, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: Number(value) }));
  };

  const handleSave = () => {
    if (!selectedMachine && currentParam) {
      const updated: MachineParam = {
        ...currentParam,
        ...formData,
        effectiveDate: new Date().toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }).replace(/\//g, '-'),
        operator: selectedMachine?.operator || '当前操作员',
      };
      updateMachineParam(updated);
    }
  };

  return (
    <div className="p-6">
      <PageHeader
        title="机台调机管理"
        description="查看机台状态、调整成型参数、记录调机历史"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-sm font-medium text-industrial-200 flex items-center gap-2">
            <Cpu size={16} />
            机台列表
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
            {machines.map((m) => {
              const cfg = statusMap[m.status];
              const isSelected = selectedId === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedId(m.id)}
                  className={`card-industrial p-4 cursor-pointer transition-all border-2 ${
                    isSelected
                      ? 'border-primary-500'
                      : 'border-transparent hover:border-industrial-600'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`status-dot ${cfg.dot} ${m.status === 'running' ? 'animate-pulse-slow' : ''}`}></span>
                        <span className="font-semibold text-white">{m.machineNo}</span>
                      </div>
                      <div className="text-industrial-300 text-sm mt-1">{m.name}</div>
                    </div>
                    <span className={`badge ${cfg.badge}`}>{cfg.label}</span>
                  </div>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex items-center justify-between text-industrial-300">
                      <span className="flex items-center gap-1">
                        <Gauge size={12} />
                        吨位
                      </span>
                      <span className="text-white">{m.tonnage}T</span>
                    </div>
                    <div className="flex items-center justify-between text-industrial-300">
                      <span className="flex items-center gap-1">
                        <User size={12} />
                        操作员
                      </span>
                      <span className="text-white">{m.operator || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between text-industrial-300">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        运行时长
                      </span>
                      <span className="text-white">{m.runtime > 0 ? formatRuntime(m.runtime) : '-'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="card-industrial p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-industrial-200 flex items-center gap-2">
                <Settings size={16} />
                调机参数
                {selectedMachine && (
                  <span className="text-industrial-400 font-normal">
                    - {selectedMachine.machineNo} {selectedMachine.name}
                  </span>
                )}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => currentParam && setSelectedId(selectedId)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <RefreshCw size={14} />
                  重置
                </button>
                <button onClick={handleSave} className="btn-primary flex items-center gap-2">
                  <Save size={14} />
                  保存参数
                </button>
              </div>
            </div>

            {selectedMachine ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {paramFields.map((f) => (
                  <div key={f.key}>
                    <label className="block text-sm text-industrial-300 mb-1.5">
                      {f.label} ({f.unit})
                    </label>
                    <input
                      type="number"
                      value={formData[f.key as keyof ParamForm]}
                      onChange={(e) => handleChange(f.key as keyof ParamForm, e.target.value)}
                      className="input-industrial"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-industrial-400">
                请选择左侧机台查看参数
              </div>
            )}
          </div>

          <div className="card-industrial overflow-hidden">
            <h3 className="text-sm font-medium text-industrial-200 flex items-center gap-2 p-5 pb-3 border-b border-industrial-700">
              <History size={16} />
              调机历史记录
            </h3>
            <div className="overflow-x-auto scrollbar-thin">
              <table className="table-industrial">
                <thead>
                  <tr>
                    <th>机台名</th>
                    <th>注射压力</th>
                    <th>保压压力</th>
                    <th>保压时间</th>
                    <th>模温</th>
                    <th>成型周期</th>
                    <th>注射速度</th>
                    <th>冷却时间</th>
                    <th>生效时间</th>
                    <th>操作员</th>
                  </tr>
                </thead>
                <tbody>
                  {machineParams.map((p) => (
                    <tr key={p.id}>
                      <td className="font-medium text-white">{p.machineName}</td>
                      <td className="text-industrial-300">{p.injectionPressure} MPa</td>
                      <td className="text-industrial-300">{p.holdingPressure} MPa</td>
                      <td className="text-industrial-300">{p.holdingTime} s</td>
                      <td className="text-industrial-300">{p.moldTemp} ℃</td>
                      <td className="text-industrial-300">{p.cycleTime} s</td>
                      <td className="text-industrial-300">{p.injectionSpeed}%</td>
                      <td className="text-industrial-300">{p.coolingTime} s</td>
                      <td className="text-industrial-300">{p.effectiveDate}</td>
                      <td className="text-industrial-300">{p.operator}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
