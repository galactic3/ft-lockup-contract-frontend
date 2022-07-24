import useTitle from '../../services/useTitle';

export default function NotFoundContract() {
  useTitle('Not Found | FT Lockup', { restoreOnUnmount: true });

  return (
    <div className="container">
      Contract not found
    </div>
  );
}
