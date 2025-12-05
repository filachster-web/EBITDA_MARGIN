import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FinancialMetrics, SimulationParams } from '../types';
import { analyzeScenario, generateAnalysisPrompt } from '../services/geminiService';
import { Sparkles, Loader2, AlertTriangle, RefreshCw, Zap, Terminal, Play, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Props {
  metrics: FinancialMetrics;
  params: SimulationParams;
  onAnalysisUpdate?: (analysis: string) => void;
}

const AiAdvisor: React.FC<Props> = ({ metrics, params, onAnalysisUpdate }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDebouncing, setIsDebouncing] = useState(false);
  const [autoMode, setAutoMode] = useState(true);
  
  // Terminal State
  const [showTerminal, setShowTerminal] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");

  // Use ref to track mount status
  const isFirstRun = useRef(true);

  // Sync custom prompt with metrics when metrics change
  useEffect(() => {
    if (!showTerminal) {
        setCustomPrompt(generateAnalysisPrompt(metrics, params));
    }
  }, [metrics, params, showTerminal]);

  // Main Analysis Function
  const runAnalysis = useCallback(async (promptOverride?: string) => {
    setIsDebouncing(false);
    setLoading(true);
    // If promptOverride is passed (from terminal), use it. Otherwise use automatic logic.
    const result = await analyzeScenario(params, metrics, promptOverride);
    setAnalysis(result);
    if (onAnalysisUpdate) {
      onAnalysisUpdate(result);
    }
    setLoading(false);
  }, [metrics, params, onAnalysisUpdate]);

  // Auto-Analysis Effect (Debounce)
  useEffect(() => {
    if (!autoMode) return;

    if (isFirstRun.current) {
      isFirstRun.current = false;
      runAnalysis(); 
      return;
    }

    setIsDebouncing(true);
    
    const timer = setTimeout(() => {
      runAnalysis();
    }, 2000);

    return () => {
      clearTimeout(timer);
    };
  }, [runAnalysis, autoMode]); 

  const handleCustomRun = () => {
    // When running custom, we might want to disable auto mode temporarily so it doesn't overwrite
    setAutoMode(false); 
    runAnalysis(customPrompt);
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100 mt-6 transition-all duration-300 relative overflow-hidden">
       {/* Background decorative elements */}
       <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
       
      <div className="flex justify-between items-center mb-4 flex-wrap gap-3 relative z-10">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg shadow-sm shadow-indigo-200">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-indigo-900">AI CFO Советник</h3>
              {autoMode && (
                <span className="flex h-2 w-2 relative">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${loading || isDebouncing ? 'bg-indigo-400' : 'bg-green-400'}`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${loading || isDebouncing ? 'bg-indigo-500' : 'bg-green-500'}`}></span>
                </span>
              )}
            </div>
            <p className="text-xs text-indigo-600 font-medium flex items-center gap-1">
               {loading ? 'Анализирую данные...' : isDebouncing ? 'Ожидание изменений...' : 'Анализ актуален'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Terminal Toggle */}
          <button
            onClick={() => setShowTerminal(!showTerminal)}
            className={`p-2 rounded-lg transition-colors border ${showTerminal ? 'bg-slate-800 text-white border-slate-700' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
            title="Открыть консоль промпта"
          >
            <Terminal className="w-4 h-4" />
          </button>

          {/* Toggle Auto Mode */}
          <button
            onClick={() => setAutoMode(!autoMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              autoMode 
                ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' 
                : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
            }`}
            title={autoMode ? "Авто-анализ включен" : "Авто-анализ выключен"}
          >
            <Zap className={`w-3.5 h-3.5 ${autoMode ? 'fill-indigo-700' : 'text-slate-400'}`} />
            {autoMode ? 'Auto ON' : 'Auto OFF'}
          </button>

          <button
            onClick={() => runAnalysis()}
            disabled={loading}
            className="bg-white hover:bg-indigo-50 text-indigo-600 border border-indigo-200 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            Обновить
          </button>
        </div>
      </div>

      {/* Terminal / Prompt Editor */}
      {showTerminal && (
        <div className="mb-4 bg-slate-900 rounded-lg overflow-hidden border border-slate-700 shadow-lg animate-in fade-in slide-in-from-top-2 relative z-20">
            <div className="flex justify-between items-center px-4 py-2 bg-slate-800 border-b border-slate-700">
                <span className="text-xs font-mono text-slate-300 flex items-center gap-2">
                    <Terminal className="w-3 h-3" />
                    prompt_console.txt
                </span>
                <span className="text-[10px] text-slate-500">Редактируемый режим</span>
            </div>
            <textarea 
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="w-full h-64 bg-slate-900 text-green-400 font-mono text-xs p-4 focus:outline-none resize-none"
                spellCheck={false}
            />
            <div className="px-4 py-2 bg-slate-800 border-t border-slate-700 flex justify-end">
                <button 
                    onClick={handleCustomRun}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                   {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3 fill-current" />}
                   Выполнить этот запрос
                </button>
            </div>
        </div>
      )}

      {/* Loading States */}
      {(loading || (isDebouncing && !analysis)) && (
        <div className="animate-pulse space-y-4 py-4 relative z-10">
          <div className="flex items-center gap-2">
             <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
             <span className="text-sm text-indigo-400 font-medium">
                {isDebouncing ? 'Изучаю новые вводные...' : 'Генерирую стратегию...'}
             </span>
          </div>
          <div className="space-y-2">
            <div className="h-2 bg-indigo-200/50 rounded w-3/4"></div>
            <div className="h-2 bg-indigo-200/50 rounded w-5/6"></div>
            <div className="h-2 bg-indigo-200/50 rounded w-2/3"></div>
          </div>
        </div>
      )}

      {/* Analysis Content Output Field */}
      {analysis && (
        <div className="mt-4 mb-2 animate-in fade-in slide-in-from-bottom-2 relative z-10">
            <label className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Результат анализа ИИ:
            </label>
            <div className={`prose prose-indigo prose-sm max-w-none bg-white p-5 rounded-lg border border-indigo-200 shadow-sm transition-opacity duration-500 ${isDebouncing || loading ? 'opacity-60 blur-[0.5px]' : 'opacity-100'}`}>
               <ReactMarkdown>{analysis}</ReactMarkdown>
            </div>
        </div>
      )}
      
      {/* Alert for Low Margin */}
      {metrics.ebitdaMargin < 18 && !loading && !isDebouncing && (
         <div className="mt-4 flex items-start gap-3 bg-red-50 p-3 rounded-md text-red-800 text-sm border border-red-100 animate-in fade-in relative z-10">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <div>
                <strong>Риск:</strong> EBITDA Margin ({metrics.ebitdaMargin.toFixed(1)}%) ниже нормы. 
                Банковские ковенанты под угрозой. Необходимо >18%.
            </div>
         </div>
      )}
    </div>
  );
};

export default AiAdvisor;