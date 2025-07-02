const router = require("express").Router();
const { User, Workout } = require("../models");
const authMiddleware = require("../middleware/checkJWT");
const { Op } = require("sequelize");

const VALID_INTENSITIES = ["低", "中", "高"];

router.post('/', authMiddleware, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "認証エラー - リクエストにユーザー情報がありません" });
  }
  const userId = req.user.id;
  const {
    exercise,
    exerciseType,
    intensity
  } = req.body;


  let setNumber = null;
  if (req.body.setNumber !== undefined) {
    setNumber = parseInt(req.body.setNumber, 10);
  }

  let repsNumber = [];
  if (req.body.repsNumber !== undefined && Array.isArray(req.body.repsNumber)) {
    repsNumber = req.body.repsNumber;
  }

  let duration = null;
  if (req.body.duration !== undefined) {
    duration = parseFloat(req.body.duration);
  }

  let distance = null;
  if (req.body.distance !== undefined) {
    distance = parseFloat(req.body.distance);
  }

  if (!exercise) {
    return res.status(400).json({ error: "エクササイズ名は必須です" });
  }

  if (!exerciseType) {
    return res.status(400).json({ error: "エクササイズタイプは必須です" });
  }

  if (!intensity) {
    return res.status(400).json({ error: "強度は必須です" });
  }

  if (!VALID_INTENSITIES.includes(intensity)) {
    return res.status(400).json({
      error: "強度の値が無効です",
      validValues: VALID_INTENSITIES.join('、')
    });
  }


  if (exerciseType === 'cardio') {
    if (!duration && duration !== 0) {
      return res.status(400).json({ error: "時間は必須です" });
    }
    if (isNaN(duration)) {
      return res.status(400).json({ error: "時間は数値で入力してください" });
    }
    if (duration <= 0) {
      return res.status(400).json({ error: "時間は0より大きい値を入力してください" });
    }

    if (!distance && distance !== 0) {
      return res.status(400).json({ error: "距離は必須です" });
    }
    if (isNaN(distance)) {
      return res.status(400).json({ error: "距離は数値で入力してください" });
    }
    if (distance <= 0) {
      return res.status(400).json({ error: "距離は0より大きい値を入力してください" });
    }
  }

  if (exerciseType === 'strength') {
    if (typeof setNumber !== 'number' || isNaN(setNumber)) {
      return res.status(400).json({ error: "セット数は数値で入力してください" });
    }

    if (setNumber < 1) {
      return res.status(400).json({ error: "セット数は1以上を入力してください" });
    }

    if (!Array.isArray(repsNumber)) {
      return res.status(400).json({ error: "レップ数情報は配列形式で入力してください" });
    }

    if (repsNumber.length === 0) {
      return res.status(400).json({ error: "レップ数情報は必須です" });
    }

    if (setNumber !== repsNumber.length) {
      return res.status(400).json({
        error: `セット数(${setNumber})とレップ数データの数(${repsNumber.length})が一致しません`
      });
    }

    for (let i = 0; i < repsNumber.length; i++) {
      const item = repsNumber[i];
      if (!item || typeof item !== 'object' || !('reps' in item)) {
        return res.status(400).json({
          error: `セット ${i + 1} のレップ数データが不正です`
        });
      }
      const reps = parseInt(item.reps, 10);
      if (isNaN(reps) || reps < 1) {
        return res.status(400).json({
          error: `セット ${i + 1} のレップ数は1以上の整数を入力してください`
        });
      }
    }
  }

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "ユーザーが見つかりません" });
    }

    const repsDetailData = repsNumber.map((item, index) => {
      return {
        setNumber: index + 1,
        reps: parseInt(item.reps, 10)
      };
    });

    const totalReps = repsNumber.reduce((sum, item) => {
      return sum + parseInt(item.reps, 10);
    }, 0);

    const workoutData = await Workout.create({
      userID: userId,
      date: new Date().toISOString().split('T')[0],
      exercise,
      exerciseType,
      ...(exerciseType === 'cardio' ? {
        distance,
        duration,
      } : {}),
      ...(exerciseType === 'strength' ? {
        sets: setNumber,
        reps: totalReps,
        repsDetail: repsDetailData
      } : {}),
      intensity
    });


    res.status(201).json({
      message: "ワークアウトが正常に作成されました",
      workout: workoutData,
    });

  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        error: "入力データが無効です",
        details: error.errors.map(err => err.message)
      });
    }
    if (error.name === 'SequelizeDatabaseError') {
      return res.status(400).json({
        error: "データベースエラーが発生しました",
        message: error.message
      });
    }
    if (error.message && error.message.includes('レップ数が無効')) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({
      error: "サーバーエラーが発生しました",
      message: error.message
    });
  }
});

router.get('/monthly', authMiddleware, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "認証エラー - リクエストにユーザー情報がありません" });
  }
  const userId = req.user.id;
  let { year, month } = req.query;
  year = parseInt(year, 10) || new Date().getFullYear();
  month = parseInt(month, 10) || new Date().getMonth() + 1;

  if (month < 1 || month > 12) {
    return res.status(400).json({ error: "月は1から12の範囲で指定してください" });
  }
  const startDate = new Date(year, month - 1, 1)
    .toISOString().split('T')[0];

  const endDate = new Date(year, month, 0)
    .toISOString().split('T')[0];

  try {
    const workouts = await Workout.findAll({
      where: {
        userID: userId,
        date: {
          [Op.between]: [startDate, endDate]
        }
      },
      order: [['date', 'DESC']]
    });

    res.json(workouts);
  } catch (error) {
    res.status(500).json({ error: "データ取得中にエラーが発生しました" });
  }
});

router.get('/:workoutId', authMiddleware, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "認証エラー - リクエストにユーザー情報がありません" });
  }
  const userId = req.user.id;
  const { workoutId } = req.params;

  try {
    const workout = await Workout.findOne({
      where: {
        id: workoutId,
        userID: userId
      }
    });

    if (!workout) {
      return res.status(404).json({ error: "ワークアウトが見つかりません" });
    }
    res.json(workout);
  } catch (error) {
    res.status(500).json({ error: "データ取得中にエラーが発生しました" });
  }
});

const formatWorkoutData = (workout) => {
  const baseData = {
    id: workout.id,
    date: workout.date,
    exercise: workout.exercise,
    exerciseType: workout.exerciseType,
    intensity: workout.intensity
  };
  if (workout.exerciseType === 'strength') {
    return {
      ...baseData,
      sets: workout.sets,
      reps: workout.reps,
      repsDetail: workout.repsDetail || [],
      isCardio: false
    };
  } else {
    return {
      ...baseData,
      distance: workout.distance,
      duration: workout.duration,
      isCardio: true
    }
  }

}

router.get('/', authMiddleware, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "認証エラー - リクエストにユーザー情報がありません" });
  }
  const userId = req.user.id;

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "ユーザーが見つかりません" });
    }
    const workouts = await user.getWorkouts();
    const formattedWorkouts = workouts.map(workout => formatWorkoutData(workout));
    res.json(formattedWorkouts);
  } catch (error) {
    res.status(500).json({ error: "データ取得中にエラーが発生しました" });
  }
});

module.exports = router;