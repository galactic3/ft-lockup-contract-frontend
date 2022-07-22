import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { TextField } from '@mui/material';

type TProps = {
  value: Date | null,
  setValue: (newValue: Date | null) => any,
  label: String,
  minTime: Date | null,
  disabled: boolean,
};

export default function UTCDateTimePicker(props: TProps) {
  const {
    value, setValue, label, minTime, disabled,
  } = props;

  const offsetMs = 1_000 * 60 * new Date().getTimezoneOffset();

  return (
    <DateTimePicker
      disabled={disabled}
      label={label}
      value={value && new Date(value.getTime() + offsetMs)}
      minDateTime={minTime && new Date(minTime.getTime() + offsetMs)}
      onChange={(newValue) => {
        setValue(newValue && new Date(newValue.getTime() - offsetMs));
      }}
      ampm={false}
      renderInput={
        (params) => (
          <TextField
            sx={{ margin: '0px 0 24px' }}
            margin="normal"
            fullWidth
            variant="standard"
            {...params}
            inputProps={{
              ...params.inputProps,
              placeholder: 'YYYY-MM-DD hh:mm:ss UTC',
            }}
          />
        )
      }
      inputFormat="yyyy-MM-dd HH:mm:ss 'UTC'"
    />
  );
}
