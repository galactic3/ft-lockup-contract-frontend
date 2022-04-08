export interface INearConfig {
  networkId: string,
  nodeUrl: string,
  contractName: string,
  tokenContractName: string,
  walletUrl: string,
  helperUrl: string,
  explorerUrl: string,
}

const CONTRACT_NAME = process.env.REACT_APP_CONTRACT_NAME || 'ft-lockup.demo000.ft-lockup.testnet';
const TOKEN_CONTRACT_NAME = process.env.TOKEN_CONTRACT_NAME || 'token.demo000.ft-lockup.testnet'

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
        tokenContractName: TOKEN_CONTRACT_NAME,
        walletUrl: 'https://wallet.near.org',
        helperUrl: 'https://helper.mainnet.near.org',
        explorerUrl: 'https://explorer.mainnet.near.org',
      };
    case 'development':
    case 'testnet':
      return {
        networkId: 'testnet',
        nodeUrl: 'https://rpc.testnet.near.org',
        contractName: CONTRACT_NAME,
        tokenContractName: TOKEN_CONTRACT_NAME,
        walletUrl: 'https://wallet.testnet.near.org',
        helperUrl: 'https://helper.testnet.near.org',
        explorerUrl: 'https://explorer.testnet.near.org',
      };
    case 'betanet':
      return {
        networkId: 'betanet',
        nodeUrl: 'https://rpc.betanet.near.org',
        contractName: CONTRACT_NAME,
        tokenContractName: TOKEN_CONTRACT_NAME,
        walletUrl: 'https://wallet.betanet.near.org',
        helperUrl: 'https://helper.betanet.near.org',
        explorerUrl: 'https://explorer.betanet.near.org',
      };
    case 'local':
      return {
        explorerUrl: '',
        helperUrl: '',
        networkId: 'local',
        nodeUrl: 'http://localhost:3030',
        walletUrl: 'http://localhost:4000/wallet',
        contractName: CONTRACT_NAME,
        tokenContractName: TOKEN_CONTRACT_NAME,
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
        tokenContractName: TOKEN_CONTRACT_NAME,
      };
    case 'ci-betanet':
      return {
        explorerUrl: '',
        helperUrl: '',
        walletUrl: '',
        networkId: 'shared-test-staging',
        nodeUrl: 'https://rpc.ci-betanet.near.org',
        contractName: CONTRACT_NAME,
        tokenContractName: TOKEN_CONTRACT_NAME,
      };
    default:
      throw Error(`Unconfigured environment '${env}'. Can be configured in src/config.js.`);
  }
}

export const config = getConfig();
