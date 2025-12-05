export interface SimulationParams {
  revenueGrowth: number; // % Рост выручки от базы 2026
  robotizationLevel: number; // % Уровень роботизации (AMR)
  warehouseUtilization: number; // % Утилизация склада
  vasShare: number; // % Доля VAS услуг
}

export interface PLData {
  revenue: number;
  
  // COGS (Себестоимость)
  cogsPersonnel: number; // Зарплата операционного персонала
  cogsRent: number;      // Аренда складов
  cogsUtilities: number; // Коммунальные услуги
  cogsMaterials: number; // Упаковочные материалы
  cogsFuel: number;      // Топливо и ГСМ

  // SG&A (Коммерческие и административные)
  sgaManagement: number; // Зарплата менеджмента
  sgaIt: number;         // IT и WMS
  sgaMarketing: number;  // Маркетинг и продажи
  sgaOther: number;      // Прочие расходы

  // Below EBITDA
  depreciation: number;  // Амортизация
  interest: number;      // Проценты по кредитам
  taxRate: number;       // Ставка налога (%)
}

export interface FinancialMetrics extends PLData {
  totalCogs: number;
  grossProfit: number;
  totalSga: number;
  totalOpex: number;
  ebitda: number;
  ebitdaMargin: number;
  ebit: number;
  preTaxProfit: number;
  taxAmount: number;
  netIncome: number;
  
  capexRequirement: number; // Оценка CAPEX
  valuation: number; // Оценка стоимости компании
}

export interface GeminiAnalysisResponse {
  analysis: string;
  recommendations: string[];
  riskAssessment: string;
}