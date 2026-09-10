import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, ChevronRight } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  trend: 'up' | 'down';
  percentage: string;
  trendLabel: string;
  description: string;
  /** If set, the whole card becomes a link to this admin route. */
  href?: string;
}

const StatsCard = ({ title, value, trend, percentage, trendLabel, description, href }: StatsCardProps) => {
  const content = (
    <div className={`bg-white dark:bg-[#0f0f14] p-6 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm transition-shadow h-full flex flex-col justify-between ${href ? 'hover:shadow-md hover:border-gray-200 dark:hover:border-white/20 cursor-pointer group' : 'hover:shadow-md'}`}>
      <div>
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-tight max-w-[70%] flex items-center gap-1">
            {title}
            {href && <ChevronRight size={14} className="text-gray-300 dark:text-gray-600 group-hover:translate-x-0.5 group-hover:text-gray-500 dark:group-hover:text-gray-400 transition-transform" />}
          </h3>
          <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-md ${
            trend === 'up' ? 'bg-green-50 dark:bg-green-500/15 text-green-600 dark:text-green-400' : 'bg-red-50 dark:bg-red-500/15 text-red-600 dark:text-red-400'
          }`}>
            {trend === 'up' ? <ArrowUpRight size={12} className="mr-1" /> : <ArrowDownRight size={12} className="mr-1" />}
            {percentage}
          </span>
        </div>

        <div className="mb-4">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{value}</h2>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-center text-sm font-bold text-gray-900 dark:text-white">
          {trendLabel}
          {trend === 'up' ? <TrendingUp size={16} className="ml-1 text-gray-900 dark:text-white" /> : <TrendingDown size={16} className="ml-1 text-gray-900 dark:text-white" />}
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500">{description}</p>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href} className="block h-full">{content}</Link>;
  }

  return content;
};

export default StatsCard;
