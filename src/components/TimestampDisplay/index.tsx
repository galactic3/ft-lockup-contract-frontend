export default function TimestampDisplay(props: { unixSeconds: number }) {
  const { unixSeconds } = props;

  const date = new Date(unixSeconds * 1_000);

  const pad = (input: number | string, width: number) => input.toString().padStart(width, '0');

  const year = pad(date.getUTCFullYear(), 4);
  const month = pad(date.getUTCMonth(), 2);
  const monthDay = pad(date.getUTCDate(), 2);

  const hours = pad(date.getUTCHours(), 2);
  const minutes = pad(date.getUTCMinutes(), 2);
  const seconds = pad(date.getUTCSeconds(), 2);

  const formatted = `${year}-${month}-${monthDay} ${hours}:${minutes}:${seconds} UTC`;

  return (
    <span className="timestamp-display">
      {formatted}
    </span>
  );
}
