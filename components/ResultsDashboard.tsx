import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  ComposedChart, Line, Cell
} from 'recharts';
import { FinancialMetrics, SimulationParams } from '../types';
import { BASELINE_PL_2026, TARGET_2029 } from '../constants';

interface Props {
  metrics: FinancialMetrics;
  params: SimulationParams;
}

const ResultsDashboard: React.FC<Props> = ({ metrics, params }) => {
  
  const dataComparison = [
    {
      name: 'План 2026',
      Выручка: BASELINE_PL_2026.REVENUE,
      EBITDA: 94, // From constant manually for chart
      Margin: 17.1
    },
    {
      name: 'Симуляция',
      Выручка: Math.round(metrics.revenue),
      EBITDA: Math.round(metrics.ebitda),
      Margin: parseFloat(metrics.ebitdaMargin.toFixed(1))
    },
    {
      name: 'Цель 2029',
      Выручка: TARGET_2029.REVENUE,
      EBITDA: TARGET_2029.EBITDA,
      Margin: TARGET_2029.EBITDA_MARGIN
    }
  ];

  const waterfallData = [
    { name: 'Выручка', value: metrics.revenue, type: 'total' },
    { name: 'Персонал', value: -metrics.cogsPersonnel, type: 'expense' },
    { name: 'Аренда', value: -metrics.cogsRent, type: 'expense' },
    { name: 'Проч. Себест.', value: -(metrics.cogsMaterials + metrics.cogsFuel + metrics.cogsUtilities), type: 'expense' },
    { name: 'Валовая приб.', value: metrics.grossProfit, type: 'subtotal' },
    { name: 'SG&A', value: -metrics.totalSga, type: 'expense' },
    { name: 'EBITDA', value: metrics.ebitda, type: 'net' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500 font-medium">Прогноз Выручки</p>
          <p className="text-2xl font-bold text-slate-800">{Math.round(metrics.revenue)} млн ₽</p>
          <span className={`text-xs ${metrics.revenue >= TARGET_2029.REVENUE ? 'text-green-600' : 'text-slate-400'}`}>
            Цель: {TARGET_2029.REVENUE} млн
          </span>
        </div>
        <div className={`p-4 rounded-xl shadow-sm border ${metrics.ebitdaMargin >= 25 ? 'bg-green-50 border-green-200' : 'bg-white border-slate-100'}`}>
          <p className="text-sm text-slate-500 font-medium">EBITDA Margin</p>
          <p className={`text-2xl font-bold ${metrics.ebitdaMargin >= 25 ? 'text-green-700' : 'text-blue-600'}`}>
            {metrics.ebitdaMargin.toFixed(1)}%
          </p>
          <span className="text-xs text-slate-400">Цель: 25.0%</span>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500 font-medium">EBITDA (абс.)</p>
          <p className="text-2xl font-bold text-slate-800">{Math.round(metrics.ebitda)} млн ₽</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500 font-medium">Оценка бизнеса</p>
          <p className="text-2xl font-bold text-purple-600">{Math.round(metrics.valuation)} млн ₽</p>
          <span className="text-xs text-slate-400">Мульт: {params.robotizationLevel > 50 ? '10x (Tech)' : '6x (3PL)'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Comparison Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Траектория vs Цели</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={dataComparison} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" orientation="left" stroke="#64748b" axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" stroke="#64748b" axisLine={false} tickLine={false} unit="%" />
                <RechartsTooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="Выручка" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={40} />
                <Bar yAxisId="left" dataKey="EBITDA" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                <Line yAxisId="right" type="monotone" dataKey="Margin" stroke="#16a34a" strokeWidth={3} dot={{ r: 6 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cost Structure Waterfall */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Структура EBITDA (Bridge)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={waterfallData}>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} interval={0} fontSize={12} />
                <YAxis axisLine={false} tickLine={false} />
                <RechartsTooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="value">
                  {waterfallData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={
                        entry.type === 'total' ? '#94a3b8' : 
                        entry.type === 'expense' ? '#ef4444' : 
                        entry.type === 'subtotal' ? '#f59e0b' : '#22c55e'
                      } 
                      radius={[4, 4, 0, 0]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed P&L Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
           <h3 className="text-lg font-bold text-slate-800">Финансовый результат (Симуляция)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50">
              <tr>
                <th className="px-6 py-3">Статья</th>
                <th className="px-6 py-3 text-right">Сумма (млн ₽)</th>
                <th className="px-6 py-3 text-right">% от Выручки</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="font-bold bg-slate-50/50">
                <td className="px-6 py-3">Выручка</td>
                <td className="px-6 py-3 text-right">{metrics.revenue.toFixed(1)}</td>
                <td className="px-6 py-3 text-right">100%</td>
              </tr>
              <tr>
                <td className="px-6 py-3 pl-8 text-slate-600">Себестоимость (Всего)</td>
                <td className="px-6 py-3 text-right text-red-600">({metrics.totalCogs.toFixed(1)})</td>
                <td className="px-6 py-3 text-right text-slate-500">{((metrics.totalCogs/metrics.revenue)*100).toFixed(1)}%</td>
              </tr>
               <tr>
                <td className="px-6 py-2 pl-12 text-slate-500 text-xs">- Персонал</td>
                <td className="px-6 py-2 text-right text-xs text-slate-500">({metrics.cogsPersonnel.toFixed(1)})</td>
                <td className="px-6 py-2 text-right text-xs text-slate-500"></td>
              </tr>
              <tr className="font-semibold bg-blue-50/30">
                <td className="px-6 py-3">Валовая прибыль</td>
                <td className="px-6 py-3 text-right">{metrics.grossProfit.toFixed(1)}</td>
                <td className="px-6 py-3 text-right">{((metrics.grossProfit/metrics.revenue)*100).toFixed(1)}%</td>
              </tr>
              <tr>
                <td className="px-6 py-3 pl-8 text-slate-600">SG&A (Коммерческие и адм.)</td>
                <td className="px-6 py-3 text-right text-red-600">({metrics.totalSga.toFixed(1)})</td>
                <td className="px-6 py-3 text-right text-slate-500">{((metrics.totalSga/metrics.revenue)*100).toFixed(1)}%</td>
              </tr>
              <tr>
                <td className="px-6 py-2 pl-12 text-slate-500 text-xs">- Менеджмент</td>
                <td className="px-6 py-2 text-right text-xs text-slate-500">({metrics.sgaManagement.toFixed(1)})</td>
                <td className="px-6 py-2 text-right text-xs text-slate-500"></td>
              </tr>
              <tr>
                <td className="px-6 py-2 pl-12 text-slate-500 text-xs">- IT и WMS</td>
                <td className="px-6 py-2 text-right text-xs text-slate-500">({metrics.sgaIt.toFixed(1)})</td>
                <td className="px-6 py-2 text-right text-xs text-slate-500"></td>
              </tr>
               <tr>
                <td className="px-6 py-2 pl-12 text-slate-500 text-xs">- Маркетинг</td>
                <td className="px-6 py-2 text-right text-xs text-slate-500">({metrics.sgaMarketing.toFixed(1)})</td>
                <td className="px-6 py-2 text-right text-xs text-slate-500"></td>
              </tr>
               <tr>
                <td className="px-6 py-2 pl-12 text-slate-500 text-xs">- Прочие</td>
                <td className="px-6 py-2 text-right text-xs text-slate-500">({metrics.sgaOther.toFixed(1)})</td>
                <td className="px-6 py-2 text-right text-xs text-slate-500"></td>
              </tr>
              <tr className="font-bold bg-green-50/50 border-t-2 border-slate-200">
                <td className="px-6 py-3 text-lg text-green-800">EBITDA</td>
                <td className="px-6 py-3 text-right text-lg text-green-800">{metrics.ebitda.toFixed(1)}</td>
                <td className="px-6 py-3 text-right text-lg text-green-800">{metrics.ebitdaMargin.toFixed(1)}%</td>
              </tr>
               <tr>
                <td className="px-6 py-3 pl-8 text-slate-500">Амортизация и Проценты</td>
                <td className="px-6 py-3 text-right text-slate-500">({(metrics.depreciation + metrics.interest).toFixed(1)})</td>
                <td className="px-6 py-3 text-right text-slate-500"></td>
              </tr>
               <tr className="font-semibold">
                <td className="px-6 py-3">Чистая прибыль</td>
                <td className="px-6 py-3 text-right">{metrics.netIncome.toFixed(1)}</td>
                <td className="px-6 py-3 text-right">{((metrics.netIncome/metrics.revenue)*100).toFixed(1)}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ResultsDashboard;