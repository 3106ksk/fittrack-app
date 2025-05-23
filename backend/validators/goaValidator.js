// validators/goalValidator.js
const { User } = require('../models');

/**
 * 目標作成時のバリデーション
 * @param {Object} setGoalData - 目標データ
 * @throws {Error} バリデーションエラー
 */
const validateGoalCreation = async (setGoalData) => {
  // 必須フィールドの検証
  const requiredFields = ['userID', 'exercise', 'exerciseType', 'targetAmount', 'metricUnit'];
  const missingFields = requiredFields.filter(field => !setGoalData[field]);

  if (missingFields.length > 0) {
    const error = new Error(`必須フィールドが不足しています: ${missingFields.join(', ')}`);
    error.name = 'GoalValidationError';
    error.missingFields = missingFields;
    throw error;
  }

  // ユーザーの存在確認
  const user = await User.findByPk(setGoalData.userID);
  if (!user) {
    const error = new Error('ユーザーが見つかりません');
    error.name = 'UserNotFoundError';
    throw error;
  }

  // 目標値の検証
  if (setGoalData.targetAmount <= 0) {
    const error = new Error('目標値は1以上である必要があります');
    error.name = 'GoalValidationError';
    throw error;
  }

  // 種目とmetricUnitの整合性チェック
  if (setGoalData.exerciseType === 'strength' && setGoalData.metricUnit !== 'reps') {
    const error = new Error('筋トレの場合、測定単位は回数である必要があります');
    error.name = 'GoalValidationError';
    throw error;
  }

  // cardioの場合の検証
  if (setGoalData.exerciseType === 'cardio' && !['distance'].includes(setGoalData.metricUnit)) {
    const error = new Error('有酸素運動の場合、測定単位は距離である必要があります');
    error.name = 'GoalValidationError';
    throw error;
  }
};

module.exports = {
  validateGoalCreation
};