import React, { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import { useAppStore } from '@/store';
import {
  Box, ArrowUpDown, Wrench, Calendar, User,
  ChevronUp, ChevronDown
} from 'lucide-react';

const formatDateTime = (iso: string): string => {
  if (!iso) return '-';
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const Molds: React.FC = () => {
  const { molds, moldUsageRecords } = useAppStore();
  const [activeTab, setActiveTab] = useState<'ledger' | 'usage'>('ledger');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'on_machine':
        return <span className="badge badge-success">上机中</span>;
      case 'off_machine':
        return <span className="badge badge-secondary">下架</span>;
      case 'maintenance':
        return <span className="badge badge-danger">维护</span>;
      default:
        return <span className="badge badge-secondary">{status}</span>;
    }
  };

  const getProgressColor = (percent: number): string => {
    if (percent >= 80) return 'bg-red-500';
    if (percent >= 60) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const tabs = [
    { key: 'ledger' as const, label: '模具台账', icon: Box },
    { key: 'usage' as const, label: '上下机记录', icon: ArrowUpDown },
  ];

  return (
    <div className="p-6">
      <PageHeader
        title="模具管理"
        description="模具台账信息与上下机使用记录"
      />

      <div className="card-industrial mb-6">
        <div className="flex border-b border-industrial-700">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center px-5 py-3 text-sm font-medium transition-colors relative ${
                  isActive ? 'text-primary-400' : 'text-industrial-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"></span>
                )}
              </button>
            );
          })}
        </div>

        <div className="p-4">
          {activeTab === 'ledger' && (
            <div className="overflow-x-auto scrollbar-thin">
              <table className="table-industrial">
                <thead>
                  <tr>
                    <th>模具编号</th>
                    <th>名称</th>
                    <th>腔数</th>
                    <th>模次</th>
                    <th>状态</th>
                    <th>上次维护日期</th>
                    <th>材质</th>
                    <th>使用率</th>
                  </tr>
                </thead>
                <tbody>
                  {molds.map(mold => {
                    const usagePercent = Math.min(100, (mold.usageCount / mold.lifeCycle) * 100);
                    return (
                      <tr key={mold.id}>
                        <td className="text-primary-400 font-medium">{mold.moldNo}</td>
                        <td className="text-white">{mold.name}</td>
                        <td className="text-white">{mold.cavities}</td>
                        <td>
                          <span className="text-white">{mold.usageCount.toLocaleString()}</span>
                          <span className="text-industrial-400"> / {mold.lifeCycle.toLocaleString()}</span>
                        </td>
                        <td>{getStatusBadge(mold.status)}</td>
                        <td className="text-white flex items-center">
                          <Calendar className="w-3.5 h-3.5 mr-1 text-industrial-400" />
                          {mold.lastMaintenance}
                        </td>
                        <td className="text-white">{mold.material}</td>
                        <td className="min-w-[160px]">
                          <div className="flex items-center">
                            <div className="flex-1 h-2 bg-industrial-700 rounded-full overflow-hidden mr-3">
                              <div
                                className={`h-full rounded-full transition-all ${getProgressColor(usagePercent)}`}
                                style={{ width: `${usagePercent}%` }}
                              ></div>
                            </div>
                            <span className={`text-sm font-medium min-w-[40px] text-right ${
                              usagePercent >= 80 ? 'text-red-400' : usagePercent >= 60 ? 'text-amber-400' : 'text-emerald-400'
                            }`}>
                              {usagePercent.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'usage' && (
            <div className="overflow-x-auto scrollbar-thin">
              <table className="table-industrial">
                <thead>
                  <tr>
                    <th>时间</th>
                    <th>模具编号</th>
                    <th>机台</th>
                    <th>动作</th>
                    <th>操作员</th>
                    <th>备注</th>
                  </tr>
                </thead>
                <tbody>
                  {moldUsageRecords.map(record => (
                    <tr key={record.id}>
                      <td className="text-white">{formatDateTime(record.time)}</td>
                      <td className="text-primary-400 font-medium">{record.moldNo}</td>
                      <td className="text-white">{record.machineName}</td>
                      <td>
                        {record.action === 'mount' ? (
                          <span className="badge badge-info flex items-center w-fit">
                            <ChevronDown className="w-3 h-3 mr-1" />装模
                          </span>
                        ) : (
                          <span className="badge badge-warning flex items-center w-fit">
                            <ChevronUp className="w-3 h-3 mr-1" />拆模
                          </span>
                        )}
                      </td>
                      <td className="text-white flex items-center">
                        <User className="w-3.5 h-3.5 mr-1 text-industrial-400" />
                        {record.operator}
                      </td>
                      <td className="text-industrial-300">
                        {record.remark ? (
                          <span className="flex items-center">
                            <Wrench className="w-3.5 h-3.5 mr-1 text-industrial-400" />
                            {record.remark}
                          </span>
                        ) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Molds;
