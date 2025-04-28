export interface Deposit {
  id: string;
  amount: string;
  date: Date;
  status: 'confirmed' | 'pending' | 'failed';
}

export interface Remix {
  id: string;
  title: string;
  parentId: string;
  parentTitle: string;
  parentCreator: string;
  coverImage: string;
  createdAt: Date;
  royaltyRate: number;
  deposits: Deposit[];
  totalSales: string;
  totalRoyaltiesPaid: string;
}