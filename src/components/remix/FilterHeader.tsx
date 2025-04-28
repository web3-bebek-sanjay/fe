import { motion, AnimatePresence } from 'framer-motion';
import { FilterIcon, Calendar } from 'lucide-react';

interface FilterHeaderProps {
  timeRange: string;
  setTimeRange: (range: string) => void;
  filterOpen: boolean;
  setFilterOpen: (open: boolean) => void;
}

export const FilterHeader: React.FC<FilterHeaderProps> = ({
  timeRange,
  setTimeRange,
  filterOpen,
  setFilterOpen,
}) => {
  return (
    <>
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-2 flex-shrink-0"
      >
        <div className="flex rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setTimeRange('week')}
            className={`px-3 py-1.5 text-sm font-medium ${timeRange === 'week' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800'}`}
          >
            Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-3 py-1.5 text-sm font-medium ${timeRange === 'month' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800'}`}
          >
            Month
          </button>
          <button
            onClick={() => setTimeRange('year')}
            className={`px-3 py-1.5 text-sm font-medium ${timeRange === 'year' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800'}`}
          >
            Year
          </button>
        </div>
        <button
          onClick={() => setFilterOpen(!filterOpen)}
          className={`p-2 rounded-lg border ${filterOpen ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}
        >
          <FilterIcon size={18} />
        </button>
        <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm">
          <Calendar size={16} />
          <span>Custom</span>
        </button>
      </motion.div>

      <AnimatePresence>
        {filterOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden w-full mt-4"
          >
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Remix Category</label>
                  <select className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800">
                    <option value="">All Categories</option>
                    <option value="music">Music</option>
                    <option value="art">Digital Art</option>
                    <option value="audio">Audio Files</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Royalty Status</label>
                  <select className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800">
                    <option value="">All Statuses</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Royalty Rate</label>
                  <select className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800">
                    <option value="">All Rates</option>
                    <option value="0-10">0% - 10%</option>
                    <option value="10-20">10% - 20%</option>
                    <option value="20+">20%+</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};