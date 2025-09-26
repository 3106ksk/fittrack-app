'use strict';

module.exports = (sequelize, DataTypes) => {
  const Insight = sequelize.define('Insight', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id',
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
    totalScore: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'total_score',
      validate: {
        min: 0,
        max: 100,
      },
    },
    cardioScore: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'cardio_score',
      validate: {
        min: 0,
        max: 100,
      },
    },
    strengthScore: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'strength_score',
      validate: {
        min: 0,
        max: 100,
      },
    },
    whoCardioAchieved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'who_cardio_achieved',
    },
    whoStrengthAchieved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'who_strength_achieved',
    },
    metrics: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    calculationVersion: {
      type: DataTypes.STRING,
      defaultValue: '1.0.0',
      field: 'calculation_version',
    },
  }, {
    tableName: 'insights',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'date'],
      },
      {
        fields: ['date'],
      },
      {
        fields: ['who_cardio_achieved', 'who_strength_achieved'],
      },
    ],
  });

  Insight.associate = (models) => {
    Insight.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  };

  return Insight;
};