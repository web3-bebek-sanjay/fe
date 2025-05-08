'use client';

import type React from 'react';
import { motion } from 'framer-motion';
import { CheckCircleIcon, AlertCircleIcon, LoaderIcon } from 'lucide-react';

interface TransactionStatusProps {
  status: 'pending' | 'success' | 'error';
  onReset: () => void;
  successMessage: string;
  errorMessage: string;
  pendingMessage: string;
}

export const TransactionStatus: React.FC<TransactionStatusProps> = ({
  status,
  onReset,
  successMessage,
  errorMessage,
  pendingMessage,
}) => {
  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
        <div className="flex flex-col items-center justify-center text-center">
          {status === 'pending' && (
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.8,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              className="flex flex-col items-center"
            >
              <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                <LoaderIcon
                  size={32}
                  className="text-blue-600 dark:text-blue-400 animate-spin"
                />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Transaction in Progress
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                {pendingMessage}
              </p>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1 mb-6">
                <motion.div
                  className="bg-blue-600 h-1 rounded-full"
                  initial={{
                    width: '5%',
                  }}
                  animate={{
                    width: '90%',
                  }}
                  transition={{
                    duration: 10,
                  }}
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Please wait while your transaction is being processed on the
                blockchain. This may take a few minutes.
              </p>
            </motion.div>
          )}
          {status === 'success' && (
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.8,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              className="flex flex-col items-center"
            >
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                <CheckCircleIcon
                  size={32}
                  className="text-green-600 dark:text-green-400"
                />
              </div>
              <h3 className="text-xl font-semibold mb-2">Success!</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                {successMessage}
              </p>
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 mb-6 w-full">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-500 dark:text-slate-400">
                    Transaction Hash:
                  </span>
                  <span className="font-mono">0x71c...9e3f</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">
                    Block Number:
                  </span>
                  <span className="font-mono">14,325,661</span>
                </div>
              </div>
              <button
                onClick={onReset}
                className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Done
              </button>
            </motion.div>
          )}
          {status === 'error' && (
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.8,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              className="flex flex-col items-center"
            >
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                <AlertCircleIcon
                  size={32}
                  className="text-red-600 dark:text-red-400"
                />
              </div>
              <h3 className="text-xl font-semibold mb-2">Transaction Failed</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                {errorMessage}
              </p>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-lg p-4 mb-6 w-full">
                <div className="text-sm text-red-700 dark:text-red-400">
                  <p className="font-medium mb-1">Error Details:</p>
                  <p className="font-mono text-xs">User rejected transaction</p>
                </div>
              </div>
              <button
                onClick={onReset}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Try Again
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
