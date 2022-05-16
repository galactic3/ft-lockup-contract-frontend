export interface INearConfig {
  networkId: string,
  nodeUrl: string,
  contractName: string,
  walletUrl: string,
  helperUrl: string,
  explorerUrl: string,
  factoryContractName: string,
  factoryContractHash: string,
}

// const CONTRACT_NAME = process.env.REACT_APP_CONTRACT_NAME || 'ft-lockup.demo005.ft-lockup.testnet';
const FACTORY_CONTRACT_NAME = process.env.FACTORY_CONTRACT_NAME || 'factory0.ft-lockup.testnet';
const FACTORY_CONTRACT_HASH = process.env.FACTORY_CONTRACT_HASH || 'C6w1pKPB9H6HcceqPG9qxS2bLTWgsBwQCj4T2xrz63a3';

export const CONTRACT_NAME = window.location.hash.split('/')[1] || 'ft-lockup.demo005.ft-lockup.testnet';

console.log(CONTRACT_NAME);

// TODO: move these data to envs
function getConfig(): INearConfig {
  const env = process.env.REACT_APP_ENVIRONMENT || 'development';
  switch (env) {
    case 'production':
    case 'mainnet':
      return {
        networkId: 'mainnet',
        nodeUrl: 'https://rpc.mainnet.near.org',
        contractName: CONTRACT_NAME,
        walletUrl: 'https://wallet.near.org',
        helperUrl: 'https://helper.mainnet.near.org',
        explorerUrl: 'https://explorer.mainnet.near.org',
        factoryContractName: FACTORY_CONTRACT_NAME,
        factoryContractHash: FACTORY_CONTRACT_HASH,
      };
    case 'development':
    case 'testnet':
      return {
        networkId: 'testnet',
        nodeUrl: 'https://rpc.testnet.near.org',
        contractName: CONTRACT_NAME,
        walletUrl: 'https://wallet.testnet.near.org',
        helperUrl: 'https://helper.testnet.near.org',
        explorerUrl: 'https://explorer.testnet.near.org',
        factoryContractName: FACTORY_CONTRACT_NAME,
        factoryContractHash: FACTORY_CONTRACT_HASH,
      };
    case 'betanet':
      return {
        networkId: 'betanet',
        nodeUrl: 'https://rpc.betanet.near.org',
        contractName: CONTRACT_NAME,
        walletUrl: 'https://wallet.betanet.near.org',
        helperUrl: 'https://helper.betanet.near.org',
        explorerUrl: 'https://explorer.betanet.near.org',
        factoryContractName: FACTORY_CONTRACT_NAME,
        factoryContractHash: FACTORY_CONTRACT_HASH,
      };
    case 'local':
      return {
        explorerUrl: '',
        helperUrl: '',
        networkId: 'local',
        nodeUrl: 'http://localhost:3030',
        walletUrl: 'http://localhost:4000/wallet',
        contractName: CONTRACT_NAME,
        factoryContractName: FACTORY_CONTRACT_NAME,
        factoryContractHash: FACTORY_CONTRACT_HASH,
      };
    case 'test':
    case 'ci':
      return {
        explorerUrl: '',
        helperUrl: '',
        walletUrl: '',
        networkId: 'shared-test',
        nodeUrl: 'https://rpc.ci-testnet.near.org',
        contractName: CONTRACT_NAME,
        factoryContractName: FACTORY_CONTRACT_NAME,
        factoryContractHash: FACTORY_CONTRACT_HASH,
      };
    case 'ci-betanet':
      return {
        explorerUrl: '',
        helperUrl: '',
        walletUrl: '',
        networkId: 'shared-test-staging',
        nodeUrl: 'https://rpc.ci-betanet.near.org',
        contractName: CONTRACT_NAME,
        factoryContractName: FACTORY_CONTRACT_NAME,
        factoryContractHash: FACTORY_CONTRACT_HASH,
      };
    default:
      throw Error(`Unconfigured environment '${env}'. Can be configured in src/config.js.`);
  }
}

export const config = getConfig();
