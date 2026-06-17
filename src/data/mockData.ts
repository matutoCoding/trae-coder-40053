import type {
  Order, Machine, Mold, MachineParam, Material, ColorFormula,
  DryingRecord, ProductionRecord, QualityCheck, MoldUsageRecord,
  EnergyRecord, DailyEnergySummary, DashboardStats
} from '@/types';

export const mockOrders: Order[] = [
  { id: 'o1', orderNo: 'PO202606001', productName: '汽车仪表盘外壳', customer: '华晨汽车', quantity: 5000, completedQty: 3200, status: 'producing', scheduledDate: '2026-06-15', dueDate: '2026-06-20', material: 'PP-T20', color: '深灰色', machineId: 'm1', moldId: 'mo1' },
  { id: 'o2', orderNo: 'PO202606002', productName: '家电遥控器底座', customer: '美的电器', quantity: 10000, completedQty: 0, status: 'scheduled', scheduledDate: '2026-06-17', dueDate: '2026-06-25', material: 'ABS-757', color: '白色', machineId: 'm2', moldId: 'mo2' },
  { id: 'o3', orderNo: 'PO202606003', productName: '医用注射器筒体', customer: '稳健医疗', quantity: 50000, completedQty: 28000, status: 'producing', scheduledDate: '2026-06-14', dueDate: '2026-06-22', material: 'PP-R530A', color: '透明', machineId: 'm3', moldId: 'mo3' },
  { id: 'o4', orderNo: 'PO202606004', productName: '电动工具外壳', customer: '博世电动', quantity: 3000, completedQty: 3000, status: 'completed', scheduledDate: '2026-06-10', dueDate: '2026-06-18', material: 'PA66-GF30', color: '黑色', machineId: 'm4', moldId: 'mo4' },
  { id: 'o5', orderNo: 'PO202606005', productName: '手机充电器外壳', customer: '华为技术', quantity: 20000, completedQty: 0, status: 'pending', scheduledDate: '2026-06-20', dueDate: '2026-06-30', material: 'PC-2805', color: '白色', machineId: undefined, moldId: undefined },
  { id: 'o6', orderNo: 'PO202606006', productName: '食品保鲜盒', customer: '膳魔师', quantity: 8000, completedQty: 1500, status: 'producing', scheduledDate: '2026-06-16', dueDate: '2026-06-24', material: 'PP-5090T', color: '透明蓝', machineId: 'm5', moldId: 'mo5' },
  { id: 'o7', orderNo: 'PO202606007', productName: '工业接线端子', customer: '西门子', quantity: 15000, completedQty: 0, status: 'scheduled', scheduledDate: '2026-06-18', dueDate: '2026-06-28', material: 'PA66', color: '灰色', machineId: 'm6', moldId: 'mo6' },
  { id: 'o8', orderNo: 'PO202606008', productName: '玩具车轮', customer: '乐高玩具', quantity: 30000, completedQty: 0, status: 'pending', scheduledDate: '2026-06-21', dueDate: '2026-07-05', material: 'ABS', color: '多种', machineId: undefined, moldId: undefined },
];

export const mockMachines: Machine[] = [
  { id: 'm1', machineNo: 'IM-001', name: '海天MA1600', tonnage: 160, status: 'running', currentMold: 'mo1', currentOrder: 'o1', operator: '张建国', runtime: 4280 },
  { id: 'm2', machineNo: 'IM-002', name: '海天MA2500', tonnage: 250, status: 'idle', currentMold: undefined, currentOrder: undefined, operator: undefined, runtime: 0 },
  { id: 'm3', machineNo: 'IM-003', name: '震雄JM228', tonnage: 228, status: 'running', currentMold: 'mo3', currentOrder: 'o3', operator: '李明辉', runtime: 6520 },
  { id: 'm4', machineNo: 'IM-004', name: '伊之密UN400', tonnage: 400, status: 'running', currentMold: 'mo4', currentOrder: 'o4', operator: '王志强', runtime: 7200 },
  { id: 'm5', machineNo: 'IM-005', name: '海天MA3800', tonnage: 380, status: 'running', currentMold: 'mo5', currentOrder: 'o6', operator: '陈建华', runtime: 2160 },
  { id: 'm6', machineNo: 'IM-006', name: '震雄JM468', tonnage: 468, status: 'maintenance', currentMold: 'mo6', currentOrder: undefined, operator: undefined, runtime: 0 },
  { id: 'm7', machineNo: 'IM-007', name: '海天MA1200', tonnage: 120, status: 'idle', currentMold: undefined, currentOrder: undefined, operator: undefined, runtime: 0 },
  { id: 'm8', machineNo: 'IM-008', name: '伊之密UN260', tonnage: 260, status: 'running', currentMold: undefined, currentOrder: undefined, operator: '刘海涛', runtime: 540 },
];

