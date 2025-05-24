const { Goal } = require('../models');
// 一時的にバリデーターをコメントアウト
// const { validateGoalCreation } = require('../validators/goalValidator');

const createSetGoal = async (setGoalData) => {
  try {
    // 一時的にバリデーションを無効化
    // await validateGoalCreation(setGoalData);

    const existingGoal = await Goal.findOne({
      where: {
        userID: setGoalData.userID,
        exercise: setGoalData.exercise,
        status: 'in_progress'
      }
    });

    if (existingGoal) {
      const error = new Error('このトレーニング目標はすでに設定されています。');
      error.name = "GoalAlreadyExistsError";
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

const getGoalsByUserId = async (userID) => {
  const goals = await Goal.findAll({
    where: { userID: userID },
    order: [['status', 'ASC'], ['createdAt', 'DESC']]
  });

  const formattedGoals = goals.map(goal => ({
    ...goal.toJSON(),
    progressPercentage: Math.round((goal.progressAmount / goal.targetAmount) * 100),
  }));

  return formattedGoals;
};


module.exports = {
  createSetGoal,
  getGoalsByUserId
};