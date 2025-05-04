import IPX from './json/IPX.json';
import { ABIBos, ContractType } from './types';

const contracts: ContractType[] = [
  {
    name: 'IPX',
    address: '0xeD2791c97165e21e18C121017fC51B9a436A669C',
    abi: IPX.abi as ABIBos[],
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
