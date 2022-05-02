import LinearProgress from '@mui/material/LinearProgress';

export default function ProcessLog(params: { lines: string[], inProgress: boolean }) {
  const { lines, inProgress } = params;
  return (
    <div className="process-log">
      {lines.map((x) => (
        <div>{x}</div>
      ))}
      {inProgress && (<LinearProgress color="inherit" style={{ marginTop: 10 }} />)}
    </div>
  )
};
