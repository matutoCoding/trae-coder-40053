import React from 'react';
import { X, Package, Calendar, ClipboardList, Factory, ShieldCheck } from 'lucide-react';
import { useAppStore } from '@/store';
import { cn } from '@/lib/utils';

const statusConfig: Record<string, { label: string; badge: string }> = {
  pending: { label: '待排产', badge: 'badge-warning' },
  scheduled: { label: '已排产', badge: 'badge-info' },
  producing: { label: '生产中', badge: 'badge-success' },
  completed: { label: '已完成', badge: 'badge-secondary' },
};

const planStatusConfig: Record<string, { label: string; badge: string }> = {
  pending: { label: '待备料', badge: 'badge-warning' },
  ready: { label: '已备齐', badge: 'badge-success' },
  issued: { label: '已领料', badge: 'badge-info' },
};

function SectionTitle({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon className="w-4 h-4 text-primary-400" />
      <h3 className="text-sm font-semibold text-white">{title}</h3>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-industrial-400">{label}</p>
      <p className="text-sm text-white font-medium">{value ?? '-'}</p>
    </div>
  );
}

const OrderDetailDrawer: React.FC = () => {
  const drawerOrderId = useAppStore((s) => s.drawerOrderId);
  const closeDrawer = useAppStore((s) => s.closeDrawer);
  const orders = useAppStore((s) => s.orders);
  const machines = useAppStore((s) => s.machines);
  const molds = useAppStore((s) => s.molds);
  const materialPlans = useAppStore((s) => s.materialPlans);
  const productionRecords = useAppStore((s) => s.productionRecords);
  const qualityChecks = useAppStore((s) => s.qualityChecks);

  const order = drawerOrderId ? orders.find((o) => o.id === drawerOrderId) : null;
  const isOpen = drawerOrderId !== null;

  const machine = order?.machineId ? machines.find((m) => m.id === order.machineId) : null;
  const mold = order?.moldId ? molds.find((m) => m.id === order.moldId) : null;
  const plans = drawerOrderId ? materialPlans.filter((p) => p.orderId === drawerOrderId) : [];
  const records = drawerOrderId ? productionRecords.filter((r) => r.orderId === drawerOrderId) : [];
  const checks = order ? qualityChecks.filter((q) => q.orderNo === order.orderNo) : [];

  const progressPct = order ? Math.min(100, Math.round((order.completedQty / order.quantity) * 100)) : 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={closeDrawer}
      />
      <div
        className={cn(
          'relative w-[480px] h-full bg-industrial-900 border-l border-industrial-700 shadow-2xl',
          'flex flex-col transform transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-industrial-700 shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-white">{order?.orderNo ?? ''}</h2>
            {order && (
              <span className={cn('badge', statusConfig[order.status]?.badge)}>
                {statusConfig[order.status]?.label}
              </span>
            )}
          </div>
          <button onClick={closeDrawer} className="p-1.5 rounded-md hover:bg-industrial-700 text-industrial-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-5 space-y-6">
          {order && (
            <>
              <section>
                <SectionTitle icon={Package} title="基本信息" />
                <div className="card-industrial p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <InfoRow label="产品名称" value={order.productName} />
                    <InfoRow label="客户" value={order.customer} />
                    <div className="col-span-2 space-y-1">
                      <p className="text-xs text-industrial-400">生产进度</p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2.5 bg-industrial-700 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all duration-500',
                              progressPct >= 100
                                ? 'bg-emerald-500'
                                : progressPct >= 50
                                  ? 'bg-primary-500'
                                  : 'bg-accent-500'
                            )}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                        <span className="text-sm text-white font-medium tabular-nums whitespace-nowrap">
                          {order.completedQty}/{order.quantity}
                        </span>
                      </div>
                    </div>
                    <InfoRow label="原料" value={order.material} />
                    <InfoRow label="颜色" value={order.color} />
                    <InfoRow
                      label="交期"
                      value={
                        <span className={new Date(order.dueDate) < new Date() && order.status !== 'completed' ? 'text-red-400' : ''}>
                          {order.dueDate}
                        </span>
                      }
                    />
                  </div>
                </div>
              </section>

              <section>
                <SectionTitle icon={Calendar} title="排产信息" />
                <div className="card-industrial p-4">
                  {order.machineId || order.moldId ? (
                    <div className="grid grid-cols-2 gap-4">
                      <InfoRow
                        label="机台"
                        value={machine ? `${machine.machineNo} ${machine.name}` : '-'}
                      />
                      <InfoRow
                        label="模具"
                        value={mold ? `${mold.moldNo} ${mold.name}` : '-'}
                      />
                      <InfoRow label="计划日期" value={order.scheduledDate || '-'} />
                    </div>
                  ) : (
                    <p className="text-sm text-industrial-400 text-center py-2">未排产</p>
                  )}
                </div>
              </section>

              <section>
                <SectionTitle icon={ClipboardList} title="备料清单" />
                <div className="card-industrial p-4">
                  {plans.length === 0 ? (
                    <p className="text-sm text-industrial-400 text-center py-2">暂无备料清单</p>
                  ) : (
                    <div className="space-y-4">
                      {plans.map((plan) => (
                        <div key={plan.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-white font-medium">{plan.formulaName}</span>
                            <span className={cn('badge', planStatusConfig[plan.status]?.badge)}>
                              {planStatusConfig[plan.status]?.label}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {plan.items.map((item, idx) => (
                              <span
                                key={idx}
                                className={cn(
                                  'badge text-[11px]',
                                  item.sufficient ? 'badge-success' : 'badge-danger'
                                )}
                              >
                                {item.materialName} {item.needKg}kg
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              <section>
                <SectionTitle icon={Factory} title="生产记录" />
                <div className="card-industrial overflow-hidden">
                  {records.length === 0 ? (
                    <p className="text-sm text-industrial-400 text-center py-4">暂无生产记录</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="table-industrial">
                        <thead>
                          <tr>
                            <th>机台</th>
                            <th>模具</th>
                            <th>开始</th>
                            <th>结束</th>
                            <th>模次</th>
                            <th>产量</th>
                            <th>不良</th>
                            <th>合格率</th>
                          </tr>
                        </thead>
                        <tbody>
                          {records.map((r) => {
                            const passRate = r.output > 0 ? ((r.output - r.defectQty) / r.output * 100).toFixed(1) : '-';
                            return (
                              <tr key={r.id}>
                                <td className="text-xs">{r.machineName}</td>
                                <td className="text-xs">{r.moldName}</td>
                                <td className="text-xs whitespace-nowrap">{r.startTime}</td>
                                <td className="text-xs whitespace-nowrap">{r.endTime ?? '-'}</td>
                                <td className="text-xs tabular-nums">{r.shots}</td>
                                <td className="text-xs tabular-nums">{r.output}</td>
                                <td className="text-xs tabular-nums text-red-400">{r.defectQty}</td>
                                <td className="text-xs tabular-nums">{passRate}%</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </section>

              <section>
                <SectionTitle icon={ShieldCheck} title="质检记录" />
                <div className="card-industrial p-4">
                  {checks.length === 0 ? (
                    <p className="text-sm text-industrial-400 text-center py-2">暂无质检记录</p>
                  ) : (
                    <div className="space-y-3">
                      {checks.map((q) => (
                        <div key={q.id} className="p-3 bg-industrial-800 rounded-lg space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-xs text-industrial-300">
                              <span>{q.checkTime}</span>
                              <span>{q.inspector}</span>
                            </div>
                            <span className={cn('badge', q.result === 'pass' ? 'badge-success' : 'badge-danger')}>
                              {q.result === 'pass' ? '合格' : '不合格'}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <DefectItem label="缩水" pass={q.shrinkage} />
                            <DefectItem label="飞边" pass={q.flash} />
                            <DefectItem label="气泡" pass={q.bubbles} />
                            <DefectItem label="变色" pass={q.discoloration} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

function DefectItem({ label, pass }: { label: string; pass: boolean }) {
  return (
    <span className="flex items-center gap-1 text-xs">
      <span className={pass ? 'text-emerald-400' : 'text-red-400'}>{pass ? '✓' : '✗'}</span>
      <span className="text-industrial-300">{label}</span>
    </span>
  );
}

export default OrderDetailDrawer;
