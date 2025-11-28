import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Web Development', completion: 75, enrolled: 155 },
  { name: 'Data Science', completion: 60, enrolled: 210 },
  { name: 'Digital Marketing', completion: 80, enrolled: 85 },
  { name: 'Machine Learning', completion: 65, enrolled: 130 },
  { name: 'UI/UX Design', completion: 85, enrolled: 60 },
];

const PerformanceChart = () => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Course Performance</h3>
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={8}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9CA3AF', fontSize: 10 }} 
              dy={10}
              interval={0}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9CA3AF', fontSize: 12 }} 
              ticks={[0, 55, 110, 165, 220]}
              domain={[0, 220]}
            />
            <Tooltip 
              cursor={{ fill: 'transparent' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Bar dataKey="completion" fill="#10B981" radius={[4, 4, 0, 0]} barSize={20} name="Completion %" />
            <Bar dataKey="enrolled" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={20} name="Enrolled" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center text-sm font-medium text-[#10B981]">
          <span className="w-3 h-3 rounded-sm bg-[#10B981] mr-2"></span>
          Completion %
        </div>
        <div className="flex items-center text-sm font-medium text-[#3B82F6]">
          <span className="w-3 h-3 rounded-sm bg-[#3B82F6] mr-2"></span>
          Enrolled
        </div>
      </div>
    </div>
  );
};

export default PerformanceChart;
