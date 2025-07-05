import React from 'react';
import useWorkoutConfig from '../hooks/useWorkoutConfig';

const WorkoutHistoryTable = () => {
  const { workoutConfig, isCardioExercise } = useWorkoutConfig();

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        {/* 第1段階: 種目名のヘッダー */}
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
              日付
            </th>
            {workoutConfig.exercises.map((exerciseName) => {
              const isCardio = isCardioExercise(exerciseName);
              const colSpan = isCardio ? 2 : workoutConfig.maxSets;
              
              return (
                <React.Fragment key={exerciseName}>
                  <th colSpan={colSpan} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    {exerciseName}
                    {isCardio && <div className="text-xs text-gray-400 mt-1">(距離・時間)</div>}
                  </th>
                </React.Fragment>
              );
            })}
          </tr>

          <tr className="bg-gray-100">
            <th className="px-4 py-2 border-r border-gray-200"></th>
            {workoutConfig.exercises.map((exerciseName) => {
              const isCardio = isCardioExercise(exerciseName);
              
              return (
                <React.Fragment key={`${exerciseName}-headers`}>
                  {isCardio ? (
                    <>
                      <th className="px-3 py-2 text-xs text-gray-600 border-r border-gray-200">距離(km)</th>
                      <th className="px-3 py-2 text-xs text-gray-600 border-r border-gray-200">時間(分)</th>
                    </>
                  ) : (
                    Array.from({ length: workoutConfig.maxSets }, (_, i) => (
                      <th key={i} className="px-3 py-2 text-xs text-gray-600 border-r border-gray-200">
                        {i + 1}セット
                      </th>
                    ))
                  )}
                </React.Fragment>
              );
            })}
          </tr>
        </thead>

        <tbody>
          {workoutConfig.exercises.map((exerciseName) => {
            const exercise = workoutConfig.exercises[exerciseName];
            const isCardio = isCardioExercise(exerciseName);

            return (
              <React.Fragment key={exerciseName}>
                {isCardio ? (
                  <>
                    <td className="px-3 py-3 text-sm text-center text-gray-700 border-r border-gray-200">
                      {exercise?.distance ? `${exercise.distance}km` : '-'}
                    </td>
                    <td className="px-3 py-3 text-sm text-center text-gray-700 border-r border-gray-200">
                      {exercise?.duration ? `${exercise.duration}分` : '-'}
                    </td>
                  </>
                ) : (
                  Array.from({ length: workoutConfig.maxSets }, (_, i) => {
                    const setKey = `set${i + 1}`;
                    return (
                      <td key={setKey} className="px-3 py-3 text-sm text-center text-gray-700 border-r border-gray-200">
                        {exercise?.[setKey] || '-'}
                      </td>
                    );
                  })
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default WorkoutHistoryTable;