import useTitle from '../../services/useTitle';

export default function WithTitle(params: { title: string, children: JSX.Element }) {
  const { title, children } = params;

  const myUseTitle = useTitle;
  myUseTitle(title, { restoreOnUnmount: true });

  return children;
}
