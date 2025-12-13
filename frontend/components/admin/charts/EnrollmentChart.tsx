import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface EnrollmentData {
  month: string;
  enrollments: number;
}

interface EnrollmentChartProps {
  data: EnrollmentData[];
}

const EnrollmentChart: React.FC<EnrollmentChartProps> = ({ data }) => {
  // Calculate max value for Y axis
  const maxValue = Math.max(...data.map(d => d.enrollments), 0);
  const yAxisMax = Math.ceil(maxValue / 50) * 50 + 50;
  
  // Generate Y axis ticks
  const yAxisTicks = Array.from({ length: 5 }, (_, i) => Math.round((yAxisMax / 4) * i));

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Enrollment Trends</h3>
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9CA3AF', fontSize: 12 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9CA3AF', fontSize: 12 }} 
              ticks={yAxisTicks}
              domain={[0, yAxisMax]}
            />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '8px', 
                border: 'none', 
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                fontSize: '12px'
              }}
              formatter={(value: any) => [`${value} enrollments`, 'Enrollments']}
              labelStyle={{ fontWeight: 600, marginBottom: '4px' }}
            />
            <Line 
              type="monotone" 
              dataKey="enrollments" 
              stroke="#3B82F6" 
              strokeWidth={2} 
              dot={{ r: 4, fill: '#fff', strokeWidth: 2, stroke: '#3B82F6' }}
              activeDot={{ r: 6, fill: '#3B82F6', stroke: '#fff' }} 
              name="Enrollments"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center text-xs text-gray-500">
          <span className="w-2 h-2 rounded-full bg-[#3B82F6] mr-2"></span>
          Monthly Enrollments
        </div>
      </div>
    </div>
  );
};

export default EnrollmentChart;