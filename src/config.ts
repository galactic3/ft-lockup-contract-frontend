export interface INearConfig {
  networkId: string,
  nodeUrl: string,
  contractName: string,
  walletUrl: string,
  helperUrl: string,
  explorerUrl: string,
  factoryContractName: string,
}

export const DEFAULT_CONTRACT_NAME = process.env.REACT_APP_DEFAULT_CONTRACT_NAME as string;
export const FACTORY_CONTRACT_NAME = process.env.REACT_APP_FACTORY_CONTRACT_NAME as string;
export const TRY_CONVERT = true;

const getCurrentContractName = (): string => {
  const contractNameFromUrl = window.location.hash.split('/')[1];
  if (contractNameFromUrl === 'new_lockup_contract') return FACTORY_CONTRACT_NAME;

  return contractNameFromUrl;
};

export const CONTRACT_NAME = getCurrentContractName();

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
      };
    default:
      throw Error(`Unconfigured environment '${env}'. Can be configured in src/config.js.`);
  }
}

export const config = getConfig();
