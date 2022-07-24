export default function TimestampDateDisplay(props: { unixSeconds: number }) {
  const { unixSeconds } = props;

  const date = new Date(unixSeconds * 1_000);

  const pad = (input: number | string, width: number) => input.toString().padStart(width, '0');

  const year = pad(date.getUTCFullYear(), 4);
  const month = pad(date.getUTCMonth(), 2);
  const monthDay = pad(date.getUTCDate(), 2);

  const formatted = `${year}-${month}-${monthDay} UTC`;

  return (
    <span className="timestamp-display" title={unixSeconds.toString()}>
      {formatted}
    </span>
  );
}
