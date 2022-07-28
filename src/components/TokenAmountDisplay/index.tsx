// import Big from 'big.js';

import { TNearAmount } from '../../services/api';
import { formatTokenAmount } from '../../utils';
import { TMetadata } from '../../services/tokenApi';
import TokenIcon from '../TokenIcon';

export default function TokenAmountDisplay(params: { token: TMetadata, amount: TNearAmount }) {
  const { token, amount } = params;

  console.log(token, amount);

  return (
    <span title={amount}>
      {formatTokenAmount(amount, token.decimals)}
      {' '}
      {token.symbol}
      {' '}
      <TokenIcon url={token.icon || ''} size={32} />
    </span>
  );
}
