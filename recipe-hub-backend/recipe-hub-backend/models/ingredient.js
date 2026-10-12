module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    'Ingredient',
    {
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: { msg: 'Ingredient name must be unique' },
        validate: { notEmpty: { msg: 'Ingredient name cannot be empty' } },
      },
      defaultUnit: { type: DataTypes.STRING(20), defaultValue: 'g' },
    },
    { tableName: 'Ingredients' }
  );
