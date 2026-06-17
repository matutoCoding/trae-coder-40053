import { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import { useAppStore } from '@/store';
import {
  Package,
  Thermometer,
  Palette,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from 'lucide-react';

type TabKey = 'materials' | 'drying' | 'formula';

const tabConfig = [
  { key: 'materials' as TabKey, label: '原料管理', icon: Package },
  { key: 'drying' as TabKey, label: '烘干记录', icon: Thermometer },
  { key: 'formula' as TabKey, label: '色母配方', icon: Palette },
];

export default function Materials() {
  const [activeTab, setActiveTab] = useState<TabKey>('materials');
  const { materials, dryingRecords, colorFormulas } = useAppStore();

  return (
    <div className="p-6">
      <PageHeader
        title="原料配色管理"
        description="管理原料库存、烘干记录及色母配方"
        actions={
          <button className="btn-primary flex items-center gap-2">
            <Plus size={16} />
            新增记录
          </button>
        }
      />

      <div className="flex space-x-1 mb-6 border-b border-industrial-700">
        {tabConfig.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2 -mb-px ${
                isActive
                  ? 'text-primary-400 border-primary-500'
                  : 'text-industrial-400 border-transparent hover:text-white hover:border-industrial-500'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'materials' && (
        <div className="card-industrial overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="table-industrial">
              <thead>
                <tr>
                  <th>原料名称</th>
                  <th>类型</th>
                  <th>库存 (kg)</th>
                  <th>烘干温度 (℃)</th>
                  <th>烘干时间 (h)</th>
                  <th>供应商</th>
                  <th>状态</th>
                </tr>
              </thead>
              <tbody>
                {materials.map((m) => (
                  <tr key={m.id}>
                    <td className="font-medium text-white">{m.name}</td>
                    <td className="text-industrial-300">{m.type}</td>
                    <td>
                      <span
                        className={
                          m.stock < 5000 ? 'text-amber-400 font-medium' : 'text-white'
                        }
                      >
                        {m.stock.toLocaleString()}
                      </span>
                    </td>
                    <td className="text-industrial-300">{m.dryingTemp}</td>
                    <td className="text-industrial-300">{m.dryingTime}</td>
                    <td className="text-industrial-300">{m.supplier}</td>
                    <td>
                      {m.stock < 5000 ? (
                        <span className="badge badge-warning flex items-center gap-1 w-fit">
                          <AlertTriangle size={12} />
                          库存预警
                        </span>
                      ) : (
                        <span className="badge badge-secondary flex items-center gap-1 w-fit">
                          <CheckCircle2 size={12} />
                          正常
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'drying' && (
        <div className="card-industrial overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="table-industrial">
              <thead>
                <tr>
                  <th>原料名</th>
                  <th>温度 (℃)</th>
                  <th>时长 (h)</th>
                  <th>开始时间</th>
                  <th>结束时间</th>
                  <th>操作员</th>
                  <th>状态</th>
                </tr>
              </thead>
              <tbody>
                {dryingRecords.map((r) => (
                  <tr key={r.id}>
                    <td className="font-medium text-white">{r.materialName}</td>
                    <td className="text-industrial-300">{r.temp}</td>
                    <td className="text-industrial-300">{r.duration}</td>
                    <td className="text-industrial-300">{r.startTime}</td>
                    <td className="text-industrial-300">{r.endTime || '-'}</td>
                    <td className="text-industrial-300">{r.operator}</td>
                    <td>
                      {r.status === 'drying' ? (
                        <span className="badge badge-info flex items-center gap-1 w-fit">
                          <Clock size={12} className="animate-pulse" />
                          烘干中
                        </span>
                      ) : (
                        <span className="badge badge-success flex items-center gap-1 w-fit">
                          <CheckCircle2 size={12} />
                          已完成
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'formula' && (
        <div className="card-industrial overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="table-industrial">
              <thead>
                <tr>
                  <th>配方名称</th>
                  <th>产品名</th>
                  <th>基料</th>
                  <th>色母配比</th>
                  <th>创建时间</th>
                </tr>
              </thead>
              <tbody>
                {colorFormulas.map((f) => (
                  <tr key={f.id}>
                    <td className="font-medium text-white">{f.name}</td>
                    <td className="text-industrial-300">{f.productName}</td>
                    <td className="text-industrial-300">{f.baseMaterial}</td>
                    <td>
                      <div className="flex flex-wrap gap-1.5">
                        {f.colorMaster.map((cm, idx) => (
                          <span
                            key={idx}
                            className="badge badge-info"
                          >
                            {cm.name} {cm.ratio}%
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="text-industrial-300">{f.createTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
