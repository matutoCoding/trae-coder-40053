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
  MaterialPlanItem
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
  activeTab: string;
  setActiveTab: (tab: string) => void;
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
}

function nowStr(): string {
  return new Date().toLocaleString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  }).replace(/\//g, '-');
}

export const useAppStore = create<AppState>((set) => ({
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
  activeTab: 'dashboard',
  setActiveTab: (tab) => set({ activeTab: tab }),
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
  endProduction: (productionId, shots, output, defectQty) => set((state2) => {
    const record = state2.productionRecords.find(p => p.id === productionId);
    if (!record) return state2;
    const orderId = record.orderId;
    const machineId = record.machineId;
    const moldId = record.moldId;
    const runtimeMinutes = Math.floor(shots * record.cycleTime / 60);

    const updatedRecord = state2.productionRecords.map(p =>
      p.id === productionId ? { ...p, endTime: nowStr(), shots, output, defectQty } : p
    );
    const order = state2.orders.find(o => o.id === orderId);
    const newCompleted = (order?.completedQty || 0) + output;
    const orderStatus: Order['status'] = newCompleted >= (order?.quantity || 0) ? 'completed' : (order?.status === 'producing' ? 'scheduled' : order?.status || 'scheduled');
    const updatedOrders = state2.orders.map(o =>
      o.id === orderId ? { ...o, completedQty: newCompleted, status: orderStatus } : o
    );
    const updatedMachines = state2.machines.map(m =>
      m.id === machineId ? {
        ...m,
        status: orderStatus === 'completed' ? 'idle' as const : 'running' as const,
        runtime: m.runtime + runtimeMinutes,
      } : m
    );
    const updatedMolds = state2.molds.map(m =>
      m.id === moldId ? { ...m, usageCount: m.usageCount + shots } : m
    );

    let newRecords: MoldUsageRecord[] = state2.moldUsageRecords;
    if (orderStatus === 'completed') {
      const machineObj = updatedMachines.find(m => m.id === machineId);
      const moldObj = updatedMolds.find(m => m.id === moldId);
      newRecords = [
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
        ...state2.moldUsageRecords
      ];
      return {
        productionRecords: updatedRecord,
        orders: updatedOrders,
        machines: updatedMachines,
        molds: updatedMolds.map(m => m.id === moldId ? { ...m, status: 'off_machine' as const } : m),
        moldUsageRecords: newRecords,
      };
    }

    return {
      productionRecords: updatedRecord,
      orders: updatedOrders,
      machines: updatedMachines,
      molds: updatedMolds,
      moldUsageRecords: newRecords,
    };
  }),
  saveMaterialPlan: (plan) => set((state) => ({
    materialPlans: [
      {
        ...plan,
        id: `mp_${Date.now()}`,
        createdAt: nowStr(),
        status: plan.allSufficient ? 'ready' : 'pending',
      },
      ...state.materialPlans,
    ]
  })),
}));
