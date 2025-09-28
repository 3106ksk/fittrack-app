'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const twoDaysAgo = new Date(Date.now() - 172800000).toISOString().split('T')[0];
    const threeDaysAgo = new Date(Date.now() - 259200000).toISOString().split('T')[0];
    const fourDaysAgo = new Date(Date.now() - 345600000).toISOString().split('T')[0];
    const fiveDaysAgo = new Date(Date.now() - 432000000).toISOString().split('T')[0];
    const sixDaysAgo = new Date(Date.now() - 518400000).toISOString().split('T')[0];

    return queryInterface.bulkInsert('insights', [
      // User 1 - demo_user (WHO基準達成)
      {
        user_id: 1,
        date: today,
        total_score: 85,
        cardio_score: 90,
        strength_score: 80,
        who_cardio_achieved: true,
        who_strength_achieved: true,
        metrics: JSON.stringify({
          cardio: {
            weeklyMinutes: 155,
            targetMinutes: 150,
            achievementRate: 103,
            workoutCount: 5,
            byDay: {
              [today]: 30,
              [yesterday]: 40,
              [threeDaysAgo]: 30,
              [fourDaysAgo]: 30,
              [fiveDaysAgo]: 25
            }
          },
          strength: {
            weeklyDays: 2,
            targetDays: 2,
            achievementRate: 100,
            workoutCount: 2,
            totalSets: 7,
            totalReps: 70,
            byDay: {
              [today]: { sets: 3, reps: 30 },
              [twoDaysAgo]: { sets: 4, reps: 40 }
            }
          }
        }),
        calculation_version: '1.0.0',
        createdAt: now,
        updatedAt: now
      },
      {
        user_id: 1,
        date: yesterday,
        total_score: 75,
        cardio_score: 80,
        strength_score: 70,
        who_cardio_achieved: true,
        who_strength_achieved: false,
        metrics: JSON.stringify({
          cardio: {
            weeklyMinutes: 125,
            targetMinutes: 150,
            achievementRate: 83,
            workoutCount: 4,
            byDay: {
              [yesterday]: 40,
              [threeDaysAgo]: 30,
              [fourDaysAgo]: 30,
              [fiveDaysAgo]: 25
            }
          },
          strength: {
            weeklyDays: 1,
            targetDays: 2,
            achievementRate: 50,
            workoutCount: 1,
            totalSets: 4,
            totalReps: 40,
            byDay: {
              [twoDaysAgo]: { sets: 4, reps: 40 }
            }
          }
        }),
        calculation_version: '1.0.0',
        createdAt: now,
        updatedAt: now
      },

      // User 2 - active_user (高スコア)
      {
        user_id: 2,
        date: today,
        total_score: 95,
        cardio_score: 95,
        strength_score: 95,
        who_cardio_achieved: true,
        who_strength_achieved: true,
        metrics: JSON.stringify({
          cardio: {
            weeklyMinutes: 195,
            targetMinutes: 150,
            achievementRate: 130,
            workoutCount: 3,
            byDay: {
              [today]: 45,
              [twoDaysAgo]: 50,
              [fourDaysAgo]: 100
            }
          },
          strength: {
            weeklyDays: 4,
            targetDays: 2,
            achievementRate: 200,
            workoutCount: 4,
            totalSets: 15,
            totalReps: 89,
            byDay: {
              [today]: { sets: 5, reps: 25 },
              [yesterday]: { sets: 4, reps: 32 },
              [threeDaysAgo]: { sets: 3, reps: 24 },
              [fiveDaysAgo]: { sets: 3, reps: 8 }
            }
          }
        }),
        calculation_version: '1.0.0',
        createdAt: now,
        updatedAt: now
      },
      {
        user_id: 2,
        date: yesterday,
        total_score: 90,
        cardio_score: 85,
        strength_score: 95,
        who_cardio_achieved: true,
        who_strength_achieved: true,
        metrics: JSON.stringify({
          cardio: {
            weeklyMinutes: 150,
            targetMinutes: 150,
            achievementRate: 100,
            workoutCount: 2,
            byDay: {
              [twoDaysAgo]: 50,
              [fourDaysAgo]: 100
            }
          },
          strength: {
            weeklyDays: 3,
            targetDays: 2,
            achievementRate: 150,
            workoutCount: 3,
            totalSets: 10,
            totalReps: 64,
            byDay: {
              [yesterday]: { sets: 4, reps: 32 },
              [threeDaysAgo]: { sets: 3, reps: 24 },
              [fiveDaysAgo]: { sets: 3, reps: 8 }
            }
          }
        }),
        calculation_version: '1.0.0',
        createdAt: now,
        updatedAt: now
      },

      // User 3 - beginner_user (低スコア、WHO基準未達成)
      {
        user_id: 3,
        date: today,
        total_score: 25,
        cardio_score: 30,
        strength_score: 20,
        who_cardio_achieved: false,
        who_strength_achieved: false,
        metrics: JSON.stringify({
          cardio: {
            weeklyMinutes: 35,
            targetMinutes: 150,
            achievementRate: 23,
            workoutCount: 2,
            byDay: {
              [today]: 20,
              [threeDaysAgo]: 15
            }
          },
          strength: {
            weeklyDays: 1,
            targetDays: 2,
            achievementRate: 50,
            workoutCount: 1,
            totalSets: 2,
            totalReps: 10,
            byDay: {
              [fiveDaysAgo]: { sets: 2, reps: 10 }
            }
          }
        }),
        calculation_version: '1.0.0',
        createdAt: now,
        updatedAt: now
      },
      {
        user_id: 3,
        date: threeDaysAgo,
        total_score: 15,
        cardio_score: 20,
        strength_score: 10,
        who_cardio_achieved: false,
        who_strength_achieved: false,
        metrics: JSON.stringify({
          cardio: {
            weeklyMinutes: 15,
            targetMinutes: 150,
            achievementRate: 10,
            workoutCount: 1,
            byDay: {
              [threeDaysAgo]: 15
            }
          },
          strength: {
            weeklyDays: 0,
            targetDays: 2,
            achievementRate: 0,
            workoutCount: 0,
            totalSets: 0,
            totalReps: 0,
            byDay: {}
          }
        }),
        calculation_version: '1.0.0',
        createdAt: now,
        updatedAt: now
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('insights', null, {});
  }
};