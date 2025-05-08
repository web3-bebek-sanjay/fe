import IPX from './json/IPX.json';
import { ABIBos, ContractType } from './types';

const contracts: ContractType[] = [
  {
    name: 'IPX',
    address: '0xB94a220cAA18A5c9FB115B1DbD5F4A6CEc511b25',
    abi: IPX as ABIBos[],
  },
];

export const getContract = (name: 'IPX') => {
  const contract = contracts.find((contract) => contract.name === name);
  if (!contract) {
    throw new Error(`Contract ${name} not found`);
  }
  return contract;
};

export default contracts;
