const goalService = require('../services/goalService');

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
      message: createdSetGoal.message,
      goal: createdSetGoal.goal
    });
  } catch (error) {
    handleError(res, error);
  }
};

const getGoals = async (req, res) => {
  try {
    const userId = req.user.id;
    const userGoals = await goalService.getGoalsByUserId(userId);
    res.json({
      message: '目標一覧を取得しました',
      count: userGoals.length, 
      goals: userGoals 
    });
  } catch (error) {
    handleError(res, error);
  }

};

const updateProgress = async (req, res) => {
  try {
    const {id} = req.params;
    const { progressAmount } = req.body;
    const userId = req.user.id;

    const updatedGoal = await goalService.updateProgress(id, userId, progressAmount);
    res.json(updatedGoal);
  } catch (error) {
    handleError(res, error);
  }
};

const updateStatus = async (req, res) => {
  try {
    const {id} = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const updatedGoal = await goalService.updateStatus(id, userId, status);
    res.json(updatedGoal);
  } catch (error) {
    handleError(res, error);
  }
};

// エラーハンドリング関数を追加
const handleError = (res, error) => {
  console.error('Goal Controller Error:', error);

  switch (error.name) {
    case 'GoalValidationError':
      return res.status(400).json({
        error: 'バリデーションエラー',
        message: error.message,
        details: error.details || null
      });
    case 'GoalAlreadyExistsError':
      return res.status(409).json({
        error: '目標重複エラー',
        message: error.message,
        existingGoal: error.existingGoal
      });
    case 'UserNotFoundError':
      return res.status(404).json({
        error: 'ユーザー不明',
        message: error.message
      });
    default:
      return res.status(500).json({
        error: 'サーバーエラー',
        message: 'サーバー内部でエラーが発生しました',
        details: error.message
      });
  }
};

module.exports = {
  createSetGoal,
  getGoals,
  updateProgress,
  updateStatus
};