export const mockMolds: Mold[] = [
  { id: 'mo1', moldNo: 'M-2026-001', name: '仪表盘外壳模具', cavities: 1, usageCount: 12500, status: 'on_machine', lastMaintenance: '2026-05-20', material: 'S136', lifeCycle: 500000 },
  { id: 'mo2', moldNo: 'M-2026-002', name: '遥控器底座模具', cavities: 4, usageCount: 8900, status: 'off_machine', lastMaintenance: '2026-06-01', material: '718H', lifeCycle: 300000 },
  { id: 'mo3', moldNo: 'M-2026-003', name: '注射器筒体模具', cavities: 16, usageCount: 45000, status: 'on_machine', lastMaintenance: '2026-06-10', material: 'S136', lifeCycle: 1000000 },
  { id: 'mo4', moldNo: 'M-2026-004', name: '电动工具外壳模具', cavities: 2, usageCount: 6800, status: 'on_machine', lastMaintenance: '2026-05-28', material: '718H', lifeCycle: 300000 },
  { id: 'mo5', moldNo: 'M-2026-005', name: '保鲜盒模具', cavities: 2, usageCount: 3200, status: 'on_machine', lastMaintenance: '2026-06-05', material: 'S136', lifeCycle: 500000 },
  { id: 'mo6', moldNo: 'M-2026-006', name: '接线端子模具', cavities: 8, usageCount: 22000, status: 'maintenance', lastMaintenance: '2026-06-17', material: 'SKD11', lifeCycle: 800000 },
  { id: 'mo7', moldNo: 'M-2026-007', name: '玩具车轮模具', cavities: 8, usageCount: 18000, status: 'off_machine', lastMaintenance: '2026-06-08', material: '718H', lifeCycle: 300000 },
  { id: 'mo8', moldNo: 'M-2026-008', name: '充电器外壳模具', cavities: 4, usageCount: 9500, status: 'off_machine', lastMaintenance: '2026-05-30', material: 'S136', lifeCycle: 500000 },
];

export const mockMachineParams: MachineParam[] = [
  { id: 'mp1', machineId: 'm1', machineName: '海天MA1600', injectionPressure: 120, holdingPressure: 85, holdingTime: 8, moldTemp: 60, cycleTime: 45, injectionSpeed: 65, coolingTime: 20, effectiveDate: '2026-06-15 08:30', operator: '张建国' },
  { id: 'mp2', machineId: 'm3', machineName: '震雄JM228', injectionPressure: 95, holdingPressure: 70, holdingTime: 5, moldTemp: 45, cycleTime: 22, injectionSpeed: 75, coolingTime: 12, effectiveDate: '2026-06-14 09:00', operator: '李明辉' },
  { id: 'mp3', machineId: 'm4', machineName: '伊之密UN400', injectionPressure: 150, holdingPressure: 110, holdingTime: 12, moldTemp: 85, cycleTime: 68, injectionSpeed: 55, coolingTime: 35, effectiveDate: '2026-06-10 08:00', operator: '王志强' },
  { id: 'mp4', machineId: 'm5', machineName: '海天MA3800', injectionPressure: 140, holdingPressure: 95, holdingTime: 10, moldTemp: 55, cycleTime: 52, injectionSpeed: 60, coolingTime: 28, effectiveDate: '2026-06-16 07:30', operator: '陈建华' },
];

export const mockMaterials: Material[] = [
  { id: 'mat1', name: 'PP-T20', type: '聚丙烯加纤20%', stock: 8500, unit: 'kg', dryingTemp: 80, dryingTime: 4, supplier: '中石化' },
  { id: 'mat2', name: 'ABS-757', type: 'ABS通用级', stock: 12000, unit: 'kg', dryingTemp: 85, dryingTime: 3, supplier: '奇美实业' },
  { id: 'mat3', name: 'PP-R530A', type: '医用级聚丙烯', stock: 6800, unit: 'kg', dryingTemp: 90, dryingTime: 4, supplier: '燕山石化' },
  { id: 'mat4', name: 'PA66-GF30', type: '尼龙66加纤30%', stock: 3200, unit: 'kg', dryingTemp: 120, dryingTime: 6, supplier: '巴斯夫' },
  { id: 'mat5', name: 'PC-2805', type: '聚碳酸酯', stock: 4500, unit: 'kg', dryingTemp: 120, dryingTime: 5, supplier: '拜耳' },
  { id: 'mat6', name: 'PP-5090T', type: '透明级PP', stock: 5600, unit: 'kg', dryingTemp: 80, dryingTime: 4, supplier: '台塑' },
  { id: 'mat7', name: 'PA66', type: '纯尼龙66', stock: 2800, unit: 'kg', dryingTemp: 110, dryingTime: 5, supplier: '杜邦' },
];

