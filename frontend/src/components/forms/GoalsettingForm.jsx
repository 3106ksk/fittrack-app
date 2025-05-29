import { Alert, Button } from '@mui/material';
import useGoalForm from '../../hooks/useGoalForm';
import ExerciseSelect from './FormFields/ExerciseSelect';
import TargetAmount from './FormFields/TargetAmount';


const GoalsettingForm = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    feedback,
    submitGoal
  } = useGoalForm();
  return (
    <>
      {feedback.visible && (
        <Alert severity={feedback.type} sx={{ mt: 2 }}>
          {feedback.message}
        </Alert>
      )}
      <form className='formContainer' onSubmit={handleSubmit(submitGoal)}>
        <ExerciseSelect control={control} errors={errors} />
        <TargetAmount control={control} errors={errors} />
        <Button type='submit' variant='contained' color='primary'>
          目標設定
        </Button>
      </form>
    </>
  )
};

export default GoalsettingForm;