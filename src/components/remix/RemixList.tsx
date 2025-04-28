import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Remix } from './types';

interface RemixListProps {
  remixes: Remix[];
  onDepositClick: (remix: Remix) => void;
}

export const RemixList: React.FC<RemixListProps> = ({ remixes, onDepositClick }) => {
  return (
    <motion.div 
      key="remixes"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-6"
    >
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {remixes.length > 0 ? (
          <div>
            {remixes.map((remix, index) => (
              <motion.div
                key={remix.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
                className="p-6 border-b border-slate-200 dark:border-slate-700 last:border-0"
              >
                <div className="flex flex-col md:flex-row">
                  <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                    <img
                      src={remix.coverImage}
                      alt={remix.title}
                      className="w-full md:w-40 h-40 object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-xl font-bold mb-1">
                      {remix.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">
                      Based on:{' '}
                      <span className="font-medium">
                        {remix.parentTitle}
                      </span>{' '}
                      by {remix.parentCreator}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">
                          Created
                        </p>
                        <p className="font-medium">
                          {remix.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">
                          Total Sales
                        </p>
                        <p className="font-medium">
                          {remix.totalSales} ETH
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">
                          Royalty Rate
                        </p>
                        <p className="font-medium">{remix.royaltyRate}%</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="mr-4">
                          <p className="text-xs text-slate-500 mb-1">
                            Royalties Paid
                          </p>
                          <p className="font-medium">
                            {remix.totalRoyaltiesPaid} ETH
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">
                            Status
                          </p>
                          <div className="flex items-center">
                            {parseFloat(remix.totalRoyaltiesPaid) > 0 ? (
                              <CheckCircle
                                size={16}
                                className="text-green-500 mr-1"
                              />
                            ) : (
                              <AlertCircle
                                size={16}
                                className="text-amber-500 mr-1"
                              />
                            )}
                            <span
                              className={`text-sm ${
                                parseFloat(remix.totalRoyaltiesPaid) > 0
                                  ? 'text-green-600 dark:text-green-400'
                                  : 'text-amber-600 dark:text-amber-400'
                              }`}
                            >
                              {parseFloat(remix.totalRoyaltiesPaid) > 0
                                ? 'Payments up-to-date'
                                : 'Royalties due'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <Button onClick={() => onDepositClick(remix)}>
                        Deposit Royalties
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-slate-500 dark:text-slate-400">
              You haven't registered any remixes yet.
            </p>
            <Button className="mt-4">Register a Remix</Button>
          </div>
        )}
      </div>
    </motion.div>
  );
};