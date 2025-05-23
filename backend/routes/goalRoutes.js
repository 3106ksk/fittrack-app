// POST   /goals          - 目標作成
// GET    /goals          - 目標一覧取得
// GET    /goals/:id      - 特定目標取得
// PUT    /goals/:id      - 目標更新
// DELETE /goals/:id      - 目標削除
// POST   /goals/:id/progress - 進捗更新

const router = require('express').Router();
const goalController = require('../controllers/goalController');

router.post('/', goalController.createSetGoal);

module.exports = router;