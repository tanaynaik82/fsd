// Junction table for the Recipe <-> Ingredient M:N association
module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    'RecipeIngredient',
    {
      quantity: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: false,
        validate: { min: { args: [0.01], msg: 'quantity must be greater than 0' } },
      },
      unit: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: { notEmpty: { msg: 'unit cannot be empty' } },
      },
    },
    { tableName: 'RecipeIngredients' }
  );
