import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Remix } from './types';
import { Eye, ArrowUpRight, Banknote } from 'lucide-react';

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
                Remix Title
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
              const parentDetails = remix.parentId
                ? parentIPDetails[remix.parentId]
                : null;

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
                    <div className="font-medium">
                      {parentDetails?.title ||
                        remix.originalTitle ||
                        remix.parentTitle}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      By:{' '}
                      {parentDetails?.owner
                        ? `${parentDetails.owner.substring(
                            0,
                            6
                          )}...${parentDetails.owner.substring(
                            parentDetails.owner.length - 4
                          )}`
                        : remix.originalCreator || remix.parentCreator}
                    </div>
                    {remix.parentId &&
                      remix.parentId !== '0' &&
                      onViewParentDetails && (
                        <button
                          onClick={() => onViewParentDetails(remix.parentId)}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1 flex items-center"
                        >
                          <Eye className="h-3 w-3 mr-1" /> View Original
                        </button>
                      )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-medium">
                      {parentDetails?.royaltyPercentage || remix.royaltyRate}%
                    </div>
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
