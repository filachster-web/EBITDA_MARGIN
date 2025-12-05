import React, { useState, useMemo } from 'react';
import { Activity, TrendingUp, BarChart3, Settings, Table2, FileText, Printer } from 'lucide-react';
import InputSlider from './components/InputSlider';
import ResultsDashboard from './components/ResultsDashboard';
import AiAdvisor from './components/AiAdvisor';
import { calculateMetrics } from './utils/calculations';
import { SimulationParams, PLData } from './types';
import { BASELINE_PL_2026 } from './constants';
import ReactMarkdown from 'react-markdown';

const App: React.FC = () => {
  // Tabs State
  const [activeTab, setActiveTab] = useState<'strategy' | 'reports'>('strategy');

  // Lifted AI Analysis State
  const [globalAnalysis, setGlobalAnalysis] = useState<string | null>(null);

  // Симуляционные параметры
  const [params, setParams] = useState<SimulationParams>({
    revenueGrowth: 0,
    robotizationLevel: 5,
    warehouseUtilization: 82,
    vasShare: 5
  });

  // Базовые данные P&L 2026 (редактируемые)
  const [baseData, setBaseData] = useState<PLData>({
    revenue: BASELINE_PL_2026.REVENUE,
    cogsPersonnel: BASELINE_PL_2026.COGS.PERSONNEL,
    cogsRent: BASELINE_PL_2026.COGS.RENT,
    cogsUtilities: BASELINE_PL_2026.COGS.UTILITIES,
    cogsMaterials: BASELINE_PL_2026.COGS.MATERIALS,
    cogsFuel: BASELINE_PL_2026.COGS.FUEL,
    sgaManagement: BASELINE_PL_2026.SGA.MANAGEMENT,
    sgaIt: BASELINE_PL_2026.SGA.IT,
    sgaMarketing: BASELINE_PL_2026.SGA.MARKETING,
    sgaOther: BASELINE_PL_2026.SGA.OTHER,
    depreciation: BASELINE_PL_2026.DEPRECIATION,
    interest: BASELINE_PL_2026.INTEREST,
    taxRate: BASELINE_PL_2026.TAX_RATE
  });

  const [showBaseSettings, setShowBaseSettings] = useState(false);

  // Use useMemo to calculate metrics. This ensures the 'metrics' object 
  // reference only changes when inputs actually change, preventing 
  // infinite loops in the AiAdvisor useEffect.
  const metrics = useMemo(() => {
    return calculateMetrics(params, baseData);
  }, [params, baseData]);

  const updateParam = (key: keyof SimulationParams, value: number) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const updateBaseData = (key: keyof PLData, value: string) => {
    const numValue = parseFloat(value) || 0;
    setBaseData(prev => ({ ...prev, [key]: numValue }));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded text-white">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">ФД Логистик</h1>
              <p className="text-xs text-slate-500 font-medium">Симулятор EBITDA • Стратегия 2029</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button 
              onClick={() => setActiveTab('strategy')}
              className={`flex items-center gap-1.5 cursor-pointer transition-colors px-3 py-2 rounded-md ${activeTab === 'strategy' ? 'bg-blue-50 text-blue-600' : 'hover:text-blue-600'}`}
            >
               <TrendingUp className="w-4 h-4" /> Стратегия
            </button>
            <button 
              onClick={() => setActiveTab('reports')}
              className={`flex items-center gap-1.5 cursor-pointer transition-colors px-3 py-2 rounded-md ${activeTab === 'reports' ? 'bg-blue-50 text-blue-600' : 'hover:text-blue-600'}`}
            >
               <BarChart3 className="w-4 h-4" /> Отчеты
            </button>
            <button 
              onClick={() => setShowBaseSettings(!showBaseSettings)}
              className={`flex items-center gap-1.5 hover:text-blue-600 cursor-pointer px-3 py-2 ${showBaseSettings ? 'text-blue-600' : ''}`}
            >
               <Settings className="w-4 h-4" /> Базовые параметры
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Strategy Tab Content */}
        {activeTab === 'strategy' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in">
            {/* Controls Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Scenario Levers */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-slate-400" />
                  Сценарные рычаги
                </h2>
                
                <InputSlider 
                  label="Рост выручки (от 2026)" 
                  value={params.revenueGrowth} 
                  min={0} max={400} unit="%"
                  onChange={(v) => updateParam('revenueGrowth', v)}
                  description="Для цели 2029 нужен рост ~280%."
                />

                <InputSlider 
                  label="Уровень роботизации (AMR)" 
                  value={params.robotizationLevel} 
                  min={0} max={100} unit="%"
                  onChange={(v) => updateParam('robotizationLevel', v)}
                  description="Нужно >85% для статуса Tech-лидера."
                />

                <InputSlider 
                  label="Утилизация склада" 
                  value={params.warehouseUtilization} 
                  min={50} max={100} unit="%"
                  onChange={(v) => updateParam('warehouseUtilization', v)}
                  description="Высокая утилизация размывает аренду."
                />

                <InputSlider 
                  label="Доля VAS услуг" 
                  value={params.vasShare} 
                  min={0} max={25} unit="%"
                  onChange={(v) => updateParam('vasShare', v)}
                  description="VAS имеют более высокую маржинальность."
                />

                <div className="mt-6 pt-6 border-t border-slate-100">
                   <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 text-sm mb-1">Эффект масштаба</h4>
                      <p className="text-xs text-blue-700 leading-relaxed">
                         Модель предполагает, что постоянные расходы (SG&A) растут на 60% от темпа роста выручки.
                      </p>
                   </div>
                </div>
              </div>

              {/* Editable Base P&L */}
              {showBaseSettings && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-top-4">
                  <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Table2 className="w-5 h-5 text-slate-400" />
                    База: План 2026 (млн ₽)
                  </h2>
                  
                  <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-2 items-center">
                      <label className="font-semibold">Выручка</label>
                      <input type="number" value={baseData.revenue} onChange={(e) => updateBaseData('revenue', e.target.value)} className="border p-1 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    
                    <div className="pt-2 pb-1 text-xs font-bold text-slate-500 uppercase">Себестоимость</div>
                    <div className="grid grid-cols-2 gap-2 items-center">
                      <label>Зарплата персонала</label>
                      <input type="number" value={baseData.cogsPersonnel} onChange={(e) => updateBaseData('cogsPersonnel', e.target.value)} className="border p-1 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-2 items-center">
                      <label>Аренда складов</label>
                      <input type="number" value={baseData.cogsRent} onChange={(e) => updateBaseData('cogsRent', e.target.value)} className="border p-1 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                     <div className="grid grid-cols-2 gap-2 items-center">
                      <label>Коммунальные</label>
                      <input type="number" value={baseData.cogsUtilities} onChange={(e) => updateBaseData('cogsUtilities', e.target.value)} className="border p-1 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                     <div className="grid grid-cols-2 gap-2 items-center">
                      <label>Упаковка</label>
                      <input type="number" value={baseData.cogsMaterials} onChange={(e) => updateBaseData('cogsMaterials', e.target.value)} className="border p-1 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                     <div className="grid grid-cols-2 gap-2 items-center">
                      <label>ГСМ</label>
                      <input type="number" value={baseData.cogsFuel} onChange={(e) => updateBaseData('cogsFuel', e.target.value)} className="border p-1 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>

                    <div className="pt-2 pb-1 text-xs font-bold text-slate-500 uppercase">SG&A</div>
                    <div className="grid grid-cols-2 gap-2 items-center">
                      <label>Менеджмент</label>
                      <input type="number" value={baseData.sgaManagement} onChange={(e) => updateBaseData('sgaManagement', e.target.value)} className="border p-1 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                     <div className="grid grid-cols-2 gap-2 items-center">
                      <label>IT и WMS</label>
                      <input type="number" value={baseData.sgaIt} onChange={(e) => updateBaseData('sgaIt', e.target.value)} className="border p-1 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-2 items-center">
                      <label>Маркетинг</label>
                      <input type="number" value={baseData.sgaMarketing} onChange={(e) => updateBaseData('sgaMarketing', e.target.value)} className="border p-1 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-2 items-center">
                      <label>Прочие</label>
                      <input type="number" value={baseData.sgaOther} onChange={(e) => updateBaseData('sgaOther', e.target.value)} className="border p-1 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>

                    <div className="pt-2 pb-1 text-xs font-bold text-slate-500 uppercase">Прочее</div>
                    <div className="grid grid-cols-2 gap-2 items-center">
                      <label>Амортизация</label>
                      <input type="number" value={baseData.depreciation} onChange={(e) => updateBaseData('depreciation', e.target.value)} className="border p-1 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                     <div className="grid grid-cols-2 gap-2 items-center">
                      <label>Проценты</label>
                      <input type="number" value={baseData.interest} onChange={(e) => updateBaseData('interest', e.target.value)} className="border p-1 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                  </div>
                </div>
              )}
              
              {!showBaseSettings && (
                 <div className="text-center">
                    <button 
                      onClick={() => setShowBaseSettings(true)}
                      className="text-sm text-slate-500 hover:text-blue-600 underline decoration-dotted"
                    >
                      Показать настройки P&L 2026
                    </button>
                 </div>
              )}
            </div>

            {/* Results Area */}
            <div className="lg:col-span-8">
              <ResultsDashboard metrics={metrics} params={params} />
              <AiAdvisor 
                metrics={metrics} 
                params={params} 
                onAnalysisUpdate={setGlobalAnalysis} 
              />
            </div>
          </div>
        )}

        {/* Reports Tab Content */}
        {activeTab === 'reports' && (
          <div className="max-w-4xl mx-auto animate-in fade-in">
             <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-start mb-8 border-b border-slate-100 pb-6">
                   <div>
                      <h2 className="text-2xl font-bold text-slate-900 mb-2">Отчет Виртуального CFO</h2>
                      <p className="text-slate-500 text-sm">ФД Логистик | Стратегический анализ сценария</p>
                   </div>
                   <button 
                      onClick={() => window.print()}
                      className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors"
                   >
                      <Printer className="w-5 h-5" />
                      <span className="text-sm font-medium">Печать</span>
                   </button>
                </div>

                {globalAnalysis ? (
                   <div className="prose prose-slate max-w-none">
                      <div className="flex items-center gap-2 mb-6 text-indigo-600 bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                          <FileText className="w-6 h-6" />
                          <span className="font-semibold">Результаты анализа AI</span>
                      </div>
                      <ReactMarkdown>{globalAnalysis}</ReactMarkdown>
                   </div>
                ) : (
                   <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                      <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <h3 className="text-lg font-medium text-slate-600 mb-2">Отчет не сформирован</h3>
                      <p className="max-w-md mx-auto">
                        Запустите симуляцию во вкладке "Стратегия", чтобы ИИ сформировал детальный отчет и рекомендации.
                      </p>
                      <button 
                        onClick={() => setActiveTab('strategy')}
                        className="mt-6 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Перейти к стратегии
                      </button>
                   </div>
                )}

                {/* Footer with basic metrics summary even if no analysis */}
                <div className="mt-12 pt-6 border-t border-slate-100 grid grid-cols-3 gap-4 text-center">
                    <div>
                        <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Выручка</div>
                        <div className="text-xl font-bold text-slate-900">{Math.round(metrics.revenue)} млн ₽</div>
                    </div>
                     <div>
                        <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">EBITDA</div>
                        <div className={`text-xl font-bold ${metrics.ebitdaMargin >= 25 ? 'text-green-600' : 'text-slate-900'}`}>
                           {Math.round(metrics.ebitda)} млн ₽
                        </div>
                    </div>
                     <div>
                        <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Margin</div>
                        <div className="text-xl font-bold text-slate-900">{metrics.ebitdaMargin.toFixed(1)}%</div>
                    </div>
                </div>
             </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default App;