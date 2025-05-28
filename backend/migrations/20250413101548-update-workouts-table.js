'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('workouts', 'exerciseType', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // 2. repsDetailフィールドの追加
    await queryInterface.addColumn('workouts', 'repsDetail', {
      type: Sequelize.JSON,
      allowNull: true,
    });

    // 3. intensityフィールドの追加
    await queryInterface.addColumn('workouts', 'intensity', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // 4. distanceフィールドの追加
    await queryInterface.addColumn('workouts', 'distance', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });

    // 5. durationフィールドの追加
    await queryInterface.addColumn('workouts', 'duration', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    // 6. setsフィールドをnullable（任意）に変更
    await queryInterface.changeColumn('workouts', 'sets', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    // 7. repsフィールドをnullable（任意）に変更
    await queryInterface.changeColumn('workouts', 'reps', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    // 8. 既存レコードのexerciseTypeを更新（強制的にstrengthとして設定）
    await queryInterface.sequelize.query(
      `UPDATE workouts SET "exerciseType" = 'strength' WHERE "exerciseType" IS NULL`
    );

    // 9. exerciseTypeのallowNull: falseに設定
    await queryInterface.changeColumn('workouts', 'exerciseType', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    // 追加した列を削除
    await queryInterface.removeColumn('workouts', 'repsDetail');
    await queryInterface.removeColumn('workouts', 'exerciseType');
    await queryInterface.removeColumn('workouts', 'intensity');
    await queryInterface.removeColumn('workouts', 'distance');
    await queryInterface.removeColumn('workouts', 'duration');

    // フィールドの設定を元に戻す
    await queryInterface.changeColumn('workouts', 'sets', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
    await queryInterface.changeColumn('workouts', 'reps', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  }
};
