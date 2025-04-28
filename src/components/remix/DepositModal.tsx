import { useState } from 'react';
import { Button } from '../ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { Remix } from './types';

interface DepositModalProps {
  remix: Remix;
  onClose: () => void;
  onDeposit: (remixId: string, amount: string) => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({
  remix,
  onClose,
  onDeposit,
}) => {
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDeposit = () => {
    if (!amount || parseFloat(amount) <= 0) return;

    setIsSubmitting(true);
    // Simulate deposit transaction
    setTimeout(() => {
      onDeposit(remix.id, amount);
      setIsSubmitting(false);
      onClose();
    }, 2000);
  };

  // Calculate the royalty amount based on entered value
  const royaltyAmount = amount
    ? ((parseFloat(amount) * remix.royaltyRate) / 100).toFixed(4)
    : '0.0000';

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      >
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full shadow-xl"
        >
          <h3 className="text-xl font-bold mb-4">Deposit Royalties</h3>
          <div className="mb-6">
            <div className="flex items-center mb-4">
              <img
                src={remix.coverImage}
                alt={remix.title}
                className="w-16 h-16 rounded-md object-cover mr-4"
              />
              <div>
                <h4 className="font-semibold">{remix.title}</h4>
                <p className="text-sm text-slate-500">
                  Based on: {remix.parentTitle}
                </p>
              </div>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-4">
              <div className="flex justify-between mb-2">
                <span>Royalty Rate:</span>
                <span className="font-medium">{remix.royaltyRate}%</span>
              </div>
              <div className="flex justify-between">
                <span>Creator:</span>
                <span className="font-mono text-sm">{remix.parentCreator}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Sales Amount (ETH)
              </label>
              <input
                type="number"
                step="0.001"
                min="0.001"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                placeholder="Enter total sales amount"
              />
            </div>

            <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex justify-between mb-1">
                <span>Sales Amount:</span>
                <span className="font-medium">{amount || '0.0000'} ETH</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Royalty Payment ({remix.royaltyRate}%):</span>
                <span className="text-amber-600 dark:text-amber-400">
                  {royaltyAmount} ETH
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeposit}
              className="flex-1"
              disabled={!amount || parseFloat(amount) <= 0 || isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <RefreshCw size={16} className="mr-2 animate-spin" />
                  Processing...
                </span>
              ) : (
                'Deposit Royalties'
              )}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};