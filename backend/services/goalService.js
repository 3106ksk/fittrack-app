const { Goal } = require('../models');
const { validateGoalCreation } = require('../validators/goalValidator');

const createSetGoal = async (setGoalData) => {
  try {
    await validateGoalCreation(setGoalData);

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

const updateProgress = async (id, userId, progressAmount) => {

    const goal = await Goal.findOne({
      where: { id, userID: userId }
    });

    if (!goal) {
      throw new Error('Goal not found');
    }

    const status = progressAmount >= goal.targetAmount ? 'completed' : 'in_progress';

return await goal.update({
      progressAmount,
      status,
      updatedAt: new Date()
    });
};

const updateStatus = async (id, userId, status) => {
  const goal = await Goal.findOne({
    where: { id, userID: userId }
  });

  if (!goal) {
    throw new Error('Goal not found');
  }

  return await goal.update({ status, updatedAt: new Date() });
};

module.exports = {
  createSetGoal,
  getGoalsByUserId,
  updateProgress,
  updateStatus
};