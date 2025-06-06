import { Remix } from '../types';

export const mockRemixes: Remix[] = [
  {
    id: 'remix-001',
    tokenId: 'token-001',
    title: 'Techno Flip Remix',
    description: 'A high-energy techno remix of the original beat collection',
    parentId: 'ip-045',
    parentTitle: 'Beat Collection Vol. 3',
    parentCreator: '0xA1b2...C3d4',
    coverImage: 'https://picsum.photos/seed/1/300/300',
    createdAt: new Date(2024, 3, 15),
    royaltyRate: 12,
    status: 'active',
    deposits: [
      {
        id: 'd-001',
        amount: '0.05',
        date: new Date(2024, 3, 20),
        status: 'confirmed',
      },
      {
        id: 'd-002',
        amount: '0.12',
        date: new Date(2024, 4, 1),
        status: 'confirmed',
      },
    ],
    totalSales: '1.42',
    totalRoyaltiesPaid: '0.17',
  },
  {
    id: 'remix-002',
    tokenId: 'token-002',
    title: 'Digital Art Fusion',
    description:
      'A creative fusion of digital art elements from the abstract collection',
    parentId: 'ip-078',
    parentTitle: 'Abstract Collection',
    parentCreator: '0xE5f6...G7h8',
    coverImage: 'https://picsum.photos/seed/2/300/300',
    createdAt: new Date(2024, 4, 5),
    royaltyRate: 10,
    status: 'active',
    deposits: [
      {
        id: 'd-003',
        amount: '0.08',
        date: new Date(2024, 4, 10),
        status: 'confirmed',
      },
    ],
    totalSales: '0.8',
    totalRoyaltiesPaid: '0.08',
  },
  {
    id: 'remix-003',
    tokenId: 'token-003',
    title: 'Nature Sounds Evolution',
    description:
      'An evolved version of the original forest sounds with enhanced audio processing',
    parentId: 'ip-112',
    parentTitle: 'Forest Sounds Original',
    parentCreator: '0xI9j0...K1l2',
    coverImage: 'https://picsum.photos/seed/3/300/300',
    createdAt: new Date(2024, 4, 20),
    royaltyRate: 15,
    status: 'active',
    deposits: [],
    totalSales: '0.3',
    totalRoyaltiesPaid: '0.0',
  },
];
