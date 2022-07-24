import { TMetadata } from '../../services/tokenApi';
import TokenIcon from '../TokenIcon';
import { formatTokenAmount } from '../../utils';

export default function TokenAmountPreview(params: { token: TMetadata, amount: string }) {
  const { token, amount } = params;

  return (
    <div className="token-info" title={amount}>
      <div className="token-amount">
        {formatTokenAmount(amount, token.decimals)}
        {' '}
        {token.symbol}
      </div>
      <TokenIcon url={token.icon || ''} size={32} />
    </div>
  );
}
