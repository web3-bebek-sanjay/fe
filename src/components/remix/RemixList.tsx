import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Remix } from './types';
import { Eye, ArrowUpRight, Banknote, Shield, GitBranch } from 'lucide-react';

interface RemixListProps {
  remixes: Remix[];
  onDepositClick: (remix: Remix) => void;
  onViewParentDetails?: (parentId: string) => void;
  parentIPDetails?: { [key: string]: any };
}

export const RemixList: React.FC<RemixListProps> = ({
  remixes,
  onDepositClick,
  onViewParentDetails,
  parentIPDetails = {},
}) => {
  if (remixes.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 text-center">
        <p className="text-slate-600 dark:text-slate-400">
          You have not created any remixes yet. Go to the IP Marketplace to find
          assets you can remix.
        </p>
        <Button className="mt-4" variant="outline">
          <ArrowUpRight className="h-4 w-4 mr-2" />
          Go to Marketplace
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-700/50">
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-500 dark:text-slate-400">
                IP Title
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-500 dark:text-slate-400">
                Type
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-500 dark:text-slate-400">
                Original IP
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-500 dark:text-slate-400">
                Royalty Rate
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-slate-500 dark:text-slate-400">
                Sales
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-slate-500 dark:text-slate-400">
                Royalties Paid
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {remixes.map((remix) => {
              const isOriginal = false;

              const parentDetails = parentIPDetails[remix.parentId];

              const originalTitle =
                parentDetails?.title || remix.parentTitle || 'Unknown Original';

              const originalCreator = parentDetails?.owner
                ? `${parentDetails.owner.substring(
                    0,
                    6
                  )}...${parentDetails.owner.substring(
                    parentDetails.owner.length - 4
                  )}`
                : remix.parentCreator || 'Unknown';

              const royaltyRate = `${
                parentDetails?.royaltyPercentage || remix.royaltyRate || 0
              }%`;

              return (
                <tr
                  key={remix.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-700/30"
                >
                  <td className="px-4 py-4">
                    <div className="font-medium">{remix.title}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      ID: {remix.tokenId}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                      <GitBranch className="w-3 h-3 mr-1" />
                      Remix
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-medium">{originalTitle}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      By: {originalCreator}
                    </div>
                    {remix.parentId && onViewParentDetails && (
                      <button
                        onClick={() => onViewParentDetails(remix.parentId)}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1 flex items-center"
                      >
                        <Eye className="h-3 w-3 mr-1" /> View Original
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-medium">{royaltyRate}</div>
                  </td>
                  <td className="px-4 py-4 text-right font-medium">
                    {remix.totalSales} ETH
                  </td>
                  <td className="px-4 py-4 text-right font-medium">
                    {remix.totalRoyaltiesPaid} ETH
                  </td>
                  <td className="px-4 py-4 text-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDepositClick(remix)}
                    >
                      <Banknote className="h-4 w-4 mr-1" />
                      Deposit
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
