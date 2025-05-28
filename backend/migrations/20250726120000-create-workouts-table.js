'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('workouts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
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
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      exercise: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      exerciseType: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      sets: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      reps: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      repsDetail: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      distance: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      duration: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      intensity: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('workouts');
  },
};