export const mockColorFormulas: ColorFormula[] = [
  {
    id: 'cf1',
    name: '深灰仪表盘',
    productName: '汽车仪表盘外壳',
    baseMaterial: 'PP-T20',
    colorMaster: [
      { name: '黑色母PP-2014', ratio: 2.5 },
      { name: '白色母PP-W01', ratio: 0.8 },
    ],
    totalWeight: 100,
    createTime: '2026-06-15 08:00'
  },
  {
    id: 'cf2',
    name: '纯白遥控器',
    productName: '家电遥控器底座',
    baseMaterial: 'ABS-757',
    colorMaster: [
      { name: '白色母ABS-W02', ratio: 3.0 },
    ],
    totalWeight: 100,
    createTime: '2026-06-16 10:30'
  },
  {
    id: 'cf3',
    name: '透明蓝保鲜盒',
    productName: '食品保鲜盒',
    baseMaterial: 'PP-5090T',
    colorMaster: [
      { name: '蓝色母PP-B03', ratio: 0.5 },
    ],
    totalWeight: 100,
    createTime: '2026-06-16 07:00'
  },
  {
    id: 'cf4',
    name: '增强尼龙黑',
    productName: '电动工具外壳',
    baseMaterial: 'PA66-GF30',
    colorMaster: [
      { name: '黑色母PA-2018', ratio: 3.5 },
    ],
    totalWeight: 100,
    createTime: '2026-06-10 08:00'
  },
];

export const mockDryingRecords: DryingRecord[] = [
  { id: 'dr1', materialId: 'mat1', materialName: 'PP-T20', temp: 80, duration: 4, startTime: '2026-06-17 06:00', endTime: '2026-06-17 10:00', operator: '赵德海', status: 'completed' },
  { id: 'dr2', materialId: 'mat3', materialName: 'PP-R530A', temp: 90, duration: 4, startTime: '2026-06-17 05:30', endTime: '2026-06-17 09:30', operator: '赵德海', status: 'completed' },
  { id: 'dr3', materialId: 'mat6', materialName: 'PP-5090T', temp: 80, duration: 4, startTime: '2026-06-17 07:00', endTime: '', operator: '孙明阳', status: 'drying' },
  { id: 'dr4', materialId: 'mat2', materialName: 'ABS-757', temp: 85, duration: 3, startTime: '2026-06-17 08:00', endTime: '', operator: '孙明阳', status: 'drying' },
  { id: 'dr5', materialId: 'mat4', materialName: 'PA66-GF30', temp: 120, duration: 6, startTime: '2026-06-16 20:00', endTime: '2026-06-17 02:00', operator: '周立峰', status: 'completed' },
];

export const mockProductionRecords: ProductionRecord[] = [
  { id: 'pr1', orderId: 'o1', orderNo: 'PO202606001', machineId: 'm1', machineName: '海天MA1600', moldId: 'mo1', moldName: '仪表盘外壳模具', startTime: '2026-06-17 08:00', endTime: undefined, cycleTime: 45, shots: 560, output: 560, defectQty: 12, operator: '张建国' },
  { id: 'pr2', orderId: 'o3', orderNo: 'PO202606003', machineId: 'm3', machineName: '震雄JM228', moldId: 'mo3', moldName: '注射器筒体模具', startTime: '2026-06-17 06:00', endTime: undefined, cycleTime: 22, shots: 1450, output: 23200, defectQty: 89, operator: '李明辉' },
  { id: 'pr3', orderId: 'o6', orderNo: 'PO202606006', machineId: 'm5', machineName: '海天MA3800', moldId: 'mo5', moldName: '保鲜盒模具', startTime: '2026-06-17 07:30', endTime: undefined, cycleTime: 52, shots: 380, output: 760, defectQty: 18, operator: '陈建华' },
  { id: 'pr4', orderId: 'o4', orderNo: 'PO202606004', machineId: 'm4', machineName: '伊之密UN400', moldId: 'mo4', moldName: '电动工具外壳模具', startTime: '2026-06-17 08:00', endTime: '2026-06-17 11:30', cycleTime: 68, shots: 320, output: 640, defectQty: 8, operator: '王志强' },
  { id: 'pr5', orderId: 'o1', orderNo: 'PO202606001', machineId: 'm1', machineName: '海天MA1600', moldId: 'mo1', moldName: '仪表盘外壳模具', startTime: '2026-06-16 08:00', endTime: '2026-06-16 20:00', cycleTime: 45, shots: 960, output: 960, defectQty: 28, operator: '张建国' },
  { id: 'pr6', orderId: 'o3', orderNo: 'PO202606003', machineId: 'm3', machineName: '震雄JM228', moldId: 'mo3', moldName: '注射器筒体模具', startTime: '2026-06-16 06:00', endTime: '2026-06-16 22:00', cycleTime: 22, shots: 2400, output: 38400, defectQty: 156, operator: '李明辉' },
];

