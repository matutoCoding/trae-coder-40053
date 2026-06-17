export type OrderStatus = 'pending' | 'scheduled' | 'producing' | 'completed';
export type MachineStatus = 'running' | 'idle' | 'maintenance';
export type MoldStatus = 'on_machine' | 'off_machine' | 'maintenance';
export type QualityResult = 'pass' | 'fail';

export interface Order {
  id: string;
  orderNo: string;
  productName: string;
  customer: string;
  quantity: number;
  completedQty: number;
  status: OrderStatus;
  scheduledDate: string;
  dueDate: string;
  material: string;
  color: string;
  machineId?: string;
  moldId?: string;
}

export interface Machine {
  id: string;
  machineNo: string;
  name: string;
  tonnage: number;
  status: MachineStatus;
  currentMold?: string;
  currentOrder?: string;
  operator?: string;
  runtime: number;
}

export interface Mold {
  id: string;
  moldNo: string;
  name: string;
  cavities: number;
  usageCount: number;
  status: MoldStatus;
  lastMaintenance: string;
  material: string;
  lifeCycle: number;
}

export interface MachineParam {
  id: string;
  machineId: string;
  machineName: string;
  injectionPressure: number;
  holdingPressure: number;
  holdingTime: number;
  moldTemp: number;
  cycleTime: number;
  injectionSpeed: number;
  coolingTime: number;
  effectiveDate: string;
  operator: string;
}

export interface Material {
  id: string;
  name: string;
  type: string;
  stock: number;
  unit: string;
  dryingTemp: number;
  dryingTime: number;
  supplier: string;
}

export interface ColorFormula {
  id: string;
  name: string;
  productName: string;
  baseMaterial: string;
  colorMaster: {
    name: string;
    ratio: number;
  }[];
  totalWeight: number;
  createTime: string;
}

export interface DryingRecord {
  id: string;
  materialId: string;
  materialName: string;
  temp: number;
  duration: number;
  startTime: string;
  endTime: string;
  operator: string;
  status: 'drying' | 'completed';
}

export interface ProductionRecord {
  id: string;
  orderId: string;
  orderNo: string;
  machineId: string;
  machineName: string;
  moldId: string;
  moldName: string;
  startTime: string;
  endTime?: string;
  cycleTime: number;
  shots: number;
  output: number;
  defectQty: number;
  operator: string;
}

export interface QualityCheck {
  id: string;
  productionId: string;
  orderNo: string;
  checkTime: string;
  inspector: string;
  shrinkage: boolean;
  flash: boolean;
  bubbles: boolean;
  discoloration: boolean;
  dimensions: DimensionCheck[];
  result: QualityResult;
  remark?: string;
}

export interface DimensionCheck {
  name: string;
  value: number;
  standard: number;
  tolerance: number;
  isPass: boolean;
}

export interface MoldUsageRecord {
  id: string;
  moldId: string;
  moldNo: string;
  machineId: string;
  machineName: string;
  action: 'mount' | 'dismount';
  time: string;
  operator: string;
  remark?: string;
}

export interface EnergyRecord {
  id: string;
  machineId: string;
  machineName: string;
  timestamp: string;
  power: number;
  energy: number;
}

export interface DailyEnergySummary {
  date: string;
  totalEnergy: number;
  peakPower: number;
  cost: number;
}

export interface MaterialPlanItem {
  materialName: string;
  needKg: number;
  stock: number;
  sufficient: boolean;
}

export interface MaterialPlan {
  id: string;
  orderId: string;
  orderNo: string;
  formulaId: string;
  formulaName: string;
  planQty: number;
  items: MaterialPlanItem[];
  allSufficient: boolean;
  createdAt: string;
  status: 'pending' | 'ready';
}

export interface DashboardStats {
  todayOutput: number;
  runningRate: number;
  passRate: number;
  todayEnergy: number;
  pendingOrders: number;
  runningMachines: number;
}
