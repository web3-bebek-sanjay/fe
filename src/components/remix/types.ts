export interface Deposit {
  id: string;
  amount: string;
  date: Date;
  status: 'pending' | 'confirmed' | 'failed';
}

export interface Remix {
  id: string;
  tokenId: string;
  parentId: string;
  title: string;
  description: string;
  originalTitle?: string; // Make compatible with your code
  originalCreator?: string; // Make compatible with your code
  parentTitle?: string; // Keep for backward compatibility
  parentCreator?: string; // Keep for backward compatibility
  royaltyRate: number;
  status: string;
  createdAt: Date;
  totalSales: string;
  totalRoyaltiesPaid: string;
  deposits: Deposit[];
  coverImage?: string; // Make optional
}
