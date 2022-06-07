import { useContext } from 'react';
import { INearProps, NearContext } from '../../services/near';

export default function PayForContractStorage() {
  const { near }: { near: INearProps | null } = useContext(NearContext);

  const handlePay = () => {
    const perform = async () => {
      if (!near) {
        return;
      }
      if (!near.tokenApi) {
        return;
      }
      const bounds = await near.tokenApi.storageBalanceBounds();
      const amount = bounds.max;

      console.log(amount);
      const result = await near.tokenApi.storageDeposit(near.lockupContractId, amount);
      console.log(result);
    };
    perform();
  };

  return (
    <div>
      <div style={{ maxWidth: 640, margin: 'auto', paddingTop: 20 }}>
        <p>
          Please pay for the account storage in fungible token contract.
          This is necessary to allow lockup contract to hold locked fungible token funds.
          This is a one time payment for the lockup contract.
          Additionally, all users claiming lockups will have to pay for the
          storage for their account too.
        </p>

        <button className="button fullWidth" type="button" onClick={handlePay}>
          Pay
        </button>
      </div>
    </div>
  );
}
