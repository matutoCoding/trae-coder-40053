import React from 'react';
import { X, Package, Calendar, ClipboardList, Factory, ShieldCheck, FileText } from 'lucide-react';
import { useAppStore } from '@/store';
import { cn } from '@/lib/utils';
import type { OrderStage } from '@/types';

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

const slipStatusConfig: Record<string, { label: string; badge: string }> = {
  pending: { label: '待确认', badge: 'badge-info' },
  partial: { label: '部分缺料', badge: 'badge-warning' },
  completed: { label: '已出库', badge: 'badge-success' },
};

const slipItemStatusConfig: Record<string, { label: string; badge: string }> = {
  ready: { label: '齐备', badge: 'badge-success' },
  shortage: { label: '缺料', badge: 'badge-danger' },
};

const STAGES: { key: OrderStage; label: string }[] = [
  { key: 'pending_schedule', label: '待排产' },
  { key: 'pending_material', label: '待备料' },
  { key: 'pre_production', label: '生产前准备' },
  { key: 'producing', label: '生产中' },
  { key: 'pending_quality', label: '待质检' },
  { key: 'completed', label: '已完成' },
];

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

function OrderStepper({ stage }: { stage: OrderStage }) {
  const currentIndex = STAGES.findIndex((s) => s.key === stage);

  return (
    <div className="flex items-start w-full overflow-x-auto py-2">
      {STAGES.map((s, i) => {
        const isPassed = i < currentIndex;
        const isCurrent = i === currentIndex;

        return (
          <React.Fragment key={s.key}>
            <div className="flex flex-col items-center min-w-[60px]">
              <div
                className={cn(
                  'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0',
                  isPassed && 'bg-primary-500 text-white',
                  isCurrent && 'bg-primary-500/20 text-primary-300 ring-2 ring-primary-400 shadow-[0_0_8px_rgba(59,130,246,0.4)]',
                  !isPassed && !isCurrent && 'bg-industrial-700 text-industrial-500 border border-industrial-600'
                )}
              >
                {isPassed ? '✓' : i + 1}
              </div>
              <span
                className={cn(
                  'text-[10px] mt-1.5 text-center leading-tight whitespace-nowrap',
                  isPassed && 'text-primary-400',
                  isCurrent && 'text-primary-300 font-semibold',
                  !isPassed && !isCurrent && 'text-industrial-500'
                )}
              >
                {s.label}
              </span>
            </div>
            {i < STAGES.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-[2px] mt-2.5 min-w-[12px]',
                  i < currentIndex ? 'bg-primary-500' : 'bg-industrial-700'
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function DefectItem({ label, pass }: { label: string; pass: boolean }) {
  if (pass) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-emerald-900/40 border border-emerald-800">
        <span className="text-emerald-400">✓</span>
        <span className="text-industrial-400">无{label}</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-red-900/40 border border-red-800">
      <span className="text-red-400">✗</span>
      <span className="text-red-400 font-bold">{label}</span>
    </span>
  );
}

function AppearanceResult({ defects }: { defects: { label: string; pass: boolean }[] }) {
  const allPass = defects.every((d) => d.pass);
  if (allPass) {
    return <span className="badge badge-success">外观合格</span>;
  }
  return <span className="badge badge-danger">外观不合格</span>;
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
  const pickingSlips = useAppStore((s) => s.pickingSlips);
  const getOrderStage = useAppStore((s) => s.getOrderStage);

  const order = drawerOrderId ? orders.find((o) => o.id === drawerOrderId) : null;
  const isOpen = drawerOrderId !== null;
  const stage = drawerOrderId ? getOrderStage(drawerOrderId) : 'pending_schedule';

  const machine = order?.machineId ? machines.find((m) => m.id === order.machineId) : null;
  const mold = order?.moldId ? molds.find((m) => m.id === order.moldId) : null;
  const plans = drawerOrderId ? materialPlans.filter((p) => p.orderId === drawerOrderId) : [];
  const records = drawerOrderId ? productionRecords.filter((r) => r.orderId === drawerOrderId) : [];
  const checks = order ? qualityChecks.filter((q) => q.orderNo === order.orderNo) : [];
  const slips = drawerOrderId ? pickingSlips.filter((s) => s.orderId === drawerOrderId) : [];

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
        <div className="px-6 py-4 border-b border-industrial-700 shrink-0 space-y-3">
          <div className="flex items-center justify-between">
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
          <OrderStepper stage={stage} />
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
                <SectionTitle icon={FileText} title="领料单" />
                <div className="card-industrial p-4">
                  {slips.length === 0 ? (
                    <p className="text-sm text-industrial-400 text-center py-2">暂未生成领料单</p>
                  ) : (
                    <div className="space-y-4">
                      {slips.map((slip) => (
                        <div key={slip.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-white font-medium">{slip.formulaName}</span>
                            <span className={cn('badge', slipStatusConfig[slip.status]?.badge)}>
                              {slipStatusConfig[slip.status]?.label}
                            </span>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="text-industrial-400 border-b border-industrial-700">
                                  <th className="text-left py-1.5 pr-2 font-medium">物料</th>
                                  <th className="text-right py-1.5 px-2 font-medium">需求量</th>
                                  <th className="text-right py-1.5 px-2 font-medium">已领量</th>
                                  <th className="text-right py-1.5 px-2 font-medium">缺料量</th>
                                  <th className="text-center py-1.5 pl-2 font-medium">状态</th>
                                </tr>
                              </thead>
                              <tbody>
                                {slip.items.map((item, idx) => (
                                  <tr key={idx} className="border-b border-industrial-800 last:border-0">
                                    <td className="py-1.5 pr-2 text-white">{item.materialName}</td>
                                    <td className="py-1.5 px-2 text-right text-industrial-300 tabular-nums">{item.needKg}{item.unit}</td>
                                    <td className="py-1.5 px-2 text-right text-industrial-300 tabular-nums">{item.pickedKg}{item.unit}</td>
                                    <td className={cn('py-1.5 px-2 text-right tabular-nums', item.shortKg > 0 ? 'text-red-400' : 'text-industrial-300')}>
                                      {item.shortKg}{item.unit}
                                    </td>
                                    <td className="py-1.5 pl-2 text-center">
                                      <span className={cn('badge text-[10px]', slipItemStatusConfig[item.status]?.badge)}>
                                        {slipItemStatusConfig[item.status]?.label}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
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
                      {checks.map((q) => {
                        const defects = [
                          { label: '缩水', pass: q.shrinkage },
                          { label: '飞边', pass: q.flash },
                          { label: '气泡', pass: q.bubbles },
                          { label: '变色', pass: q.discoloration },
                        ];
                        return (
                          <div key={q.id} className="p-3 bg-industrial-800 rounded-lg space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 text-xs text-industrial-300">
                                <span>{q.checkTime}</span>
                                <span>{q.inspector}</span>
                              </div>
                              <AppearanceResult defects={defects} />
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              {defects.map((d) => (
                                <DefectItem key={d.label} label={d.label} pass={d.pass} />
                              ))}
                            </div>
                          </div>
                        );
                      })}
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

export default OrderDetailDrawer;
