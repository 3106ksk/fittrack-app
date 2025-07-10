import { Controller } from 'react-hook-form';
import { TextField } from '@mui/material';

const TargetAmount = ({
  control,
  errors,
  label = '目標回数',
  name = 'targetAmount',
  type = 'number',
}) => {
  return (
    <div className="targetAmount">
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label={label}
            type={type}
            fullWidth
            error={!!errors[name]}
            helperText={errors[name]?.message}
          />
        )}
      />
    </div>
  );
};

export default TargetAmount;
