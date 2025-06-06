import { useState } from 'react';
import { Remix } from './types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { InfoIcon, AlertTriangle } from 'lucide-react';

interface DepositModalProps {
  remix: Remix;
  onClose: () => void;
  onDeposit: (remixId: string, amount: string) => Promise<void>;
  parentDetails?: any;
}

export const DepositModal: React.FC<DepositModalProps> = ({
  remix,
  onClose,
  onDeposit,
  parentDetails,
}) => {
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  const handleDeposit = async () => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    // Get the parent ID - could be 0, which is valid
    const parentId = remix.parentId;

    setError(null);
    setIsProcessing(true);
    try {
      // Calculate the royalty amount based on total profit
      const totalProfit = parseFloat(amount);
      const royaltyAmount = ((totalProfit * royaltyRate) / 100).toFixed(6);

      // Add an explanation about how the royalty is calculated
      const royaltyMessage = `You're reporting a total profit of ${amount} ETH.
      Based on the royalty rate of ${royaltyRate}%, ${royaltyAmount} ETH will be deducted from your wallet and sent to the original creator.`;

      if (!confirm(royaltyMessage)) {
        setIsProcessing(false);
        return;
      }

      // Pass the remix ID, not just the parentId, to ensure the component can find the remix object
      await onDeposit(remix.id, royaltyAmount);
      onClose(); // Close the modal on success
    } catch (error: any) {
      console.error('Error during deposit:', error);

      // Extract meaningful error message
      let errorMessage =
        'Transaction failed. There might be an issue with the smart contract.';
      if (error?.message) {
        if (error.message.includes('user rejected')) {
          errorMessage = 'Transaction was rejected by the user.';
        } else if (error.message.includes('insufficient funds')) {
          errorMessage =
            'Insufficient funds in your wallet to complete this transaction.';
        } else if (error.message.includes('execution reverted')) {
          errorMessage =
            'Contract execution reverted. The contract likely has restrictions or bugs that prevent this operation.';
        }
      }

      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  // Fix the BigInt conversion issue by explicitly converting to number first
  const royaltyRate = parentDetails?.royaltyPercentage
    ? Number(parentDetails.royaltyPercentage)
    : remix.royaltyRate;

  const calculatedRoyalty = amount
    ? ((parseFloat(amount) * royaltyRate) / 100).toFixed(6)
    : '0';

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Deposit Royalty</DialogTitle>
          <DialogDescription>
            Deposit funds for your remix usage. A percentage will be sent to the
            original creator.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Display errors if any */}
          {error && (
            <Alert
              variant="destructive"
              className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
            >
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <AlertTitle className="text-red-800 dark:text-red-400">
                Transaction Failed
              </AlertTitle>
              <AlertDescription className="text-sm text-red-700 dark:text-red-400">
                {error}
                <button
                  className="block mt-2 text-xs underline"
                  onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                >
                  {showTechnicalDetails
                    ? 'Hide technical details'
                    : 'Show technical details'}
                </button>
              </AlertDescription>
            </Alert>
          )}

          <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Remix ID:
              </span>
              <span className="text-sm font-medium">{remix.tokenId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Parent IP ID:
              </span>
              <span className="text-sm font-medium">
                {remix.parentId || 'Unknown'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Original IP:
              </span>
              <span className="text-sm font-medium">
                {parentDetails?.title || remix.parentTitle}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Creator:
              </span>
              <span className="text-sm font-medium">
                {parentDetails?.owner
                  ? `${parentDetails.owner.substring(
                      0,
                      6
                    )}...${parentDetails.owner.substring(
                      parentDetails.owner.length - 4
                    )}`
                  : remix.parentCreator}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Royalty Rate:
              </span>
              <span className="text-sm font-medium">{royaltyRate}%</span>
            </div>
          </div>

          <div>
            <Label htmlFor="amount">Total Profit Amount (ETH)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.000001"
              min="0"
              disabled={isProcessing}
              className="mt-1"
            />
            <p className="text-xs text-slate-500 mt-1">
              Enter your total profit. The system will calculate the royalty
              amount ({royaltyRate}%) to pay.
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <div className="flex justify-between">
              <span className="text-sm text-blue-700 dark:text-blue-400">
                Total Profit Amount:
              </span>
              <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                {amount || '0'} ETH
              </span>
            </div>

            <div className="pt-2 mt-2 border-t border-blue-200 dark:border-blue-800">
              <div className="flex justify-between">
                <span className="text-sm text-blue-700 dark:text-blue-400">
                  Royalty to be Paid:
                </span>
                <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                  {calculatedRoyalty} ETH ({royaltyRate}%)
                </span>
              </div>
            </div>

            <p className="text-xs text-blue-600 dark:text-blue-500 mt-2">
              Only the calculated royalty amount will be deducted from your
              wallet.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            onClick={handleDeposit}
            disabled={!amount || isProcessing || parseFloat(amount) <= 0}
          >
            {isProcessing ? (
              <div className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </div>
            ) : (
              'Deposit'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
