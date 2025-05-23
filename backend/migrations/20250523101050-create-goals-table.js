'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('goals', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      exercise: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'トレーニング種目名（WorkoutFormのexerciseと同じ）'
      },
      exerciseType: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: '運動タイプ（strength または cardio）'
      },
      targetAmount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: '達成したい目標値（回数・距離・時間など）'
      },
      progressAmount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '現在までの進捗量'
      },
      metricUnit: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: '測定単位（reps:回数, distance:距離, duration:時間）'
      },
      status: {
        type: Sequelize.ENUM('in_progress', 'completed', 'paused'),
        allowNull: false,
        defaultValue: 'in_progress',
        comment: '目標の状態（進行中/完了/一時停止）'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      }
    }, {
      comment: 'ユーザーのトレーニング目標を管理するテーブル'
    });

    // パフォーマンス向上のためのインデックス追加
    await queryInterface.addIndex('goals', ['userID'], {
      name: 'goals_user_id_index'
    });

    await queryInterface.addIndex('goals', ['userID', 'exercise'], {
      name: 'goals_user_exercise_index'
    });

    await queryInterface.addIndex('goals', ['status'], {
      name: 'goals_status_index'
    });

    await queryInterface.addIndex('goals', ['exerciseType'], {
      name: 'goals_exercise_type_index'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // インデックスの削除
    await queryInterface.removeIndex('goals', 'goals_user_id_index');
    await queryInterface.removeIndex('goals', 'goals_user_exercise_index');
    await queryInterface.removeIndex('goals', 'goals_status_index');
    await queryInterface.removeIndex('goals', 'goals_exercise_type_index');

    // テーブルの削除
    await queryInterface.dropTable('goals');
  }
}; 