import { useState, useEffect, useMemo } from 'react';
import PageHeader from '@/components/PageHeader';
import { useAppStore } from '@/store';
import type { MachineParam } from '@/types';
import {
  Cpu, Settings, History, User, Clock, Gauge,
  Save, RefreshCw, RotateCcw, Tag, ChevronDown, ChevronUp
} from 'lucide-react';

const statusMap = {
  running: { label: '运行中', badge: 'badge-success', dot: 'status-running' },
  idle: { label: '空闲', badge: 'badge-warning', dot: 'status-idle' },
  maintenance: { label: '维护中', badge: 'badge-danger', dot: 'status-maintenance' },
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

const emptyForm: ParamForm = {
  injectionPressure: 0, holdingPressure: 0, holdingTime: 0,
  moldTemp: 0, cycleTime: 0, injectionSpeed: 0, coolingTime: 0,
};

export default function Machines() {
  const { machines, machineParams, addMachineParam } = useAppStore();
  const [selectedId, setSelectedId] = useState<string | null>(machines[0]?.id ?? null);
  const [formData, setFormData] = useState<ParamForm>(emptyForm);
  const [lastSaved, setLastSaved] = useState<ParamForm | null>(null);
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const [showHistory, setShowHistory] = useState(true);

  const selectedMachine = machines.find((m) => m.id === selectedId);

  const currentParam = useMemo(() => {
    if (!selectedId) return null;
    return machineParams.find((p) => p.machineId === selectedId) ?? null;
  }, [selectedId, machineParams]);

  const paramHistory = useMemo(() => {
    if (!selectedId) return [];
    return machineParams.filter((p) => p.machineId === selectedId);
  }, [selectedId, machineParams]);

  useEffect(() => {
    if (currentParam) {
      const form: ParamForm = {
        injectionPressure: currentParam.injectionPressure,
        holdingPressure: currentParam.holdingPressure,
        holdingTime: currentParam.holdingTime,
        moldTemp: currentParam.moldTemp,
        cycleTime: currentParam.cycleTime,
        injectionSpeed: currentParam.injectionSpeed,
        coolingTime: currentParam.coolingTime,
      };
      setFormData(form);
      setLastSaved(form);
      setHasUnsaved(false);
    } else {
      setFormData(emptyForm);
      setLastSaved(null);
      setHasUnsaved(false);
    }
  }, [selectedId, currentParam?.id]);

  const handleChange = (key: keyof ParamForm, value: string) => {
    const newForm = { ...formData, [key]: Number(value) };
    setFormData(newForm);
    setHasUnsaved(lastSaved ? JSON.stringify(newForm) !== JSON.stringify(lastSaved) : true);
  };

  const handleSave = () => {
    if (!selectedMachine) return;
    const now = new Date().toLocaleString('zh-CN', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    }).replace(/\//g, '-');

    const versionNum = paramHistory.length + 1;
    const newParam: MachineParam = {
      id: `mp_${selectedMachine.id}_v${versionNum}_${Date.now()}`,
      machineId: selectedMachine.id,
      machineName: `${selectedMachine.machineNo} ${selectedMachine.name}`,
      ...formData,
      effectiveDate: now,
      operator: selectedMachine.operator || '当前操作员',
    };
    addMachineParam(newParam);
    setLastSaved({ ...formData });
    setHasUnsaved(false);
  };

  const handleReset = () => {
    if (lastSaved) {
      setFormData({ ...lastSaved });
      setHasUnsaved(false);
    }
  };

  const isParamChanged = (key: keyof ParamForm): boolean => {
    if (!lastSaved) return false;
    return formData[key] !== lastSaved[key];
  };

  return (
    <div className="p-6">
      <PageHeader
        title="机台调机管理"
        description="查看机台状态、调整成型参数、管理参数版本"
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
              const hasParams = machineParams.some(p => p.machineId === m.id);
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
                    <div className="flex flex-col items-end gap-1">
                      <span className={`badge ${cfg.badge}`}>{cfg.label}</span>
                      {hasParams && (
                        <span className="text-xs text-primary-400 flex items-center gap-1">
                          <Tag size={10} />
                          已配参数
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex items-center justify-between text-industrial-300">
                      <span className="flex items-center gap-1"><Gauge size={12} />吨位</span>
                      <span className="text-white">{m.tonnage}T</span>
                    </div>
                    <div className="flex items-center justify-between text-industrial-300">
                      <span className="flex items-center gap-1"><User size={12} />操作员</span>
                      <span className="text-white">{m.operator || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between text-industrial-300">
                      <span className="flex items-center gap-1"><Clock size={12} />运行时长</span>
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
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium text-industrial-200 flex items-center gap-2">
                  <Settings size={16} />
                  调机参数
                  {selectedMachine && (
                    <span className="text-industrial-400 font-normal">
                      - {selectedMachine.machineNo} {selectedMachine.name}
                    </span>
                  )}
                </h3>
                {currentParam && (
                  <span className="badge badge-info text-xs">
                    V{paramHistory.length} 当前版本
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {hasUnsaved && (
                  <span className="text-amber-400 text-xs flex items-center gap-1 mr-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                    有未保存的修改
                  </span>
                )}
                <button
                  onClick={handleReset}
                  disabled={!hasUnsaved}
                  className={`btn-secondary flex items-center gap-2 ${!hasUnsaved ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  <RotateCcw size={14} />
                  重置
                </button>
                <button
                  onClick={handleSave}
                  disabled={!hasUnsaved}
                  className={`btn-primary flex items-center gap-2 ${!hasUnsaved ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  <Save size={14} />
                  保存为新版本
                </button>
              </div>
            </div>

            {selectedMachine ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {paramFields.map((f) => {
                  const changed = isParamChanged(f.key as keyof ParamForm);
                  return (
                    <div key={f.key} className={`relative rounded-lg p-3 transition-all ${changed ? 'bg-amber-900/20 border border-amber-700/50' : 'bg-industrial-900/30'}`}>
                      <label className="block text-sm text-industrial-300 mb-1.5">
                        {f.label} ({f.unit})
                        {changed && <span className="ml-1.5 text-amber-400 text-xs">已修改</span>}
                      </label>
                      <input
                        type="number"
                        value={formData[f.key as keyof ParamForm]}
                        onChange={(e) => handleChange(f.key as keyof ParamForm, e.target.value)}
                        className="input-industrial"
                      />
                      {changed && lastSaved && (
                        <p className="text-xs text-industrial-500 mt-1">
                          原值: {lastSaved[f.key as keyof ParamForm]} {f.unit}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10 text-industrial-400">
                请选择左侧机台查看参数
              </div>
            )}
          </div>

          <div className="card-industrial overflow-hidden">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-full flex items-center justify-between p-5 border-b border-industrial-700 hover:bg-industrial-750 transition-colors"
            >
              <h3 className="text-sm font-medium text-industrial-200 flex items-center gap-2">
                <History size={16} />
                参数版本历史
                {selectedId && (
                  <span className="text-industrial-400 font-normal">
                    ({paramHistory.length} 个版本)
                  </span>
                )}
              </h3>
              {showHistory ? <ChevronUp size={16} className="text-industrial-400" /> : <ChevronDown size={16} className="text-industrial-400" />}
            </button>
            {showHistory && (
              <div className="overflow-x-auto scrollbar-thin">
                <table className="table-industrial">
                  <thead>
                    <tr>
                      <th>版本</th>
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
                    {paramHistory.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="text-center py-8 text-industrial-400">
                          暂无调机记录，请选择机台并保存参数
                        </td>
                      </tr>
                    ) : (
                      paramHistory.map((p, idx) => (
                        <tr key={p.id} className={idx === 0 ? 'bg-primary-900/10' : ''}>
                          <td>
                            <span className={`badge ${idx === 0 ? 'badge-info' : 'badge-secondary'}`}>
                              V{paramHistory.length - idx}
                              {idx === 0 && ' 当前'}
                            </span>
                          </td>
                          <td className="font-medium text-white">{p.machineName}</td>
                          <td className="text-industrial-300">{p.injectionPressure} MPa</td>
                          <td className="text-industrial-300">{p.holdingPressure} MPa</td>
                          <td className="text-industrial-300">{p.holdingTime} s</td>
                          <td className="text-industrial-300">{p.moldTemp} ℃</td>
                          <td className="text-industrial-300">{p.cycleTime} s</td>
                          <td className="text-industrial-300">{p.injectionSpeed}%</td>
                          <td className="text-industrial-300">{p.coolingTime} s</td>
                          <td className="text-industrial-300 whitespace-nowrap">{p.effectiveDate}</td>
                          <td className="text-industrial-300">{p.operator}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
