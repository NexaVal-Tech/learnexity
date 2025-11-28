import React from 'react';
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  trend: 'up' | 'down';
  percentage: string;
  trendLabel: string;
  description: string;
}

const StatsCard = ({ title, value, trend, percentage, trendLabel, description }: StatsCardProps) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-gray-500 text-sm font-medium leading-tight max-w-[70%]">{title}</h3>
          <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-md ${
            trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
          }`}>
            {trend === 'up' ? <ArrowUpRight size={12} className="mr-1" /> : <ArrowDownRight size={12} className="mr-1" />}
            {percentage}
          </span>
        </div>
        
        <div className="mb-4">
          <h2 className="text-3xl font-bold text-gray-900">{value}</h2>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-center text-sm font-bold text-gray-900">
          {trendLabel}
          {trend === 'up' ? <TrendingUp size={16} className="ml-1 text-gray-900" /> : <TrendingDown size={16} className="ml-1 text-gray-900" />}
        </div>
        <p className="text-xs text-gray-400">{description}</p>
      </div>
    </div>
  );
};

export default StatsCard;
