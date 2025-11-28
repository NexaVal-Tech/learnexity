import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', courses: 10, students: 60 },
  { name: 'Feb', courses: 15, students: 85 },
  { name: 'Mar', courses: 20, students: 120 },
  { name: 'Apr', courses: 22, students: 155 },
  { name: 'May', courses: 25, students: 175 },
  { name: 'Jun', courses: 28, students: 210 },
];

const EnrollmentChart = () => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Enrollment Trends</h3>
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9CA3AF', fontSize: 12 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9CA3AF', fontSize: 12 }} 
              ticks={[0, 55, 110, 165, 220]}
              domain={[0, 220]}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Line 
              type="monotone" 
              dataKey="students" 
              stroke="#3B82F6" 
              strokeWidth={2} 
              dot={{ r: 4, fill: '#fff', strokeWidth: 2, stroke: '#3B82F6' }}
              activeDot={{ r: 6, fill: '#3B82F6', stroke: '#fff' }} 
            />
            <Line 
              type="monotone" 
              dataKey="courses" 
              stroke="#A78BFA" 
              strokeWidth={2} 
              dot={{ r: 4, fill: '#fff', strokeWidth: 2, stroke: '#A78BFA' }} 
              activeDot={{ r: 6, fill: '#A78BFA', stroke: '#fff' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center text-xs text-gray-500">
          <span className="w-2 h-2 rounded-full bg-[#A78BFA] mr-2"></span>
          Courses
        </div>
        <div className="flex items-center text-xs text-gray-500">
          <span className="w-2 h-2 rounded-full bg-[#3B82F6] mr-2"></span>
          Students
        </div>
      </div>
    </div>
  );
};

export default EnrollmentChart;
