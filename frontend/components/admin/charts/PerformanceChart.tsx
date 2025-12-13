import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PerformanceData {
  course: string;
  students: number;
}

interface PerformanceChartProps {
  data: PerformanceData[];
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ data }) => {
  // Calculate max value for Y axis
  const maxValue = Math.max(...data.map(d => d.students), 0);
  const yAxisMax = Math.ceil(maxValue / 50) * 50 + 50;
  
  // Generate Y axis ticks
  const yAxisTicks = Array.from({ length: 5 }, (_, i) => Math.round((yAxisMax / 4) * i));

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Course Performance</h3>
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={8} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis 
              dataKey="course" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9CA3AF', fontSize: 10 }} 
              dy={10}
              interval={0}
              angle={-15}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9CA3AF', fontSize: 12 }} 
              ticks={yAxisTicks}
              domain={[0, yAxisMax]}
            />
            <Tooltip 
              cursor={{ fill: 'transparent' }}
              contentStyle={{ 
                borderRadius: '8px', 
                border: 'none', 
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                fontSize: '12px'
              }}
              formatter={(value: any) => [`${value} students`, 'Enrolled Students']}
              labelStyle={{ fontWeight: 600, marginBottom: '4px' }}
            />
            <Bar 
              dataKey="students" 
              fill="#3B82F6" 
              radius={[4, 4, 0, 0]} 
              barSize={40} 
              name="Students"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center text-sm font-medium text-[#3B82F6]">
          <span className="w-3 h-3 rounded-sm bg-[#3B82F6] mr-2"></span>
          Enrolled Students
        </div>
      </div>
    </div>
  );
};

export default PerformanceChart;