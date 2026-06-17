import { create } from 'zustand';
import {
  mockOrders, mockMachines, mockMolds, mockMachineParams, mockMaterials,
  mockColorFormulas, mockDryingRecords, mockProductionRecords,
  mockQualityChecks, mockMoldUsageRecords, mockEnergyRecords, mockDailyEnergy,
  mockDashboardStats, hourlyOutputData, defectDistribution
} from '@/data/mockData';
import type {
  Order, Machine, Mold, MachineParam, Material, ColorFormula,
  DryingRecord, ProductionRecord, QualityCheck, MoldUsageRecord,
  EnergyRecord, DailyEnergySummary, DashboardStats, MaterialPlan,
  MaterialPlanItem, PickingRecord, PurchaseItem, PickingSlip,
  PickingSlipItem, OrderStage
} from '@/types';

interface AppState {
  orders: Order[];
  machines: Machine[];
  molds: Mold[];
  machineParams: MachineParam[];
  materials: Material[];
  colorFormulas: ColorFormula[];
  dryingRecords: DryingRecord[];
  productionRecords: ProductionRecord[];
  qualityChecks: QualityCheck[];
  moldUsageRecords: MoldUsageRecord[];
  energyRecords: EnergyRecord[];
  dailyEnergy: DailyEnergySummary[];
  dashboardStats: DashboardStats;
  hourlyOutput: { time: string; output: number }[];
  defectStats: { name: string; value: number }[];
  materialPlans: MaterialPlan[];
  pickingRecords: PickingRecord[];
  purchaseItems: PurchaseItem[];
  pickingSlips: PickingSlip[];
  drawerOrderId: string | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openDrawer: (orderId: string) => void;
  closeDrawer: () => void;
  getOrderStage: (orderId: string) => OrderStage;
  addQualityCheck: (check: QualityCheck) => void;
  addMachineParam: (param: MachineParam) => void;
  scheduleOrder: (orderId: string, machineId: string, moldId: string, scheduledDate: string) => void;
  addMoldUsageRecord: (record: MoldUsageRecord) => void;
  startProduction: (orderId: string, machineId: string, moldId: string, cycleTime: number, operator: string) => void;
  endProduction: (productionId: string, shots: number, output: number, defectQty: number) => void;
  saveMaterialPlan: (plan: {
    orderId: string;
    orderNo: string;
    formulaId: string;
    formulaName: string;
    planQty: number;
    items: MaterialPlanItem[];
    allSufficient: boolean;
  }) => void;
  createPickingSlip: (planId: string) => void;
  confirmPickingSlip: (slipId: string, operator: string) => void;
  replenishPickingSlip: (slipId: string) => void;
  markPurchaseOrdered: (purchaseItemId: string) => void;
  receivePurchase: (purchaseItemId: string) => void;
  checkScheduleConflict: (machineId: string, date: string) => Order[];
  getAvailableMachines: (date: string, excludeMachineId?: string) => Machine[];
}

function nowStr(): string {
  return new Date().toLocaleString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  }).replace(/\//g, '-');
}

