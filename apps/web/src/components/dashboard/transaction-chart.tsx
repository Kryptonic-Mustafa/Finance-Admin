'use client';

import { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { X, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface ChartProps {
  incomes: any[];
  expenses: any[];
  sym: string;
}

export function TransactionChart({ incomes, expenses, sym }: ChartProps) {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  // Safely parse dates to avoid the 1970 bug
  const safeParseDate = (dateStr: string | Date) => {
    try {
      const d = new Date(dateStr);
      // Check if it's a valid date, not NaN
      if (isNaN(d.getTime())) return new Date(); 
      return d;
    } catch {
      return new Date();
    }
  };

  const chartData = useMemo(() => {
    const dataMap = new Map<string, { name: string, dateObj: Date, Income: number, Expense: number, rawIncomes: any[], rawExpenses: any[] }>();

    incomes.forEach(inc => {
      const d = safeParseDate(inc.transaction_date);
      const key = d.toLocaleDateString('default', { month: 'short', year: 'numeric' });
      if (!dataMap.has(key)) dataMap.set(key, { name: key, dateObj: d, Income: 0, Expense: 0, rawIncomes: [], rawExpenses: [] });
      const monthData = dataMap.get(key)!;
      monthData.Income += inc.amount;
      monthData.rawIncomes.push(inc);
    });

    expenses.forEach(exp => {
      const d = safeParseDate(exp.transaction_date);
      const key = d.toLocaleDateString('default', { month: 'short', year: 'numeric' });
      if (!dataMap.has(key)) dataMap.set(key, { name: key, dateObj: d, Income: 0, Expense: 0, rawIncomes: [], rawExpenses: [] });
      const monthData = dataMap.get(key)!;
      monthData.Expense += exp.amount;
      monthData.rawExpenses.push(exp);
    });

    return Array.from(dataMap.values()).sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
  }, [incomes, expenses]);

  const handleBarClick = (data: any) => {
    if (data && data.activePayload && data.activePayload.length > 0) {
      setSelectedMonth(data.activePayload[0].payload.name);
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-border p-3 rounded-lg shadow-premium pointer-events-none">
          <p className="font-semibold text-foreground mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm font-medium">
              {entry.name}: {sym}{entry.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          ))}
          <p className="text-[10px] text-muted-foreground mt-2 italic">Click bar to view details</p>
        </div>
      );
    }
    return null;
  };

  const selectedData = selectedMonth ? chartData.find(d => d.name === selectedMonth) : null;

  return (
    <>
      <div className="bg-white border border-border rounded-xl shadow-sm p-6 h-[400px] flex flex-col relative">
        <h2 className="text-lg font-semibold mb-6">Income vs Expense (Monthly)</h2>
        
        {chartData.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            No data available for the selected view.
          </div>
        ) : (
          <div className="flex-1 w-full min-h-0 cursor-pointer">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} onClick={handleBarClick}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} tickFormatter={(value) => `${sym}${value >= 1000 ? (value/1000).toFixed(1) + 'k' : value}`} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F3F4F6' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }} />
                
                <Bar dataKey="Income" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={60} className="hover:opacity-80 transition-opacity" />
                <Bar dataKey="Expense" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={60} className="hover:opacity-80 transition-opacity" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {selectedData && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-white rounded-xl shadow-premium border border-border w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between p-5 border-b border-border bg-secondary/30 shrink-0">
              <div>
                <h3 className="text-xl font-bold text-foreground">Transaction Details: {selectedData.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">Breakdown of all records for this period.</p>
              </div>
              <button onClick={() => setSelectedMonth(null)} className="p-2 bg-white rounded-md text-muted-foreground hover:text-foreground border border-border shadow-sm"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <div>
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
                  <div className="flex items-center gap-2">
                    <ArrowUpRight className="w-5 h-5 text-emerald-600" />
                    <h4 className="font-semibold text-lg">Incomes</h4>
                  </div>
                  <span className="font-bold text-emerald-600">{sym}{selectedData.Income.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                
                <div className="space-y-3">
                  {selectedData.rawIncomes.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">No incomes recorded.</p>
                  ) : (
                    selectedData.rawIncomes.map((inc, idx) => (
                      <div key={`inc-${idx}`} className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg border border-border">
                        <div>
                          <p className="text-sm font-medium text-foreground">{inc.desc}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{safeParseDate(inc.transaction_date).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-emerald-600">+{sym}{inc.amount.toLocaleString()}</p>
                          <span className="text-[10px] bg-white border border-border px-1.5 py-0.5 rounded text-muted-foreground">{inc.category}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
                  <div className="flex items-center gap-2">
                    <ArrowDownRight className="w-5 h-5 text-red-600" />
                    <h4 className="font-semibold text-lg">Expenses</h4>
                  </div>
                  <span className="font-bold text-red-600">{sym}{selectedData.Expense.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                
                <div className="space-y-3">
                  {selectedData.rawExpenses.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">No expenses recorded.</p>
                  ) : (
                    selectedData.rawExpenses.map((exp, idx) => (
                      <div key={`exp-${idx}`} className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg border border-border">
                        <div>
                          <p className="text-sm font-medium text-foreground">{exp.desc}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{safeParseDate(exp.transaction_date).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-foreground">-{sym}{exp.amount.toLocaleString()}</p>
                          <span className="text-[10px] bg-white border border-border px-1.5 py-0.5 rounded text-muted-foreground">{exp.category}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
