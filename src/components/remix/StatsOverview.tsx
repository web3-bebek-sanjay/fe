import { motion } from 'framer-motion';
import { BarChart2, TrendingUp, DollarSign, ArrowRightIcon } from 'lucide-react';

interface StatsOverviewProps {
  totalRemixes: number;
  totalSales: string;
  totalRoyalties: string;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  totalRemixes,
  totalSales,
  totalRoyalties,
}) => {
  // Mock percentage changes for demonstration
  const percentChanges = {
    remixes: 8.3,
    sales: 12.7,
    royalties: 6.2
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6"
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Total Remixes
            </h3>
            <div className="flex items-baseline mt-1">
              <span className="text-2xl font-bold">{totalRemixes}</span>
              <span className="text-sm ml-1">Tracks</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <BarChart2 size={20} className="text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <div className="flex items-center mt-4">
          <div className="text-xs font-medium px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
            +{percentChanges.remixes}%
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 ml-1.5">
            vs. previous month
          </span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6"
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Total Sales
            </h3>
            <div className="flex items-baseline mt-1">
              <span className="text-2xl font-bold">{totalSales}</span>
              <span className="text-sm ml-1">ETH</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <TrendingUp size={20} className="text-purple-600 dark:text-purple-400" />
          </div>
        </div>
        <div className="mt-4">
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-600 rounded-full"
              style={{ width: `${Math.min(parseFloat(totalSales) * 10, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span>0 ETH</span>
            <span>{(parseFloat(totalSales) * 2).toFixed(2)} ETH (Goal)</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6"
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Total Royalties Paid
            </h3>
            <div className="flex items-baseline mt-1">
              <span className="text-2xl font-bold">{totalRoyalties}</span>
              <span className="text-sm ml-1">ETH</span>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium flex items-center"
          >
            Details
            <ArrowRightIcon size={16} className="ml-1" />
          </motion.button>
        </div>
        <div className="flex items-center mt-4">
          <div className="text-xs font-medium px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300">
            +{percentChanges.royalties}%
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 ml-1.5">
            vs. previous month
          </span>
        </div>
      </motion.div>
    </div>
  );
};