export const useAppStore = create<AppState>((set, get) => ({
  orders: mockOrders,
  machines: mockMachines,
  molds: mockMolds,
  machineParams: mockMachineParams,
  materials: mockMaterials,
  colorFormulas: mockColorFormulas,
  dryingRecords: mockDryingRecords,
  productionRecords: mockProductionRecords,
  qualityChecks: mockQualityChecks,
  moldUsageRecords: mockMoldUsageRecords,
  energyRecords: mockEnergyRecords,
  dailyEnergy: mockDailyEnergy,
  dashboardStats: mockDashboardStats,
  hourlyOutput: hourlyOutputData,
  defectStats: defectDistribution,
  materialPlans: [],
  pickingRecords: [],
  purchaseItems: [],
  pickingSlips: [],
  drawerOrderId: null,
  activeTab: 'dashboard',
  setActiveTab: (tab) => set({ activeTab: tab }),
  openDrawer: (orderId) => set({ drawerOrderId: orderId }),
  closeDrawer: () => set({ drawerOrderId: null }),
  getOrderStage: (orderId) => {
    const state = get();
    const order = state.orders.find(o => o.id === orderId);
    if (!order) return 'pending_schedule';
    if (order.status === 'completed') return 'completed';
    if (order.status === 'pending') return 'pending_schedule';
    const plan = state.materialPlans.find(p => p.orderId === orderId);
    if (!plan) return 'pending_material';
    if (plan.status === 'pending') return 'pending_material';
    if (plan.status === 'ready') return 'pre_production';
    if (plan.status === 'issued') return order.status === 'producing' ? 'producing' : 'pre_production';
    if (order.status === 'producing') return 'producing';
    if (order.status === 'scheduled') return 'pre_production';
    return 'pending_schedule';
  },
  addQualityCheck: (check) => set((state) => ({ qualityChecks: [check, ...state.qualityChecks] })),
  addMachineParam: (param) => set((state) => ({
    machineParams: [param, ...state.machineParams]
  })),
  scheduleOrder: (orderId, machineId, moldId, scheduledDate) => set((state) => {
    const machine = state.machines.find(m => m.id === machineId);
    const mold = state.molds.find(m => m.id === moldId);
    return {
      orders: state.orders.map(o =>
        o.id === orderId
          ? { ...o, status: 'scheduled' as const, machineId, moldId, scheduledDate }
          : o
      ),
      machines: state.machines.map(m =>
        m.id === machineId
          ? { ...m, currentOrder: orderId, currentMold: moldId, status: (m.status === 'maintenance' ? 'maintenance' : 'idle') as Machine['status'] }
          : m
      ),
      molds: state.molds.map(m =>
        m.id === moldId
          ? { ...m, status: 'on_machine' as const }
          : m
      ),
      moldUsageRecords: [
        {
          id: `mur_${Date.now()}`,
          moldId,
          moldNo: mold?.moldNo || '',
          machineId,
          machineName: machine ? `${machine.machineNo} ${machine.name}` : '',
          action: 'mount' as const,
          time: nowStr(),
          operator: '管理员',
          remark: `排产订单关联装模`
        },
        ...state.moldUsageRecords
      ]
    };
  }),
  addMoldUsageRecord: (record) => set((state) => ({
    moldUsageRecords: [record, ...state.moldUsageRecords]
  })),
  startProduction: (orderId, machineId, moldId, cycleTime, operator) => set((state) => {
    const machine = state.machines.find(m => m.id === machineId);
    const mold = state.molds.find(m => m.id === moldId);
    const order = state.orders.find(o => o.id === orderId);
    const newRecord: ProductionRecord = {
      id: `pr_${Date.now()}`,
      orderId,
      orderNo: order?.orderNo || '',
      machineId,
      machineName: machine ? `${machine.machineNo} ${machine.name}` : '',
      moldId,
      moldName: mold?.name || '',
      startTime: nowStr(),
      endTime: undefined,
      cycleTime,
      shots: 0,
      output: 0,
      defectQty: 0,
      operator,
    };
    return {
      orders: state.orders.map(o => o.id === orderId ? { ...o, status: 'producing' as const } : o),
      machines: state.machines.map(m => m.id === machineId ? {
        ...m,
        status: 'running' as const,
        currentOrder: orderId,
        currentMold: moldId,
        operator,
        runtime: m.runtime,
      } : m),
      productionRecords: [newRecord, ...state.productionRecords],
    };
  }),
  endProduction: (productionId, shots, output, defectQty) => set((state) => {
    const record = state.productionRecords.find(p => p.id === productionId);
    if (!record) return state;
    const orderId = record.orderId;
    const machineId = record.machineId;
    const moldId = record.moldId;
    const runtimeMinutes = Math.floor(shots * record.cycleTime / 60);

    const updatedRecord = state.productionRecords.map(p =>
      p.id === productionId ? { ...p, endTime: nowStr(), shots, output, defectQty } : p
    );
    const order = state.orders.find(o => o.id === orderId);
    const newCompleted = (order?.completedQty || 0) + output;
    const orderStatus: Order['status'] = newCompleted >= (order?.quantity || 0) ? 'completed' : (order?.status === 'producing' ? 'scheduled' : order?.status || 'scheduled');
    const updatedOrders = state.orders.map(o =>
      o.id === orderId ? { ...o, completedQty: newCompleted, status: orderStatus } : o
    );
    const updatedMachines = state.machines.map(m =>
      m.id === machineId ? {
        ...m,
        status: orderStatus === 'completed' ? 'idle' as const : 'running' as const,
        runtime: m.runtime + runtimeMinutes,
      } : m
    );
    const updatedMolds = state.molds.map(m =>
      m.id === moldId ? { ...m, usageCount: m.usageCount + shots } : m
    );

    if (orderStatus === 'completed') {
      const machineObj = updatedMachines.find(m => m.id === machineId);
      const moldObj = updatedMolds.find(m => m.id === moldId);
      return {
        productionRecords: updatedRecord,
        orders: updatedOrders,
        machines: updatedMachines,
        molds: updatedMolds.map(m => m.id === moldId ? { ...m, status: 'off_machine' as const } : m),
        moldUsageRecords: [
          {
            id: `mur_${Date.now()}_end`,
            moldId,
            moldNo: moldObj?.moldNo || '',
            machineId,
            machineName: machineObj ? `${machineObj.machineNo} ${machineObj.name}` : '',
            action: 'dismount' as const,
            time: nowStr(),
            operator: record.operator,
            remark: '订单完成，模具下架',
          },
          ...state.moldUsageRecords
        ]
      };
    }

    return {
      productionRecords: updatedRecord,
      orders: updatedOrders,
      machines: updatedMachines,
      molds: updatedMolds,
    };
  }),
  saveMaterialPlan: (plan) => set((state) => {
    const newPlan: MaterialPlan = {
      ...plan,
      id: `mp_${Date.now()}`,
      createdAt: nowStr(),
      status: plan.allSufficient ? 'ready' : 'pending',
    };

    const newPurchaseItems: PurchaseItem[] = [];
    if (!plan.allSufficient) {
      plan.items.forEach(item => {
        if (!item.sufficient) {
          const shortage = Math.round((item.needKg - item.stock) * 100) / 100;
          newPurchaseItems.push({
            id: `pi_${Date.now()}_${item.materialName}`,
            materialName: item.materialName,
            needKg: item.needKg,
            stockKg: item.stock,
            shortageKg: shortage,
            orderId: plan.orderId,
            orderNo: plan.orderNo,
            status: 'pending',
            createdAt: nowStr(),
          });
        }
      });
    }

    return {
      materialPlans: [newPlan, ...state.materialPlans],
      purchaseItems: [...newPurchaseItems, ...state.purchaseItems],
    };
  }),
  createPickingSlip: (planId) => set((state) => {
    const plan = state.materialPlans.find(p => p.id === planId);
    if (!plan || plan.status === 'issued') return state;

    const slipItems: PickingSlipItem[] = plan.items.map(item => {
      const mat = state.materials.find(m => m.name === item.materialName);
      const stock = mat?.stock ?? 0;
      const canPick = Math.min(item.needKg, stock);
      const short = Math.round((item.needKg - canPick) * 100) / 100;
      return {
        materialName: item.materialName,
        needKg: item.needKg,
        pickedKg: Math.round(canPick * 100) / 100,
        shortKg: short,
        unit: 'kg',
        status: short > 0 ? 'shortage' as const : 'ready' as const,
      };
    });

    const hasShortage = slipItems.some(i => i.status === 'shortage');

    const newSlip: PickingSlip = {
      id: `ps_${Date.now()}`,
      planId: plan.id,
      orderId: plan.orderId,
      orderNo: plan.orderNo,
      formulaName: plan.formulaName,
      items: slipItems,
      status: hasShortage ? 'partial' : 'pending',
      operator: '仓库管理员',
      createdAt: nowStr(),
    };

    return {
      pickingSlips: [newSlip, ...state.pickingSlips],
    };
  }),
  confirmPickingSlip: (slipId, operator) => set((state) => {
    const slip = state.pickingSlips.find(s => s.id === slipId);
    if (!slip) return state;

    let updatedMaterials = [...state.materials];
    const pickingItems: { materialName: string; qty: number; unit: string }[] = [];
    const newPurchaseItems: PurchaseItem[] = [];

    slip.items.forEach(item => {
      const matIdx = updatedMaterials.findIndex(m => m.name === item.materialName);
      if (matIdx >= 0) {
        const mat = updatedMaterials[matIdx];
        if (item.pickedKg > 0) {
          updatedMaterials[matIdx] = { ...mat, stock: Math.round((mat.stock - item.pickedKg) * 100) / 100 };
          pickingItems.push({ materialName: item.materialName, qty: item.pickedKg, unit: 'kg' });
        }
        if (item.shortKg > 0) {
          newPurchaseItems.push({
            id: `pi_${Date.now()}_${item.materialName}`,
            materialName: item.materialName,
            needKg: item.needKg,
            stockKg: 0,
            shortageKg: item.shortKg,
            orderId: slip.orderId,
            orderNo: slip.orderNo,
            status: 'pending',
            createdAt: nowStr(),
          });
        }
      }
    });

    const newPicking: PickingRecord = {
      id: `pk_${Date.now()}`,
      planId: slip.planId,
      orderId: slip.orderId,
      orderNo: slip.orderNo,
      items: pickingItems,
      operator,
      createdAt: nowStr(),
    };

    const slipStatus: PickingSlip['status'] = slip.items.every(i => i.status === 'ready') ? 'completed' : 'partial';
    const planStatus: MaterialPlan['status'] = slip.items.every(i => i.status === 'ready') ? 'issued' : 'pending';

    return {
      materials: updatedMaterials,
      pickingRecords: [newPicking, ...state.pickingRecords],
      purchaseItems: [...newPurchaseItems, ...state.purchaseItems],
      pickingSlips: state.pickingSlips.map(s =>
        s.id === slipId ? { ...s, status: slipStatus, confirmedAt: nowStr() } : s
      ),
      materialPlans: state.materialPlans.map(p =>
        p.id === slip.planId ? { ...p, status: planStatus } : p
      ),
    };
  }),
  replenishPickingSlip: (slipId) => set((state) => {
    const slip = state.pickingSlips.find(s => s.id === slipId);
    if (!slip) return state;

    const updatedItems = slip.items.map(item => {
      if (item.status === 'shortage') {
        const mat = state.materials.find(m => m.name === item.materialName);
        const stock = mat?.stock ?? 0;
        const canPick = Math.min(item.shortKg, stock);
        const newShort = Math.round((item.shortKg - canPick) * 100) / 100;
        return {
          ...item,
          pickedKg: Math.round((item.pickedKg + canPick) * 100) / 100,
          shortKg: newShort,
          status: newShort > 0 ? 'shortage' as const : 'ready' as const,
        };
      }
      return item;
    });

    const allReady = updatedItems.every(i => i.status === 'ready');

    return {
      pickingSlips: state.pickingSlips.map(s =>
        s.id === slipId ? { ...s, items: updatedItems, status: allReady ? 'pending' : 'partial' } : s
      ),
    };
  }),
  markPurchaseOrdered: (purchaseItemId) => set((state) => ({
    purchaseItems: state.purchaseItems.map(p =>
      p.id === purchaseItemId ? { ...p, status: 'ordered' as const } : p
    ),
  })),
  receivePurchase: (purchaseItemId) => set((state) => {
    const pi = state.purchaseItems.find(p => p.id === purchaseItemId);
    if (!pi) return state;

    const updatedPurchase = state.purchaseItems.map(p =>
      p.id === purchaseItemId ? { ...p, status: 'received' as const, receivedAt: nowStr() } : p
    );

    const matIdx = state.materials.findIndex(m => m.name === pi.materialName);
    const updatedMaterials = matIdx >= 0
      ? state.materials.map((m, i) => i === matIdx ? { ...m, stock: Math.round((m.stock + pi.shortageKg) * 100) / 100 } : m)
      : state.materials;

    const orderPurchases = updatedPurchase.filter(p => p.orderId === pi.orderId && p.status !== 'received');
    const allReceived = orderPurchases.length === 0;

    const updatedPlans = allReceived
      ? state.materialPlans.map(p =>
          p.orderId === pi.orderId && p.status === 'pending'
            ? { ...p, status: 'ready' as const, items: p.items.map(item => {
                const mat = updatedMaterials.find(m => m.name === item.materialName);
                return mat ? { ...item, stock: mat.stock, sufficient: mat.stock >= item.needKg } : item;
              }), allSufficient: true }
            : p
        )
      : state.materialPlans;

    const updatedSlips = state.pickingSlips.map(s => {
      if (s.orderId !== pi.orderId) return s;
      const updatedItems = s.items.map(item => {
        if (item.materialName === pi.materialName && item.status === 'shortage') {
          const mat = updatedMaterials.find(m => m.name === item.materialName);
          const stock = mat?.stock ?? 0;
          const canPick = Math.min(item.shortKg, stock);
          const newShort = Math.round((item.shortKg - canPick) * 100) / 100;
          return {
            ...item,
            pickedKg: Math.round((item.pickedKg + canPick) * 100) / 100,
            shortKg: newShort,
            status: newShort > 0 ? 'shortage' as const : 'ready' as const,
          };
        }
        return item;
      });
      const allReady = updatedItems.every(i => i.status === 'ready');
      const newSlipStatus: PickingSlip['status'] = allReady ? 'pending' : (s.status === 'partial' ? 'partial' : s.status);
      return { ...s, items: updatedItems, status: newSlipStatus };
    });

    return {
      purchaseItems: updatedPurchase,
      materials: updatedMaterials,
      materialPlans: updatedPlans,
      pickingSlips: updatedSlips,
    };
  }),
  checkScheduleConflict: (machineId, date) => {
    const state = get();
    return state.orders.filter(o =>
      o.machineId === machineId && o.scheduledDate === date && o.status !== 'completed' && o.status !== 'pending'
    );
  },
  getAvailableMachines: (date, excludeMachineId) => {
    const state = get();
    const conflictCounts: Record<string, number> = {};
    state.orders.forEach(o => {
      if (o.machineId && o.scheduledDate === date && o.status !== 'completed' && o.status !== 'pending') {
        conflictCounts[o.machineId] = (conflictCounts[o.machineId] || 0) + 1;
      }
    });
    return state.machines.filter(m => {
      if (m.status === 'maintenance') return false;
      if (m.id === excludeMachineId) return false;
      return (conflictCounts[m.id] || 0) === 0;
    });
  },
}));
