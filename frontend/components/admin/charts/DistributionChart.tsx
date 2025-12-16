import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface DistributionData {
  name: string;
  value: number;
  color: string;

  // ✅ REQUIRED by Recharts
  [key: string]: string | number;
}

interface DistributionChartProps {
  data: DistributionData[];
}

const DistributionChart: React.FC<DistributionChartProps> = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full">
      <h3 className="text-lg font-bold text-gray-900 mb-6">
        Payment Status Distribution
      </h3>

      <div className="h-[250px] w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={80}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              label={({
                cx,
                cy,
                midAngle,
                outerRadius,
                value,
                name,
                color,
              }) => {
                const RADIAN = Math.PI / 180;
                const radius = outerRadius + 25;
                const angle = midAngle ?? 0;
                const x = cx + radius * Math.cos(-angle * RADIAN);
                const y = cy + radius * Math.sin(-angle * RADIAN);
                const percent =
                  total > 0 ? Math.round((Number(value) / total) * 100) : 0;

                return (
                  <text
                    x={x}
                    y={y}
                    fill={String(color)}
                    textAnchor={x > cx ? 'start' : 'end'}
                    dominantBaseline="middle"
                    className="text-xs font-medium"
                  >
                    {`${name}: ${value}`}
                  </text>
                );
              }}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  strokeWidth={0}
                />
              ))}
            </Pie>

            <Tooltip
              formatter={(value: number, name: string) => [value, name]}
              contentStyle={{
                borderRadius: '8px',
                border: 'none',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                fontSize: '12px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-gray-600">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DistributionChart;
