import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ParsedLead } from '../types';

interface StatsChartProps {
  leads: ParsedLead[];
}

const StatsChart: React.FC<StatsChartProps> = ({ leads }) => {
  // Group by score ranges
  const data = [
    { name: 'Hot Leads (>80%)', count: leads.filter(l => l.potentialScore >= 80).length, color: '#34d399' },
    { name: 'Warm Leads (50-79%)', count: leads.filter(l => l.potentialScore >= 50 && l.potentialScore < 80).length, color: '#fbbf24' },
    { name: 'Cold Leads (<50%)', count: leads.filter(l => l.potentialScore < 50).length, color: '#94a3b8' },
  ];

  if (leads.length === 0) return null;

  return (
    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 shadow-lg backdrop-blur-sm h-full">
      <h3 className="text-sm font-semibold text-slate-400 uppercase mb-6 tracking-wider">Qualité des Leads</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis 
              dataKey="name" 
              stroke="#64748b" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
            />
            <YAxis 
              stroke="#64748b" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              allowDecimals={false}
            />
            <Tooltip 
              cursor={{ fill: '#1e293b' }}
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StatsChart;
