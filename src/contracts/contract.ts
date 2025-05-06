import IPX from './json/IPX.json';
import { ABIBos, ContractType } from './types';

const contracts: ContractType[] = [
  {
    name: 'IPX',
    address: '0x176F5a57C29e45527685f74031dd882eBc40CE49',
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
