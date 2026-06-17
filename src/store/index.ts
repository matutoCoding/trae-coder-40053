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
  EnergyRecord, DailyEnergySummary, DashboardStats
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
  activeTab: string;
  setActiveTab: (tab: string) => void;
  addQualityCheck: (check: QualityCheck) => void;
  addMachineParam: (param: MachineParam) => void;
  scheduleOrder: (orderId: string, machineId: string, moldId: string, scheduledDate: string) => void;
  addMoldUsageRecord: (record: MoldUsageRecord) => void;
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
          ? { ...m, currentOrder: orderId, currentMold: moldId, status: 'idle' as const }
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
          time: new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(/\//g, '-'),
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
}));
