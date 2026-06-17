import { useState, useMemo } from 'react';
import PageHeader from '@/components/PageHeader';
import { useAppStore } from '@/store';
import {
  Package, Thermometer, Palette, Plus, AlertTriangle,
  CheckCircle2, Clock, Calculator, ShoppingCart, Box,
  ClipboardList, ChevronDown, ChevronRight, Search
} from 'lucide-react';

type TabKey = 'materials' | 'drying' | 'formula' | 'calc' | 'plans';

const tabConfig = [
  { key: 'materials' as TabKey, label: '原料管理', icon: Package },
  { key: 'drying' as TabKey, label: '烘干记录', icon: Thermometer },
  { key: 'formula' as TabKey, label: '色母配方', icon: Palette },
  { key: 'calc' as TabKey, label: '配方试算', icon: Calculator },
  { key: 'plans' as TabKey, label: '备料清单', icon: ClipboardList },
];

export default function Materials() {
  const [activeTab, setActiveTab] = useState<TabKey>('materials');
  const { materials, dryingRecords, colorFormulas, orders, materialPlans, saveMaterialPlan, setActiveTab: setStoreActiveTab } = useAppStore();

  const [calcOrderId, setCalcOrderId] = useState('');
  const [calcFormulaId, setCalcFormulaId] = useState('');
  const [calcQty, setCalcQty] = useState<number>(0);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [planSearch, setPlanSearch] = useState('');
  const [planStatusFilter, setPlanStatusFilter] = useState<'all' | 'pending' | 'ready'>('all');
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);

  const selectedOrder = orders.find(o => o.id === calcOrderId);
  const selectedFormula = colorFormulas.find(f => f.id === calcFormulaId);

  const autoFormula = useMemo(() => {
    if (!selectedOrder) return null;
    return colorFormulas.find(f => f.productName === selectedOrder.productName) ?? null;
  }, [selectedOrder, colorFormulas]);

  const effectiveFormula = selectedFormula || autoFormula;

  const baseMaterial = useMemo(() => {
    if (!effectiveFormula) return null;
    return materials.find(m => m.name === effectiveFormula.baseMaterial) ?? null;
  }, [effectiveFormula, materials]);

  const calcResults = useMemo(() => {
    if (!effectiveFormula || !calcQty || calcQty <= 0) return null;

    const singleWeight = effectiveFormula.totalWeight;
    const totalBatches = Math.ceil(calcQty / 1);

    const baseNeed = (singleWeight * totalBatches) / 1000;
    const colorMasterNeeds = effectiveFormula.colorMaster.map(cm => {
      const needKg = (singleWeight * cm.ratio / 100) * totalBatches / 1000;
      const mat = materials.find(m => m.name === cm.name);
      return {
        name: cm.name,
        ratio: cm.ratio,
        needKg: Math.round(needKg * 100) / 100,
        stock: mat?.stock ?? 0,
        sufficient: (mat?.stock ?? 0) >= needKg,
      };
    });

    const baseSufficient = (baseMaterial?.stock ?? 0) >= baseNeed;

    return {
      totalBatches,
      baseNeed: Math.round(baseNeed * 100) / 100,
      baseStock: baseMaterial?.stock ?? 0,
      baseSufficient,
      colorMasterNeeds,
      allSufficient: baseSufficient && colorMasterNeeds.every(c => c.sufficient),
    };
  }, [effectiveFormula, calcQty, baseMaterial, materials]);

  const existingPlanForOrder = useMemo(() => {
    if (!selectedOrder) return null;
    return materialPlans.find(p => p.orderId === selectedOrder.id) ?? null;
  }, [selectedOrder, materialPlans]);

  const handleOrderChange = (orderId: string) => {
    setCalcOrderId(orderId);
    setCalcFormulaId('');
    setCalcQty(0);
    setSaveSuccess(false);
  };

  const handleSaveMaterialPlan = () => {
    if (!selectedOrder || !effectiveFormula || !calcResults) return;
    saveMaterialPlan({
      orderId: selectedOrder.id,
      orderNo: selectedOrder.orderNo,
      formulaId: effectiveFormula.id,
      formulaName: effectiveFormula.name,
      planQty: calcQty,
      items: [
        { materialName: baseMaterial!.name, needKg: calcResults.baseNeed, stock: calcResults.baseStock, sufficient: calcResults.baseSufficient },
        ...calcResults.colorMasterNeeds.map(c => ({ materialName: c.name, needKg: c.needKg, stock: c.stock, sufficient: c.sufficient }))
      ],
      allSufficient: calcResults.allSufficient
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const filteredMaterialPlans = useMemo(() => {
    return materialPlans.filter(p => {
      const search = planSearch.toLowerCase().trim();
      const matchSearch = !search ||
        p.orderNo.toLowerCase().includes(search) ||
        p.formulaName.toLowerCase().includes(search);
      const matchStatus = planStatusFilter === 'all' || p.status === planStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [materialPlans, planSearch, planStatusFilter]);

  const handleOrderClick = (orderId: string) => {
    setStoreActiveTab('orders');
    window.location.hash = '#/orders';
  };

  return (
    <div className="p-6">
      <PageHeader
        title="原料配色管理"
        description="管理原料库存、烘干记录、色母配方及用量试算"
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
                      <span className={m.stock < 5000 ? 'text-amber-400 font-medium' : 'text-white'}>
                        {m.stock.toLocaleString()}
                      </span>
                    </td>
                    <td className="text-industrial-300">{m.dryingTemp}</td>
                    <td className="text-industrial-300">{m.dryingTime}</td>
                    <td className="text-industrial-300">{m.supplier}</td>
                    <td>
                      {m.stock < 5000 ? (
                        <span className="badge badge-warning flex items-center gap-1 w-fit">
                          <AlertTriangle size={12} />库存预警
                        </span>
                      ) : (
                        <span className="badge badge-secondary flex items-center gap-1 w-fit">
                          <CheckCircle2 size={12} />正常
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
                          <Clock size={12} className="animate-pulse" />烘干中
                        </span>
                      ) : (
                        <span className="badge badge-success flex items-center gap-1 w-fit">
                          <CheckCircle2 size={12} />已完成
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
                          <span key={idx} className="badge badge-info">
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

      {activeTab === 'calc' && (
        <div className="space-y-6">
          <div className="card-industrial p-5">
            <h3 className="text-sm font-medium text-industrial-200 flex items-center gap-2 mb-4">
              <Calculator size={16} />
              配方试算
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-industrial-300 mb-1.5">
                  <ShoppingCart className="w-3.5 h-3.5 inline mr-1.5" />
                  选择订单（自动匹配配方）
                </label>
                <select
                  value={calcOrderId}
                  onChange={e => handleOrderChange(e.target.value)}
                  className="input-industrial appearance-none"
                >
                  <option value="">请选择订单</option>
                  {orders.map(o => (
                    <option key={o.id} value={o.id}>
                      {o.orderNo} - {o.productName} ({o.quantity}件)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-industrial-300 mb-1.5">
                  <Palette className="w-3.5 h-3.5 inline mr-1.5" />
                  选择配方
                  {autoFormula && <span className="text-primary-400 ml-1.5">(已自动匹配)</span>}
                </label>
                <select
                  value={calcFormulaId || autoFormula?.id || ''}
                  onChange={e => setCalcFormulaId(e.target.value)}
                  className="input-industrial appearance-none"
                >
                  <option value="">请选择配方</option>
                  {colorFormulas.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.name} - {f.productName} (基料: {f.baseMaterial})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-industrial-300 mb-1.5">
                  <Box className="w-3.5 h-3.5 inline mr-1.5" />
                  计划生产数量
                  {selectedOrder && <span className="text-industrial-500 ml-1.5">(订单: {selectedOrder.quantity})</span>}
                </label>
                <input
                  type="number"
                  value={calcQty || ''}
                  onChange={e => setCalcQty(Number(e.target.value))}
                  placeholder="输入计划生产数量"
                  className="input-industrial"
                />
              </div>
            </div>

            {existingPlanForOrder && (
              <div className="mt-4 p-3 bg-primary-900/20 border border-primary-700/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-primary-400" />
                  <span className="text-primary-300 text-sm">
                    该订单已有备料清单（创建于 {existingPlanForOrder.createdAt}，
                    状态 {existingPlanForOrder.status === 'ready' ? '已备齐' : '待备料'}），新保存将追加一条记录
                  </span>
                </div>
              </div>
            )}
          </div>

          {effectiveFormula && calcQty > 0 && calcResults && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card-industrial p-5">
                <h3 className="text-sm font-medium text-industrial-200 flex items-center gap-2 mb-4">
                  <Package size={16} />
                  用量计算结果
                </h3>

                <div className="mb-4 p-3 bg-industrial-900/50 rounded-lg">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-industrial-400">配方</span>
                    <span className="text-white">{effectiveFormula.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-industrial-400">基料</span>
                    <span className="text-white">{effectiveFormula.baseMaterial}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-industrial-400">单次投料量</span>
                    <span className="text-white">{effectiveFormula.totalWeight} kg</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-3 rounded-lg border border-industrial-700 bg-industrial-900/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium text-sm">基料: {effectiveFormula.baseMaterial}</span>
                      {calcResults.baseSufficient ? (
                        <span className="badge badge-success text-xs">库存充足</span>
                      ) : (
                        <span className="badge badge-danger text-xs">库存不足</span>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <p className="text-industrial-500 text-xs">需要量</p>
                        <p className="text-white font-medium">{calcResults.baseNeed} kg</p>
                      </div>
                      <div>
                        <p className="text-industrial-500 text-xs">当前库存</p>
                        <p className="text-white font-medium">{calcResults.baseStock.toLocaleString()} kg</p>
                      </div>
                      <div>
                        <p className="text-industrial-500 text-xs">差额</p>
                        <p className={`font-medium ${calcResults.baseSufficient ? 'text-emerald-400' : 'text-red-400'}`}>
                          {calcResults.baseSufficient ? '+' : ''}{(calcResults.baseStock - calcResults.baseNeed).toFixed(2)} kg
                        </p>
                      </div>
                    </div>
                  </div>

                  {calcResults.colorMasterNeeds.map((cm, idx) => (
                    <div key={idx} className="p-3 rounded-lg border border-industrial-700 bg-industrial-900/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium text-sm">色母: {cm.name}</span>
                        {cm.sufficient ? (
                          <span className="badge badge-success text-xs">库存充足</span>
                        ) : (
                          <span className="badge badge-danger text-xs">库存不足</span>
                        )}
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-sm">
                        <div>
                          <p className="text-industrial-500 text-xs">添加比例</p>
                          <p className="text-white font-medium">{cm.ratio}%</p>
                        </div>
                        <div>
                          <p className="text-industrial-500 text-xs">需要量</p>
                          <p className="text-white font-medium">{cm.needKg} kg</p>
                        </div>
                        <div>
                          <p className="text-industrial-500 text-xs">当前库存</p>
                          <p className="text-white font-medium">{cm.stock.toLocaleString()} kg</p>
                        </div>
                        <div>
                          <p className="text-industrial-500 text-xs">差额</p>
                          <p className={`font-medium ${cm.sufficient ? 'text-emerald-400' : 'text-red-400'}`}>
                            {cm.sufficient ? '+' : ''}{(cm.stock - cm.needKg).toFixed(2)} kg
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card-industrial p-5">
                <h3 className="text-sm font-medium text-industrial-200 flex items-center gap-2 mb-4">
                  <CheckCircle2 size={16} />
                  试算汇总
                </h3>

                <div className={`p-4 rounded-lg border-2 mb-4 ${
                  calcResults.allSufficient
                    ? 'bg-emerald-900/20 border-emerald-700/50'
                    : 'bg-red-900/20 border-red-700/50'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {calcResults.allSufficient ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                    )}
                    <span className={`text-base font-bold ${calcResults.allSufficient ? 'text-emerald-400' : 'text-red-400'}`}>
                      {calcResults.allSufficient ? '所有原料库存充足，可以开始生产' : '部分原料库存不足，需要补充采购'}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between p-2 bg-industrial-900/30 rounded">
                    <span className="text-industrial-400">计划产量</span>
                    <span className="text-white font-medium">{calcQty.toLocaleString()} 件</span>
                  </div>
                  <div className="flex justify-between p-2 bg-industrial-900/30 rounded">
                    <span className="text-industrial-400">基料需求</span>
                    <span className="text-white font-medium">{calcResults.baseNeed} kg ({effectiveFormula.baseMaterial})</span>
                  </div>
                  {calcResults.colorMasterNeeds.map((cm, idx) => (
                    <div key={idx} className="flex justify-between p-2 bg-industrial-900/30 rounded">
                      <span className="text-industrial-400">色母: {cm.name}</span>
                      <span className="text-white font-medium">{cm.needKg} kg</span>
                    </div>
                  ))}
                  <div className="flex justify-between p-2 bg-industrial-900/30 rounded border-t border-industrial-700 pt-3">
                    <span className="text-industrial-400">原料总重</span>
                    <span className="text-white font-bold">
                      {(calcResults.baseNeed + calcResults.colorMasterNeeds.reduce((s, c) => s + c.needKg, 0)).toFixed(2)} kg
                    </span>
                  </div>
                </div>

                {!calcResults.allSufficient && (
                  <div className="mt-4 p-3 bg-red-900/20 border border-red-800/50 rounded-lg">
                    <p className="text-red-400 text-sm font-medium mb-2">需要采购的原料:</p>
                    <ul className="space-y-1 text-sm">
                      {!calcResults.baseSufficient && (
                        <li className="text-red-300">
                          {effectiveFormula.baseMaterial}: 需补充 {Math.abs(calcResults.baseStock - calcResults.baseNeed).toFixed(2)} kg
                        </li>
                      )}
                      {calcResults.colorMasterNeeds.filter(c => !c.sufficient).map((cm, idx) => (
                        <li key={idx} className="text-red-300">
                          {cm.name}: 需补充 {Math.abs(cm.stock - cm.needKg).toFixed(2)} kg
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-6 pt-4 border-t border-industrial-700">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      {!selectedOrder && (
                        <p className="text-industrial-500 text-xs flex items-center gap-1">
                          <AlertTriangle size={12} />
                          请先选择订单后再保存备料清单
                        </p>
                      )}
                      {saveSuccess && (
                        <span className="badge badge-success flex items-center gap-1 w-fit">
                          <CheckCircle2 size={12} />
                          备料清单保存成功
                        </span>
                      )}
                    </div>
                    <button
                      onClick={handleSaveMaterialPlan}
                      disabled={!selectedOrder}
                      className={`btn-primary flex items-center gap-2 ${
                        !selectedOrder ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <ClipboardList size={16} />
                      保存为备料清单
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {(!effectiveFormula || !calcQty || calcQty <= 0) && (
            <div className="card-industrial p-12 text-center">
              <Calculator className="w-12 h-12 text-industrial-600 mx-auto mb-3" />
              <p className="text-industrial-400">请选择订单/配方并输入计划生产数量</p>
              <p className="text-industrial-500 text-sm mt-1">选择订单后会自动匹配对应的产品配方</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'plans' && (
        <div className="space-y-5">
          <div className="card-industrial p-5">
            <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-industrial-500" />
                <input
                  type="text"
                  value={planSearch}
                  onChange={e => setPlanSearch(e.target.value)}
                  placeholder="搜索订单号 / 配方名"
                  className="input-industrial pl-10"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPlanStatusFilter('all')}
                  className={`px-4 py-2 text-sm rounded-lg transition-all ${
                    planStatusFilter === 'all'
                      ? 'bg-primary-600 text-white'
                      : 'bg-industrial-800 text-industrial-300 hover:bg-industrial-700'
                  }`}
                >
                  全部
                </button>
                <button
                  onClick={() => setPlanStatusFilter('pending')}
                  className={`px-4 py-2 text-sm rounded-lg transition-all ${
                    planStatusFilter === 'pending'
                      ? 'bg-amber-600 text-white'
                      : 'bg-industrial-800 text-industrial-300 hover:bg-industrial-700'
                  }`}
                >
                  待备料
                </button>
                <button
                  onClick={() => setPlanStatusFilter('ready')}
                  className={`px-4 py-2 text-sm rounded-lg transition-all ${
                    planStatusFilter === 'ready'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-industrial-800 text-industrial-300 hover:bg-industrial-700'
                  }`}
                >
                  已备齐
                </button>
              </div>
            </div>
          </div>

          <div className="card-industrial overflow-hidden">
            {filteredMaterialPlans.length === 0 ? (
              <div className="p-12 text-center">
                <ClipboardList className="w-12 h-12 text-industrial-600 mx-auto mb-3" />
                <p className="text-industrial-400">暂无备料清单</p>
                <p className="text-industrial-500 text-sm mt-1">请先在"配方试算"中保存备料</p>
              </div>
            ) : (
              <div className="overflow-x-auto scrollbar-thin">
                <table className="table-industrial">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}></th>
                      <th>订单号</th>
                      <th>配方名</th>
                      <th>计划数量</th>
                      <th>备料项</th>
                      <th>状态</th>
                      <th>创建时间</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMaterialPlans.map((plan) => {
                      const isExpanded = expandedPlanId === plan.id;
                      return (
                        <>
                          <tr key={plan.id}>
                            <td>
                              <button
                                onClick={() => setExpandedPlanId(isExpanded ? null : plan.id)}
                                className="p-1 rounded hover:bg-industrial-800 text-industrial-400 hover:text-white transition-colors"
                              >
                                {isExpanded ? (
                                  <ChevronDown size={16} />
                                ) : (
                                  <ChevronRight size={16} />
                                )}
                              </button>
                            </td>
                            <td
                              onClick={() => handleOrderClick(plan.orderId)}
                              className="cursor-pointer text-primary-400 hover:text-primary-300 font-medium"
                            >
                              {plan.orderNo}
                            </td>
                            <td className="text-white font-medium">{plan.formulaName}</td>
                            <td className="text-industrial-300">{plan.planQty.toLocaleString()} 件</td>
                            <td>
                              <div className="flex flex-wrap gap-1.5">
                                {plan.items.map((item, idx) => (
                                  <span
                                    key={idx}
                                    className={`badge ${item.sufficient ? 'badge-success' : 'badge-danger'} text-xs`}
                                  >
                                    {item.materialName}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td>
                              {plan.status === 'ready' ? (
                                <span className="badge badge-success flex items-center gap-1 w-fit">
                                  <CheckCircle2 size={12} />
                                  已备齐
                                </span>
                              ) : (
                                <span className="badge badge-warning flex items-center gap-1 w-fit">
                                  <Clock size={12} />
                                  待备料
                                </span>
                              )}
                            </td>
                            <td className="text-industrial-400 text-sm">{plan.createdAt}</td>
                          </tr>
                          {isExpanded && (
                            <tr key={`${plan.id}_detail`}>
                              <td colSpan={7} className="bg-industrial-900/50 border-b border-industrial-700">
                                <div className="p-4">
                                  <p className="text-sm text-industrial-300 font-medium mb-3">备料项详情</p>
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {plan.items.map((item, idx) => (
                                      <div
                                        key={idx}
                                        className="p-3 rounded-lg border border-industrial-700 bg-industrial-800/50"
                                      >
                                        <div className="flex items-center justify-between mb-2">
                                          <span className="text-white font-medium text-sm">
                                            {item.materialName}
                                          </span>
                                          {item.sufficient ? (
                                            <span className="badge badge-success text-xs">
                                              充足
                                            </span>
                                          ) : (
                                            <span className="badge badge-danger text-xs">
                                              不足
                                            </span>
                                          )}
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 text-xs">
                                          <div>
                                            <p className="text-industrial-500">需要kg</p>
                                            <p className="text-white">{item.needKg}</p>
                                          </div>
                                          <div>
                                            <p className="text-industrial-500">当前库存</p>
                                            <p className="text-white">{item.stock.toLocaleString()}</p>
                                          </div>
                                          <div>
                                            <p className="text-industrial-500">差额</p>
                                            <p className={item.sufficient ? 'text-emerald-400' : 'text-red-400'}>
                                              {item.sufficient ? '+' : ''}
                                              {(item.stock - item.needKg).toFixed(2)}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
