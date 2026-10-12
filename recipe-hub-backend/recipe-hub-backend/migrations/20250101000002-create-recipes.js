'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Recipes', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      title: { type: Sequelize.STRING(150), allowNull: false },
      instructions: { type: Sequelize.TEXT, allowNull: false },
      prepTime: { type: Sequelize.INTEGER },
      servings: { type: Sequelize.INTEGER, defaultValue: 2 },
      difficulty: { type: Sequelize.ENUM('easy', 'medium', 'hard'), defaultValue: 'easy' },
      categoryId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Categories', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('Recipes');
  },
};