export const mockQualityChecks: QualityCheck[] = [
  { id: 'qc1', productionId: 'pr1', orderNo: 'PO202606001', checkTime: '2026-06-17 09:30', inspector: '林小燕', shrinkage: false, flash: false, bubbles: false, discoloration: false, result: 'pass',
    dimensions: [
      { name: '长度A', value: 150.2, standard: 150.0, tolerance: 0.5, isPass: true },
      { name: '宽度B', value: 85.1, standard: 85.0, tolerance: 0.3, isPass: true },
      { name: '厚度C', value: 2.98, standard: 3.0, tolerance: 0.1, isPass: true },
    ]
  },
  { id: 'qc2', productionId: 'pr1', orderNo: 'PO202606001', checkTime: '2026-06-17 11:00', inspector: '林小燕', shrinkage: true, flash: false, bubbles: false, discoloration: false, result: 'fail', remark: '背面局部缩水，需调整保压',
    dimensions: [
      { name: '长度A', value: 150.3, standard: 150.0, tolerance: 0.5, isPass: true },
      { name: '宽度B', value: 84.7, standard: 85.0, tolerance: 0.3, isPass: false },
      { name: '厚度C', value: 2.88, standard: 3.0, tolerance: 0.1, isPass: false },
    ]
  },
  { id: 'qc3', productionId: 'pr2', orderNo: 'PO202606003', checkTime: '2026-06-17 08:30', inspector: '吴美玲', shrinkage: false, flash: false, bubbles: false, discoloration: false, result: 'pass',
    dimensions: [
      { name: '外径', value: 10.02, standard: 10.0, tolerance: 0.05, isPass: true },
      { name: '内径', value: 8.00, standard: 8.0, tolerance: 0.05, isPass: true },
      { name: '长度', value: 100.1, standard: 100.0, tolerance: 0.2, isPass: true },
    ]
  },
  { id: 'qc4', productionId: 'pr3', orderNo: 'PO202606006', checkTime: '2026-06-17 10:00', inspector: '林小燕', shrinkage: false, flash: true, bubbles: false, discoloration: false, result: 'pass', remark: '合模线轻微飞边，在允许范围内',
    dimensions: [
      { name: '长边', value: 200.15, standard: 200.0, tolerance: 0.3, isPass: true },
      { name: '短边', value: 140.08, standard: 140.0, tolerance: 0.3, isPass: true },
      { name: '高度', value: 65.0, standard: 65.0, tolerance: 0.2, isPass: true },
    ]
  },
  { id: 'qc5', productionId: 'pr2', orderNo: 'PO202606003', checkTime: '2026-06-17 11:30', inspector: '吴美玲', shrinkage: false, flash: false, bubbles: true, discoloration: false, result: 'fail', remark: '端部有细小气泡，需检查干燥',
    dimensions: [
      { name: '外径', value: 10.03, standard: 10.0, tolerance: 0.05, isPass: true },
      { name: '内径', value: 7.96, standard: 8.0, tolerance: 0.05, isPass: false },
      { name: '长度', value: 100.2, standard: 100.0, tolerance: 0.2, isPass: true },
    ]
  },
];

