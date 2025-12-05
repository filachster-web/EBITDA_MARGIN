import { DRIVERS } from '../constants';
import { SimulationParams, FinancialMetrics, PLData } from '../types';

export const calculateMetrics = (params: SimulationParams, baseData: PLData): FinancialMetrics => {
  const growthFactor = 1 + (params.revenueGrowth / 100);
  
  // 1. Выручка (Revenue)
  const projectedRevenue = baseData.revenue * growthFactor;

  // 2. Себестоимость (COGS)
  
  // Зарплата персонала (Самый сильный рычаг)
  // Рост пропорционально выручке, НО снижается за счет роботизации и масштаба
  const robotizationSavings = (params.robotizationLevel / 100) * DRIVERS.ROBOTIZATION_EFFICIENCY_FACTOR;
  // Эффект масштаба (обучение персонала)
  const learningCurve = Math.min(0.1, (params.revenueGrowth / 100) * 0.05);
  
  const personnelFactor = growthFactor * (1 - robotizationSavings) * (1 - learningCurve);
  const projectedPersonnel = baseData.cogsPersonnel * personnelFactor;

  // Аренда (Ступенчатый рост)
  // Если утилизация > 95%, берем новые площади. В базе считаем, что утилизация 82%.
  // Логика: Рост объема = Рост выручки.
  const volumeIndex = growthFactor; 
  // Корректировка на утилизацию: если пользователь ставит высокую утилизацию, значит мы эффективнее используем место
  const utilizationEfficiency = 82 / params.warehouseUtilization; 
  
  const spaceNeeded = volumeIndex * utilizationEfficiency;
  // Аренда растет чуть медленнее объема (оптовые скидки на площади)
  const projectedRent = baseData.cogsRent * spaceNeeded;

  // Переменные расходы (Материалы, ГСМ, Коммуналка) - Линейно от объема
  const projectedMaterials = baseData.cogsMaterials * growthFactor;
  const projectedFuel = baseData.cogsFuel * growthFactor;
  const projectedUtilities = baseData.cogsUtilities * growthFactor; // Полупеременные

  const totalCogs = projectedPersonnel + projectedRent + projectedMaterials + projectedFuel + projectedUtilities;
  const grossProfit = projectedRevenue - totalCogs;

  // 3. SG&A (Коммерческие и административные)
  // Растут медленнее выручки (Scale Effect)
  const sgaScaleFactor = 1 + ((params.revenueGrowth / 100) * DRIVERS.SCALE_EFFICIENCY_FACTOR);

  const projectedManagement = baseData.sgaManagement * sgaScaleFactor;
  const projectedIt = baseData.sgaIt * sgaScaleFactor;
  const projectedMarketing = baseData.sgaMarketing * growthFactor; // Маркетинг часто растет линейно для поддержания роста
  const projectedOther = baseData.sgaOther * sgaScaleFactor;

  const totalSga = projectedManagement + projectedIt + projectedMarketing + projectedOther;

  // 4. EBITDA
  const totalOpex = totalCogs + totalSga;
  const ebitda = projectedRevenue - totalOpex;
  const ebitdaMargin = (ebitda / projectedRevenue) * 100;

  // 5. Ниже EBITDA
  // Амортизация растет с роботами
  const robotCapexAccumulated = (params.robotizationLevel > 5) 
    ? (params.robotizationLevel - 5) * 1.5 // Примерно 1.5 млн за % роботизации
    : 0;
  // Добавляем амортизацию новых роботов (на 5 лет)
  const additionalDepreciation = robotCapexAccumulated / 5;
  const projectedDepreciation = baseData.depreciation + additionalDepreciation;

  const ebit = ebitda - projectedDepreciation;

  // Проценты (могут расти, если берем долг на роботов)
  // Предположим, половина CAPEX берется в кредит под 16%
  const additionalInterest = (robotCapexAccumulated * 0.5) * 0.16;
  const projectedInterest = baseData.interest + additionalInterest;

  const preTaxProfit = ebit - projectedInterest;
  const taxAmount = preTaxProfit > 0 ? preTaxProfit * (baseData.taxRate / 100) : 0;
  const netIncome = preTaxProfit - taxAmount;

  // Оценка стоимости
  // Мультипликатор зависит от технологичности (уровня роботизации)
  const multiplier = params.robotizationLevel > 50 ? 10 : (params.robotizationLevel > 20 ? 8 : 6);
  const valuation = ebitda * multiplier;

  return {
    revenue: projectedRevenue,
    cogsPersonnel: projectedPersonnel,
    cogsRent: projectedRent,
    cogsUtilities: projectedUtilities,
    cogsMaterials: projectedMaterials,
    cogsFuel: projectedFuel,
    totalCogs,
    grossProfit,
    
    sgaManagement: projectedManagement,
    sgaIt: projectedIt,
    sgaMarketing: projectedMarketing,
    sgaOther: projectedOther,
    totalSga,
    totalOpex,
    
    ebitda,
    ebitdaMargin,
    
    depreciation: projectedDepreciation,
    ebit,
    interest: projectedInterest,
    preTaxProfit,
    taxRate: baseData.taxRate,
    taxAmount,
    netIncome,

    capexRequirement: robotCapexAccumulated,
    valuation
  };
};