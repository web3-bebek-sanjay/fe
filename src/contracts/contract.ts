import IPX from './json/IPX.json';
import { ABIBos, ContractType } from './types';

const contracts: ContractType[] = [
  {
    name: 'IPX',
    address: '0x008CCF644B21ea44B0849817ADEbA5efAE4026b3',
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
