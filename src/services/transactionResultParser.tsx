type TTxStatus = {
  origin: any,
  method: {
    name: string,
    args: any,
    result: any | null,
  },
};

export const parseTxResultUrl = (resultUrl: string): string | null => {
  const searchParams = new URLSearchParams(resultUrl);
  const transactionHashesRaw: string | null = searchParams.get('transactionHashes');

  if (!transactionHashesRaw) {
    return null;
  }

  const txHash = transactionHashesRaw.split(',')[0];

  console.log('txHash', txHash);

  return txHash;
};

export const fetchTxStatus = async (rpcProvider: any, contractAddress: string, txHash: string): Promise<TTxStatus | null> => {
  const fetch = async (): Promise<any | null> => {
    try {
      const response = await rpcProvider.txStatus(txHash, contractAddress);

      return response;
    } catch (error) {
      console.log('Transaction fetch error', { error });

      return null;
    }
  };

  const txStatus = await fetch();

  if (!txStatus) {
    return null;
  }

  const methodName = txStatus.transaction.actions[0].FunctionCall.method_name;
  const args = JSON.parse(atob(txStatus.transaction.actions[0].FunctionCall.args));
  const successValue = txStatus.status.SuccessValue;

  return {
    origin: txStatus,
    method: {
      name: methodName,
      args,
      result: successValue || null,
    },
  };
};
