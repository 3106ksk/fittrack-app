const db = require('../models');
const moment = require('moment');

async function testInsightModel() {
  try {
    console.log('🚀 Starting Insight model test...\n');

    // Step 1: ユーザーを取得または作成
    console.log('1️⃣ Getting or creating test user...');
    let user = await db.User.findOne({ where: { email: 'test@example.com' } });

    if (!user) {
      user = await db.User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedpassword123'
      });
      console.log('   ✅ Test user created');
    } else {
      console.log('   ✅ Using existing test user');
    }
    console.log(`   User ID: ${user.id}\n`);

    // Step 2: 今日のInsightを作成
    console.log('2️⃣ Creating today\'s Insight...');
    const today = moment().format('YYYY-MM-DD');

    // 既存のデータを削除（テスト用）
    await db.Insight.destroy({ where: { userId: user.id, date: today } });

    const todayInsight = await db.Insight.create({
      userId: user.id,
      date: today,
      totalScore: 85,
      cardioScore: 100,
      strengthScore: 50,
      whoCardioAchieved: true,
      whoStrengthAchieved: false,
      metrics: {
        cardio: {
          weeklyMinutes: 165,
          targetMinutes: 150,
          achievementRate: 110,
          byDay: {
            [moment().subtract(3, 'days').format('YYYY-MM-DD')]: 30,
            [moment().subtract(2, 'days').format('YYYY-MM-DD')]: 45,
            [moment().subtract(1, 'days').format('YYYY-MM-DD')]: 90
          }
        },
        strength: {
          weeklyDays: 1,
          targetDays: 2,
          achievementRate: 50,
          sessions: [
            {
              date: moment().subtract(2, 'days').format('YYYY-MM-DD'),
              duration: 45,
              muscleGroups: ["chest", "triceps", "shoulders"]
            }
          ]
        },
        consistency: {
          currentStreak: 5,
          longestStreak: 12,
          weeklyActiveDays: 4
        }
      },
      calculationVersion: '1.0.0'
    });

    console.log('   ✅ Insight created successfully');
    console.log(`   Total Score: ${todayInsight.totalScore}`);
    console.log(`   WHO Cardio: ${todayInsight.whoCardioAchieved ? '✓' : '✗'}`);
    console.log(`   WHO Strength: ${todayInsight.whoStrengthAchieved ? '✓' : '✗'}\n`);

    // Step 3: Upsert機能のテスト
    console.log('3️⃣ Testing Upsert (update existing record)...');
    const [upsertedInsight, created] = await db.Insight.upsert({
      userId: user.id,
      date: today,
      totalScore: 90,  // 更新
      cardioScore: 100,
      strengthScore: 100,  // 更新
      whoCardioAchieved: true,
      whoStrengthAchieved: true,  // 更新
      metrics: {
        ...todayInsight.metrics,
        strength: {
          ...todayInsight.metrics.strength,
          weeklyDays: 2,  // 更新
          achievementRate: 100  // 更新
        }
      }
    });

    console.log(`   ✅ Upsert ${created ? 'created new' : 'updated existing'} record`);
    console.log(`   New Total Score: ${upsertedInsight.totalScore}`);
    console.log(`   WHO Strength now: ${upsertedInsight.whoStrengthAchieved ? '✓' : '✗'}\n`);

    // Step 4: 関連データの取得テスト
    console.log('4️⃣ Testing associations (User -> Insights)...');
    const userWithInsights = await db.User.findOne({
      where: { id: user.id },
      include: [{
        model: db.Insight,
        as: 'insights',
        order: [['date', 'DESC']],
        limit: 7  // 最新7日分
      }]
    });

    console.log(`   ✅ Found user with ${userWithInsights.insights.length} insights`);
    userWithInsights.insights.forEach(insight => {
      console.log(`   - ${insight.date}: Score ${insight.totalScore}`);
    });
    console.log();

    // Step 5: クエリ性能テスト
    console.log('5️⃣ Testing query performance with indexes...');

    // ユニークインデックスのテスト
    console.time('   Unique index query');
    const uniqueResult = await db.Insight.findOne({
      where: { userId: user.id, date: today }
    });
    console.timeEnd('   Unique index query');

    // 日付インデックスのテスト
    console.time('   Date index query');
    const dateResults = await db.Insight.findAll({
      where: { date: today }
    });
    console.timeEnd('   Date index query');
    console.log(`   Found ${dateResults.length} insights for today`);

    // WHO達成インデックスのテスト
    console.time('   WHO achievement index query');
    const achievers = await db.Insight.findAll({
      where: {
        whoCardioAchieved: true,
        whoStrengthAchieved: true,
        date: today
      }
    });
    console.timeEnd('   WHO achievement index query');
    console.log(`   Found ${achievers.length} users who achieved both WHO standards today\n`);

    // Step 6: JSONB検索テスト
    console.log('6️⃣ Testing JSONB queries...');
    const highStreakUsers = await db.sequelize.query(`
      SELECT user_id, date, metrics->'consistency'->>'currentStreak' as streak
      FROM insights
      WHERE (metrics->'consistency'->>'currentStreak')::int >= 5
      AND date = :date
    `, {
      replacements: { date: today },
      type: db.sequelize.QueryTypes.SELECT
    });

    console.log(`   ✅ Found ${highStreakUsers.length} users with 5+ day streaks`);
    highStreakUsers.forEach(user => {
      console.log(`   - User ${user.user_id}: ${user.streak} day streak`);
    });

    console.log('\n✅ All tests passed successfully!');

  } catch (error) {
    console.error('\n❌ Error during testing:', error);
    console.error('Error details:', error.message);
    if (error.errors) {
      error.errors.forEach(e => {
        console.error(`   - ${e.path}: ${e.message}`);
      });
    }
  } finally {
    await db.sequelize.close();
    console.log('\n👋 Database connection closed');
  }
}

// スクリプト実行
testInsightModel();