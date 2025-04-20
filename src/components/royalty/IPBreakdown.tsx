'use client';

import type React from 'react';
import { motion } from 'framer-motion';

interface IPBreakdownProps {
  dateRange: string;
}

export const IPBreakdown: React.FC<IPBreakdownProps> = ({ dateRange }) => {
  // Mock data based on date range
  const breakdowns = [
    {
      id: '1',
      title: 'Digital Artwork Collection',
      category: 'Art',
      earnings:
        dateRange === 'week' ? 0.08 : dateRange === 'month' ? 0.32 : 1.85,
      licenses: dateRange === 'week' ? 2 : dateRange === 'month' ? 8 : 46,
    },
    {
      id: '2',
      title: 'Music Production Sample Pack',
      category: 'Audio',
      earnings:
        dateRange === 'week' ? 0.06 : dateRange === 'month' ? 0.24 : 1.44,
      licenses: dateRange === 'week' ? 3 : dateRange === 'month' ? 12 : 72,
    },
    {
      id: '3',
      title: 'Research Paper: Blockchain Economics',
      category: 'Research',
      earnings:
        dateRange === 'week' ? 0.04 : dateRange === 'month' ? 0.16 : 0.96,
      licenses: dateRange === 'week' ? 1 : dateRange === 'month' ? 4 : 24,
    },
    {
      id: '4',
      title: 'Photography Collection: Urban Landscapes',
      category: 'Photography',
      earnings:
        dateRange === 'week' ? 0.02 : dateRange === 'month' ? 0.08 : 0.48,
      licenses: dateRange === 'week' ? 1 : dateRange === 'month' ? 4 : 24,
    },
  ];

  const totalEarnings = breakdowns.reduce(
    (sum, item) => sum + item.earnings,
    0
  );

  return (
    <div className="space-y-4">
      {breakdowns.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.3,
            delay: index * 0.1,
          }}
        >
          <div className="flex justify-between items-center mb-1">
            <div className="flex-1 truncate">
              <div className="font-medium truncate">{item.title}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {item.category} • {item.licenses} licenses
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium">{item.earnings} ETH</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {Math.round((item.earnings / totalEarnings) * 100)}% of total
              </div>
            </div>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 dark:bg-blue-500 rounded-full"
              style={{
                width: `${(item.earnings / totalEarnings) * 100}%`,
              }}
            />
          </div>
        </motion.div>
      ))}
      <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-700">
        <motion.button
          whileHover={{
            scale: 1.02,
          }}
          whileTap={{
            scale: 0.98,
          }}
          className="w-full py-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-sm font-medium transition-colors"
        >
          View All IPs
        </motion.button>
      </div>
    </div>
  );
};
