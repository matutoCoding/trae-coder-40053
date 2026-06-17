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
  updateMachineParam: (param: MachineParam) => void;
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
  updateMachineParam: (param) => set((state) => ({
    machineParams: state.machineParams.map(p => p.id === param.id ? param : p)
  })),
  addMoldUsageRecord: (record) => set((state) => ({
    moldUsageRecords: [record, ...state.moldUsageRecords]
  })),
}));
