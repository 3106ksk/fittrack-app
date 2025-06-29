// POST   /goals          - 目標作成
// GET    /goals          - 目標一覧取得
// GET    /goals/:id      - 特定目標取得
// PUT    /goals/:id      - 目標更新
// DELETE /goals/:id      - 目標削除
// POST   /goals/:id/progress - 進捗更新

const router = require('express').Router();
const goalController = require('../controllers/goalController');
const authMiddleware = require('../middleware/checkJWT');

router.post('/', authMiddleware, goalController.createSetGoal);
router.get('/', authMiddleware, goalController.getGoals);
router.put('/:id/progress', authMiddleware, goalController.updateProgress);
router.put('/:id/status', authMiddleware, goalController.updateStatus);

module.exports = router;