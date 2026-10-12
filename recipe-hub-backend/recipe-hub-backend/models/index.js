const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = require('./category')(sequelize, DataTypes);
const Recipe = require('./recipe')(sequelize, DataTypes);
const Ingredient = require('./ingredient')(sequelize, DataTypes);
const RecipeIngredient = require('./recipeIngredient')(sequelize, DataTypes);

// 1:M  Category -> Recipes
Category.hasMany(Recipe, {
  foreignKey: { name: 'categoryId', allowNull: false },
  as: 'recipes',
  onDelete: 'RESTRICT',
});
Recipe.belongsTo(Category, {
  foreignKey: { name: 'categoryId', allowNull: false },
  as: 'category',
});

// M:N  Recipes <-> Ingredients through RecipeIngredients
Recipe.belongsToMany(Ingredient, {
  through: RecipeIngredient,
  foreignKey: 'recipeId',
  otherKey: 'ingredientId',
  as: 'ingredients',
});
Ingredient.belongsToMany(Recipe, {
  through: RecipeIngredient,
  foreignKey: 'ingredientId',
  otherKey: 'recipeId',
  as: 'recipes',
});

module.exports = { sequelize, Category, Recipe, Ingredient, RecipeIngredient };