export const mockMoldUsageRecords: MoldUsageRecord[] = [
  { id: 'mur1', moldId: 'mo1', moldNo: 'M-2026-001', machineId: 'm1', machineName: '海天MA1600', action: 'mount', time: '2026-06-15 07:30', operator: '刘伟' },
  { id: 'mur2', moldId: 'mo3', moldNo: 'M-2026-003', machineId: 'm3', machineName: '震雄JM228', action: 'mount', time: '2026-06-14 06:00', operator: '刘伟' },
  { id: 'mur3', moldId: 'mo4', moldNo: 'M-2026-004', machineId: 'm4', machineName: '伊之密UN400', action: 'mount', time: '2026-06-10 07:00', operator: '黄鹏' },
  { id: 'mur4', moldId: 'mo4', moldNo: 'M-2026-004', machineId: 'm4', machineName: '伊之密UN400', action: 'dismount', time: '2026-06-17 11:45', operator: '黄鹏', remark: '订单完成，已入模具库' },
  { id: 'mur5', moldId: 'mo5', moldNo: 'M-2026-005', machineId: 'm5', machineName: '海天MA3800', action: 'mount', time: '2026-06-16 06:30', operator: '刘伟' },
  { id: 'mur6', moldId: 'mo6', moldNo: 'M-2026-006', machineId: 'm6', machineName: '震雄JM468', action: 'dismount', time: '2026-06-17 08:00', operator: '黄鹏', remark: '拆下送维护保养' },
];

export const mockEnergyRecords: EnergyRecord[] = [
  { id: 'e1', machineId: 'm1', machineName: '海天MA1600', timestamp: '2026-06-17 08:00', power: 18.5, energy: 148.0 },
  { id: 'e2', machineId: 'm1', machineName: '海天MA1600', timestamp: '2026-06-17 09:00', power: 19.2, energy: 167.2 },
  { id: 'e3', machineId: 'm1', machineName: '海天MA1600', timestamp: '2026-06-17 10:00', power: 18.8, energy: 186.0 },
  { id: 'e4', machineId: 'm1', machineName: '海天MA1600', timestamp: '2026-06-17 11:00', power: 19.5, energy: 205.5 },
  { id: 'e5', machineId: 'm3', machineName: '震雄JM228', timestamp: '2026-06-17 06:00', power: 22.0, energy: 132.0 },
  { id: 'e6', machineId: 'm3', machineName: '震雄JM228', timestamp: '2026-06-17 08:00', power: 23.1, energy: 178.2 },
  { id: 'e7', machineId: 'm3', machineName: '震雄JM228', timestamp: '2026-06-17 10:00', power: 22.5, energy: 223.2 },
  { id: 'e8', machineId: 'm5', machineName: '海天MA3800', timestamp: '2026-06-17 08:00', power: 42.0, energy: 168.0 },
  { id: 'e9', machineId: 'm5', machineName: '海天MA3800', timestamp: '2026-06-17 10:00', power: 43.5, energy: 255.0 },
  { id: 'e10', machineId: 'm4', machineName: '伊之密UN400', timestamp: '2026-06-17 08:00', power: 38.0, energy: 114.0 },
  { id: 'e11', machineId: 'm4', machineName: '伊之密UN400', timestamp: '2026-06-17 11:00', power: 0, energy: 228.0 },
];

export const mockDailyEnergy: DailyEnergySummary[] = [
  { date: '06-11', totalEnergy: 4850, peakPower: 185, cost: 3880 },
  { date: '06-12', totalEnergy: 5120, peakPower: 192, cost: 4096 },
  { date: '06-13', totalEnergy: 4680, peakPower: 178, cost: 3744 },
  { date: '06-14', totalEnergy: 5340, peakPower: 198, cost: 4272 },
  { date: '06-15', totalEnergy: 5580, peakPower: 205, cost: 4464 },
  { date: '06-16', totalEnergy: 5210, peakPower: 195, cost: 4168 },
  { date: '06-17', totalEnergy: 2890, peakPower: 188, cost: 2312 },
];

export const mockDashboardStats: DashboardStats = {
  todayOutput: 25160,
  runningRate: 62.5,
  passRate: 96.8,
  todayEnergy: 2890,
  pendingOrders: 10,
  runningMachines: 5,
};

export const hourlyOutputData = [
  { time: '06:00', output: 2100 },
  { time: '07:00', output: 3400 },
  { time: '08:00', output: 4200 },
  { time: '09:00', output: 4100 },
  { time: '10:00', output: 4500 },
  { time: '11:00', output: 3800 },
  { time: '12:00', output: 1200 },
  { time: '13:00', output: 1860 },
];

export const defectDistribution = [
  { name: '缩水', value: 32 },
  { name: '飞边', value: 28 },
  { name: '气泡', value: 18 },
  { name: '变色', value: 8 },
  { name: '变形', value: 14 },
];
