'use strict';

module.exports = (sequelize, DataTypes) => {
  const Workout = sequelize.define('Workout', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userID: { // Note: Capitalized userID matches your migration
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    exercise: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sets: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    reps: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    // createdAt and updatedAt are handled automatically by Sequelize if timestamps: true is set
  }, {
    tableName: 'workouts', // Matches your migration's table name
    timestamps: true,      // Enables automatic createdAt and updatedAt
    // underscored: true,  // If you want Sequelize to automatically convert camelCase to snake_case
  });

  Workout.associate = (models) => {
    Workout.belongsTo(models.User, { foreignKey: 'userID' }); // Correct foreign key
  };

  return Workout;
};