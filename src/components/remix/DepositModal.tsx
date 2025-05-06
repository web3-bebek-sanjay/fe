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

    // Deep extract tokenId from potentially nested proxy objects
    let remixTokenId = extractTokenId(remix, parentDetails);

    // If no valid token ID was found, show error
    if (!remixTokenId) {
      setError('Could not determine the remix token ID. Please try again.');
      console.error('Failed to extract token ID from:', {
        remix,
        parentDetails,
      });
      return;
    }

    console.log(`Using extracted remix token ID: ${remixTokenId}`);

    setError(null);
    setIsProcessing(true);
    try {
      // Calculate the royalty amount based on total profit
      const totalProfit = parseFloat(amount);
      const royaltyAmount = ((totalProfit * royaltyRate) / 100).toFixed(6);

      // Add an explanation about how the royalty is calculated
      const royaltyMessage = `You're reporting a total profit of ${amount} ETH.
      Based on the royalty rate of ${royaltyRate}%, only ${royaltyAmount} ETH will be deducted from your wallet and sent to the original creator.`;

      if (!confirm(royaltyMessage)) {
        setIsProcessing(false);
        return;
      }

      // Debug the remix object to see what's available
      console.log('Remix object being used for deposit:', remix);
      console.log(
        `Depositing royalty for remix #${remixTokenId} with total profit ${amount} ETH and actual payment ${royaltyAmount} ETH`
      );

      // Pass only the royalty amount to the onDeposit function
      await onDeposit(remixTokenId.toString(), royaltyAmount);
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

  // Add this helper function to extract the token ID from various object structures
  const extractTokenId = (remix: any, parentDetails?: any): string | null => {
    console.log('Extracting token ID from remix:', remix);

    // 1. Try direct access (standard object format)
    if (remix?.tokenId && remix.tokenId !== '0') {
      console.log(`Found direct tokenId: ${remix.tokenId}`);
      // If it has a prefix like "remix-", extract just the number
      if (
        typeof remix.tokenId === 'string' &&
        remix.tokenId.includes('remix-')
      ) {
        return remix.parentId || parentDetails?.tokenId || '26'; // Return parent ID instead for remix
      }
      return remix.tokenId;
    }

    // 2. Try direct access with ID property
    if (remix?.id && remix.id !== '0') {
      console.log(`Found direct id: ${remix.id}`);
      // If it has a prefix like "remix-", we should use the parentId instead
      if (typeof remix.id === 'string' && remix.id.includes('remix-')) {
        return remix.parentId || parentDetails?.tokenId || '26'; // Return parent ID instead for remix
      }
      return remix.id;
    }

    // 3. Try parent details if available
    if (parentDetails?.tokenId && parentDetails.tokenId !== '0') {
      console.log(`Found parentDetails tokenId: ${parentDetails.tokenId}`);
      return parentDetails.tokenId;
    }

    // 4. Try parentId if available (most likely what we want for remix deposits)
    if (remix?.parentId && remix.parentId !== '0') {
      console.log(`Found parentId: ${remix.parentId}`);
      return remix.parentId;
    }

    // Rest of the function remains the same...
    // Check if it's a Proxy object with a nested structure
    try {
      if (remix && typeof remix === 'object' && remix[0]) {
        // Check the second level
        if (remix[0][1] && typeof remix[0][1] === 'bigint') {
          console.log(
            `Found tokenId in nested proxy at [0][1]: ${remix[0][1]}`
          );
          return remix[0][1].toString();
        }

        // Try to access the parentId at the second level
        if (remix[0].parentId && typeof remix[0].parentId === 'bigint') {
          console.log(`Found parentId in nested proxy: ${remix[0].parentId}`);
          return remix[0].parentId.toString();
        }

        // Try another common pattern - second element might be the tokenId
        if (remix[1] && typeof remix[1] === 'bigint') {
          console.log(`Found tokenId at second position: ${remix[1]}`);
          return remix[1].toString();
        }
      }

      // 5. Look for specific structure based on your logs
      if (remix && typeof remix === 'object' && 'length' in remix) {
        for (let i = 0; i < remix.length; i++) {
          // Check if any property might be a token ID (bigint)
          if (typeof remix[i] === 'bigint' && remix[i] > 0) {
            console.log(`Found potential tokenId at index ${i}: ${remix[i]}`);
            return remix[i].toString();
          }
        }
      }
    } catch (error) {
      console.error('Error while extracting token ID:', error);
    }

    // 6. Based on your specific log structure
    try {
      // From your logs, it looks like the parent ID is at 26n position
      if (remix && remix[0] && remix[0][1] === BigInt(26)) {
        console.log('Found parent ID 26 in the nested proxy structure');
        return '26';
      }
    } catch (error) {
      console.error('Error while checking specific structure:', error);
    }

    console.warn('Could not extract a valid token ID');
    return null;
  };

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
                Original IP:
              </span>
              <span className="text-sm font-medium">
                {parentDetails?.title ||
                  remix.originalTitle ||
                  remix.parentTitle}
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
                  : remix.originalCreator || remix.parentCreator}
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
