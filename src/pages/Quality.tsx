import React, { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import { useAppStore } from '@/store';
import {
  ClipboardCheck, Ruler, BarChart3, Eye, CheckCircle,
  XCircle, ChevronDown, ChevronRight, User, Clock
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const QUALITY_COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];

const formatDateTime = (iso: string): string => {
  if (!iso) return '-';
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const Quality: React.FC = () => {
  const { qualityChecks, defectStats, dailyEnergy } = useAppStore();
  const [activeTab, setActiveTab] = useState<'appearance' | 'dimension' | 'report'>('appearance');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const passRateTrend = dailyEnergy.slice(-7).map((d, idx) => ({
    date: d.date,
    合格率: 93 + Math.floor(Math.random() * 7),
  }));

  const tabs = [
    { key: 'appearance' as const, label: '外观检查', icon: Eye },
    { key: 'dimension' as const, label: '尺寸抽检', icon: Ruler },
    { key: 'report' as const, label: '质检报表', icon: BarChart3 },
  ];

  return (
    <div className="p-6">
      <PageHeader
        title="产品质检"
        description="外观检查、尺寸抽检与质检报表管理"
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
          {activeTab === 'appearance' && (
            <div className="overflow-x-auto scrollbar-thin">
              <table className="table-industrial">
                <thead>
                  <tr>
                    <th>时间</th>
                    <th>订单号</th>
                    <th>检验员</th>
                    <th>缩水</th>
                    <th>飞边</th>
                    <th>气泡</th>
                    <th>变色</th>
                    <th>判定</th>
                    <th>备注</th>
                  </tr>
                </thead>
                <tbody>
                  {qualityChecks.map(check => (
                    <tr key={check.id}>
                      <td className="text-white">{formatDateTime(check.checkTime)}</td>
                      <td className="text-primary-400">{check.orderNo}</td>
                      <td className="text-white">
                        <span className="flex items-center">
                          <User className="w-3.5 h-3.5 mr-1 text-industrial-400" />
                          {check.inspector}
                        </span>
                      </td>
                      <td>
                        {check.shrinkage ? (
                          <span className="badge badge-danger">是</span>
                        ) : (
                          <span className="badge badge-success">否</span>
                        )}
                      </td>
                      <td>
                        {check.flash ? (
                          <span className="badge badge-warning">是</span>
                        ) : (
                          <span className="badge badge-success">否</span>
                        )}
                      </td>
                      <td>
                        {check.bubbles ? (
                          <span className="badge badge-danger">是</span>
                        ) : (
                          <span className="badge badge-success">否</span>
                        )}
                      </td>
                      <td>
                        {check.discoloration ? (
                          <span className="badge badge-warning">是</span>
                        ) : (
                          <span className="badge badge-success">否</span>
                        )}
                      </td>
                      <td>
                        {check.result === 'pass' ? (
                          <span className="badge badge-success flex items-center w-fit">
                            <CheckCircle className="w-3 h-3 mr-1" />合格
                          </span>
                        ) : (
                          <span className="badge badge-danger flex items-center w-fit">
                            <XCircle className="w-3 h-3 mr-1" />不合格
                          </span>
                        )}
                      </td>
                      <td className="text-industrial-300">{check.remark || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'dimension' && (
            <div className="space-y-3">
              {qualityChecks.map(check => {
                const isExpanded = expandedId === check.id;
                return (
                  <div key={check.id} className="border border-industrial-700 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : check.id)}
                      className="w-full flex items-center justify-between p-4 bg-industrial-800 hover:bg-industrial-750 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-industrial-400" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-industrial-400" />
                        )}
                        <div className="flex items-center space-x-3">
                          <Ruler className="w-4 h-4 text-primary-400" />
                          <span className="text-white font-medium">{check.orderNo}</span>
                          <span className="text-industrial-400 text-sm flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatDateTime(check.checkTime)}
                          </span>
                          <span className="text-industrial-400 text-sm">{check.inspector}</span>
                        </div>
                      </div>
                      {check.result === 'pass' ? (
                        <span className="badge badge-success">合格</span>
                      ) : (
                        <span className="badge badge-danger">不合格</span>
                      )}
                    </button>
                    {isExpanded && (
                      <div className="p-4 border-t border-industrial-700 bg-industrial-900">
                        <table className="table-industrial">
                          <thead>
                            <tr>
                              <th>尺寸名称</th>
                              <th>测量值</th>
                              <th>标准值</th>
                              <th>公差</th>
                              <th>是否合格</th>
                            </tr>
                          </thead>
                          <tbody>
                            {check.dimensions.map((dim, idx) => (
                              <tr key={idx}>
                                <td className="text-white">{dim.name}</td>
                                <td className="text-white font-mono">{dim.value}</td>
                                <td className="text-industrial-300 font-mono">{dim.standard}</td>
                                <td className="text-industrial-300 font-mono">±{dim.tolerance}</td>
                                <td>
                                  {dim.isPass ? (
                                    <span className="badge badge-success flex items-center w-fit">
                                      <CheckCircle className="w-3 h-3 mr-1" />合格
                                    </span>
                                  ) : (
                                    <span className="badge badge-danger flex items-center w-fit">
                                      <XCircle className="w-3 h-3 mr-1" />不合格
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'report' && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="card-industrial p-4">
                <h4 className="text-white font-semibold mb-4 flex items-center">
                  <ClipboardCheck className="w-5 h-5 mr-2 text-primary-400" />
                  合格率趋势
                </h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={passRateTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                      <YAxis stroke="#64748b" fontSize={12} domain={[85, 100]} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                        labelStyle={{ color: '#e2e8f0' }}
                      />
                      <Legend wrapperStyle={{ color: '#94a3b8' }} />
                      <Line
                        type="monotone"
                        dataKey="合格率"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ fill: '#10b981', strokeWidth: 2 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="card-industrial p-4">
                <h4 className="text-white font-semibold mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-accent-400" />
                  不良类型分布
                </h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={defectStats}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {defectStats.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={QUALITY_COLORS[index % QUALITY_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Quality;
