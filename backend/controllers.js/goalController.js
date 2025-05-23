const goalService = require('../services/gotService');

const createSetGoal = async (req, res) => {
  try {
    const userId = req.user.id;
    const setGoalData = {
      userID: userId,
      exercise: req.body.exercise,
      exerciseType: req.body.exerciseType,
      targetAmount: parseInt(req.body.targetAmount, 10),
      metricUnit: req.body.metricUnit
    };
    const createdSetGoal = await goalService.createSetGoal(setGoalData);

    res.status(201).json({
      message: '目標が正常に作成されました',
      goal: createdSetGoal.goal
    });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  createSetGoal
};