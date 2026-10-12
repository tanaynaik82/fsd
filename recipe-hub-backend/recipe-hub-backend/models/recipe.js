module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    'Recipe',
    {
      title: {
        type: DataTypes.STRING(150),
        allowNull: false,
        validate: { len: { args: [3, 150], msg: 'Title must be 3-150 characters' } },
      },
      instructions: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: { notEmpty: { msg: 'Instructions cannot be empty' } },
      },
      prepTime: {
        type: DataTypes.INTEGER,
        validate: {
          min: { args: [1], msg: 'prepTime must be at least 1 minute' },
          max: { args: [1440], msg: 'prepTime cannot exceed 1440 minutes' },
        },
      },
      servings: {
        type: DataTypes.INTEGER,
        defaultValue: 2,
        validate: { min: { args: [1], msg: 'servings must be at least 1' } },
      },
      difficulty: {
        type: DataTypes.ENUM('easy', 'medium', 'hard'),
        defaultValue: 'easy',
        validate: { isIn: { args: [['easy', 'medium', 'hard']], msg: 'difficulty must be easy, medium or hard' } },
      },
    },
    { tableName: 'Recipes' }
  );
