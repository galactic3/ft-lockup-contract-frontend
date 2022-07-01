import { TMetadata } from '../../services/tokenApi';
import TokenIcon from '../TokenIcon';

export default function TokenAmountPreview(params: { token: TMetadata, amount: String }) {
  const { token, amount } = params;

  return (
    <div className="token-info">
      <div className="token-amount">
        {amount}
        {' '}
        {token.symbol}
      </div>
      <TokenIcon url={token.icon || ''} size={32} />
    </div>
  );
}
