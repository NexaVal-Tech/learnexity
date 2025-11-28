import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const data = [
  { name: 'Technology', value: 38, color: '#3B82F6' },
  { name: 'Design', value: 14, color: '#F59E0B' },
  { name: 'Business', value: 17, color: '#10B981' },
  { name: 'Data Science', value: 31, color: '#8884d8' },
];

const DistributionChart = () => {
  return (
    <div className="bg-white p-1 rounded-2xl border border-gray-100 shadow-sm h-full">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Certificate Distribution</h3>
      <div className="h-[350px] w-full relative">
        <ResponsiveContainer width="100%" height="100%" className="w-full h-full mx-auto ">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={50}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, value, color }) => {
                const RADIAN = Math.PI / 180;
                const radius = outerRadius + 20;
                const angle = midAngle ?? 0;
                const x = cx + radius * Math.cos(-angle * RADIAN);
                const y = cy + radius * Math.sin(-angle * RADIAN);
                
                return (
                  <text 
                    x={x} 
                    y={y} 
                    fill={color} 
                    textAnchor={x > cx ? 'start' : 'end'} 
                    dominantBaseline="middle"
                    className="text-xs font-medium"
                  >
                    {`${name} ${value}%`}
                  </text>
                );
              }}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DistributionChart;
