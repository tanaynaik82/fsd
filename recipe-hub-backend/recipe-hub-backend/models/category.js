module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    'Category',
    {
      name: {
        type: DataTypes.STRING(80),
        allowNull: false,
        unique: { msg: 'Category name must be unique' },
        validate: { notEmpty: { msg: 'Category name cannot be empty' } },
      },
      description: { type: DataTypes.TEXT },
    },
    { tableName: 'Categories' }
  );
