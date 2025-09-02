const transformWorkoutData = apiData => {
  if (!Array.isArray(apiData) || apiData.length === 0) {
    return [];
  }

  const groupedByDate = apiData.reduce((acc, workout) => {
    const dateKey = new Date(workout.date).toLocaleDateString('ja-JP', {
      month: 'numeric',
      day: 'numeric',
    });

    if (!acc[dateKey]) {
      acc[dateKey] = {
        date: dateKey,
        dateForSort: workout.date,
        exercises: {},
        totalReps: 0,
        totalTime: 0,
      };
    }

    if (workout.exerciseType === 'cardio') {
      acc[dateKey].exercises[workout.exercise] = {
        distance: workout.distance,
        duration: workout.duration,
      };
      acc[dateKey].totalTime += workout.duration || 0;
    } else if (workout.exerciseType === 'strength') {
      const exerciseData = {};
      if (workout.repsDetail && Array.isArray(workout.repsDetail)) {
        workout.repsDetail.forEach((set, index) => {
          exerciseData[`set${index + 1}`] = set.reps;
        });
      }
      acc[dateKey].exercises[workout.exercise] = exerciseData;
      acc[dateKey].totalReps += workout.reps || 0;
    }

    return acc;
  }, {});

  return Object.values(groupedByDate).sort((a, b) => new Date(b.dateForSort) - new Date(a.dateForSort));
};

export default transformWorkoutData;
