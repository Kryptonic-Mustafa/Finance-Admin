'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";

const data = [
  { name: "Jan", Housing: 1200, Food: 800, Software: 400, Travel: 200 },
  { name: "Feb", Housing: 1200, Food: 950, Software: 450, Travel: 100 },
  { name: "Mar", Housing: 1200, Food: 700, Software: 400, Travel: 800 },
  { name: "Apr", Housing: 1250, Food: 850, Software: 450, Travel: 0 },
  { name: "May", Housing: 1250, Food: 900, Software: 500, Travel: 350 },
  { name: "Jun", Housing: 1250, Food: 800, Software: 500, Travel: 150 },
];

export function ExpenseChart() {
  return (
    <div className="bg-white p-6 rounded-xl border border-border shadow-sm flex flex-col h-[400px]">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Expense Breakdown</h3>
          <p className="text-sm text-muted-foreground">Monthly spending across top categories</p>
        </div>
        
        {/* Local Chart Filter Dropdown */}
        <select className="px-3 py-1.5 bg-secondary/50 border border-border rounded-md text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer hover:bg-secondary transition-colors">
          <option value="today">Today</option>
          <option value="1m">Last 1 Month</option>
          <option value="3m">Last 3 Months</option>
          <option value="6m">Last 6 Months</option>
          <option value="9m">Last 9 Months</option>
          <option value="1y" defaultValue="1y">Last 1 Year</option>
        </select>
      </div>
      
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          {/* Increased left margin to 10 to prevent label cutoff */}
          <BarChart data={data} margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis 
              dataKey="name" 
              stroke="#888888" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              dy={10}
            />
            {/* Explicitly set width to 55 to give labels room to breathe */}
            <YAxis 
              stroke="#888888" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              width={55}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip 
              cursor={{ fill: '#F4F4F5' }}
              contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }}
              iconType="circle"
            />
            
            <Bar dataKey="Housing" fill="#18181B" radius={[4, 4, 0, 0]} maxBarSize={30} />
            <Bar dataKey="Food" fill="#6366F1" radius={[4, 4, 0, 0]} maxBarSize={30} />
            <Bar dataKey="Software" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={30} />
            <Bar dataKey="Travel" fill="#F59E0B" radius={[4, 4, 0, 0]} maxBarSize={30} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
