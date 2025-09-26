'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('insights', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      total_score: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        validate: {
          min: 0,
          max: 100
        }
      },
      cardio_score: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        validate: {
          min: 0,
          max: 100
        }
      },
      strength_score: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        validate: {
          min: 0,
          max: 100
        }
      },
      who_cardio_achieved: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      who_strength_achieved: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      metrics: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      calculation_version: {
        type: Sequelize.STRING,
        defaultValue: '1.0.0'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // ユニーク制約：同じユーザーの同じ日付のデータは1つだけ
    await queryInterface.addIndex('insights', {
      fields: ['user_id', 'date'],
      unique: true,
      name: 'insights_user_id_date_unique'
    });

    // 日付検索用インデックス
    await queryInterface.addIndex('insights', {
      fields: ['date'],
      name: 'insights_date_idx'
    });

    // WHO達成フラグ検索用インデックス
    await queryInterface.addIndex('insights', {
      fields: ['who_cardio_achieved', 'who_strength_achieved'],
      name: 'insights_who_achieved_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    // インデックスを先に削除
    await queryInterface.removeIndex('insights', 'insights_who_achieved_idx');
    await queryInterface.removeIndex('insights', 'insights_date_idx');
    await queryInterface.removeIndex('insights', 'insights_user_id_date_unique');

    // テーブルを削除
    await queryInterface.dropTable('insights');
  }
};