const { Goal } = require('../models');

const createSetGoal = async (setGoalData) => {
  try {
    const existingGoal = await Goal.findone({
      where: {
        userID: goalData.userID,
        exercise: goalData.exercise,
        status: 'in_progress'
      }
    });

    if (existingGoal) {
      const error = new Error('このトレーニング目標はすでに設定されています。');
      error.name = "重複エラー";
      error.existingGoal = existingGoal;
      throw error;
    }

    const setGoalDefaults = {
      ...setGoalData,
      progressAmount: 0,
      status: 'in_progress',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const newSetGoal = await Goal.create(setGoalDefaults);

    return {
      goal: newSetGoal,
      message: '目標が正常に作成されました'
    };
  } catch (error) {
    console.error('Goal Service Error:', error);
    throw error;
  }
};

module.exports = {
  createSetGoal
};