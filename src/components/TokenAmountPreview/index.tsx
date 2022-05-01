import { TMetadata } from '../../services/tokenApi';
import TokenIcon from '../TokenIcon';

export default function TokenAmountPreview(params: { token: TMetadata, amount: String }) {
  const { token, amount } = params;

  return (
    <div className="balance-info-block" style={{ display: 'flex' }}>
      <div style={{ flex: 1, alignContent: 'center' }} className="amount-info">
        <div className="token-symbol">
          {token.symbol}
        </div>
        <div className="token-amount">
          {amount}
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <TokenIcon url={token.icon || ''} size={64} />
      </div>
    </div>
  );
}
