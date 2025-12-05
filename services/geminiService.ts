import { GoogleGenAI } from "@google/genai";
import { FinancialMetrics, SimulationParams } from "../types";

// Контекст FD Logistics для AI
const FD_CONTEXT = `
Вы — виртуальный CFO компании "ФД Логистик" (3PL, опасные грузы).
Цель: EBITDA margin 25% к 2029 году.
Правила:
- Норма Margin >18%.
- Debt/EBITDA < 3.0x.
- Роботы снижают ФОТ, но растят CAPEX.
- SG&A должны отставать от роста выручки (эффект масштаба).
`;

/**
 * Generates the detailed prompt string based on current metrics.
 * Exposed so the UI can display/edit it.
 */
export const generateAnalysisPrompt = (
  metrics: FinancialMetrics,
  params: SimulationParams
): string => {
  return `
    ${FD_CONTEXT}

    ТЕКУЩИЙ СЦЕНАРИЙ (ПЛАН/ФАКТ):
    --------------------------------------------------
    1. КЛЮЧЕВЫЕ ПОКАЗАТЕЛИ:
    - Выручка: ${metrics.revenue.toFixed(1)} млн ₽ (Рост ${params.revenueGrowth}%)
    - EBITDA: ${metrics.ebitda.toFixed(1)} млн ₽
    - EBITDA Margin: ${metrics.ebitdaMargin.toFixed(1)}%
    - Чистая прибыль: ${metrics.netIncome.toFixed(1)} млн ₽
    - Оценка бизнеса: ${metrics.valuation.toFixed(0)} млн ₽
    
    2. ДРАЙВЕРЫ:
    - Утилизация склада: ${params.warehouseUtilization}%
    - Уровень роботизации: ${params.robotizationLevel}%
    - Доля VAS: ${params.vasShare}%

    3. СТРУКТУРА ЗАТРАТ (P&L):
    - Себестоимость (COGS): ${metrics.totalCogs.toFixed(1)} млн
      * ФОТ персонала: ${metrics.cogsPersonnel.toFixed(1)} млн
      * Аренда: ${metrics.cogsRent.toFixed(1)} млн
      * Прочее (ГСМ, мат., ком.): ${(metrics.cogsMaterials + metrics.cogsFuel + metrics.cogsUtilities).toFixed(1)} млн
    
    - SG&A (Административные): ${metrics.totalSga.toFixed(1)} млн
      * Менеджмент: ${metrics.sgaManagement.toFixed(1)} млн
      * IT и WMS: ${metrics.sgaIt.toFixed(1)} млн
      * Маркетинг: ${metrics.sgaMarketing.toFixed(1)} млн
      * Прочие: ${metrics.sgaOther.toFixed(1)} млн

    4. ФИНАНСОВЫЕ РАСХОДЫ:
    - Амортизация: ${metrics.depreciation.toFixed(1)} млн
    - Проценты по долгу: ${metrics.interest.toFixed(1)} млн
    - Налоги: ${metrics.taxAmount.toFixed(1)} млн
    --------------------------------------------------

    ЗАДАЧА:
    Дай экспресс-анализ (Markdown, до 150 слов):
    1. **Статус**: Одной строкой (Успех/Риск/Катастрофа).
    2. **Драйверы**: Что тянет вниз или вверх? (ФОТ vs Роботы, Аренда vs Утилизация).
    3. **Совет**: Одно главное действие прямо сейчас.
    
    Будь жестким и конкретным, как реальный CFO.
  `;
};

export const analyzeScenario = async (
  params: SimulationParams,
  metrics: FinancialMetrics,
  customPrompt?: string
): Promise<string> => {
  try {
    // Check for API key safely
    const apiKey = typeof process !== 'undefined' ? process.env.API_KEY : undefined;
    
    if (!apiKey) {
      return "⚠️ API Key отсутствует. Настройте переменную окружения.";
    }

    const ai = new GoogleGenAI({ apiKey });

    // Use custom prompt if provided, otherwise generate one
    const prompt = customPrompt || generateAnalysisPrompt(metrics, params);

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.5, // Lower temperature for more analytical results
        maxOutputTokens: 500,
      }
    });

    return response.text || "Анализ недоступен.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "AI временно недоступен. Проверьте консоль.";
  }
};