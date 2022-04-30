export default function TokenIcon(params: { url: string, size: number }) {
  const { url, size } = params;
  return (
    <img
      style={{
        height: size, width: size, verticalAlign: 'middle',
      }}
      src={url}
      alt="Token Icon"
    />
  );
}
