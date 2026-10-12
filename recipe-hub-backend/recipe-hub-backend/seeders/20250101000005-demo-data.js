'use strict';

const categories = ['Breakfast', 'Main Course', 'Desserts', 'Salads', 'Soups'];

const ingredients = [
  ['Egg', 'pcs'], ['Flour', 'g'], ['Milk', 'ml'], ['Butter', 'g'], ['Sugar', 'g'],
  ['Tomato', 'pcs'], ['Pasta', 'g'], ['Olive Oil', 'ml'], ['Garlic', 'cloves'], ['Onion', 'pcs'],
  ['Basil', 'g'], ['Chicken Breast', 'g'], ['Rice', 'g'], ['Cucumber', 'pcs'], ['Lemon', 'pcs'],
  ['Salt', 'g'], ['Black Pepper', 'g'], ['Cocoa Powder', 'g'], ['Paneer', 'g'], ['Cream', 'ml'],
];

// [title, instructions, prepTime, servings, difficulty, categoryName, [[ingredient, qty, unit], ...]]
const recipes = [
  ['Fluffy Pancakes', 'Whisk dry and wet ingredients separately, combine, and cook on a buttered pan until golden.', 20, 2, 'easy', 'Breakfast',
    [['Flour', 200, 'g'], ['Milk', 300, 'ml'], ['Egg', 2, 'pcs'], ['Sugar', 30, 'g'], ['Butter', 20, 'g']]],
  ['Veggie Omelette', 'Saute onion and tomato, pour beaten eggs over, fold when set.', 10, 1, 'easy', 'Breakfast',
    [['Egg', 3, 'pcs'], ['Onion', 1, 'pcs'], ['Tomato', 1, 'pcs'], ['Salt', 2, 'g'], ['Butter', 10, 'g']]],
  ['Spaghetti Pomodoro', 'Cook pasta. Simmer garlic and tomatoes in olive oil, toss with pasta and basil.', 30, 4, 'easy', 'Main Course',
    [['Pasta', 400, 'g'], ['Tomato', 6, 'pcs'], ['Garlic', 3, 'cloves'], ['Olive Oil', 30, 'ml'], ['Basil', 10, 'g'], ['Salt', 5, 'g']]],
  ['Garlic Chicken Rice', 'Brown seasoned chicken, add onion and garlic, stir in rice and water, cover and cook.', 45, 4, 'medium', 'Main Course',
    [['Chicken Breast', 500, 'g'], ['Rice', 300, 'g'], ['Garlic', 5, 'cloves'], ['Onion', 2, 'pcs'], ['Olive Oil', 20, 'ml'], ['Salt', 6, 'g'], ['Black Pepper', 3, 'g']]],
  ['Paneer Butter Masala', 'Blend a tomato-onion base, simmer with butter and cream, add paneer cubes.', 40, 4, 'medium', 'Main Course',
    [['Paneer', 250, 'g'], ['Tomato', 4, 'pcs'], ['Butter', 40, 'g'], ['Cream', 100, 'ml'], ['Onion', 2, 'pcs'], ['Garlic', 4, 'cloves'], ['Salt', 5, 'g']]],
  ['Chocolate Brownies', 'Melt butter with sugar and cocoa, fold in eggs and flour, bake at 180C for 25 minutes.', 50, 8, 'hard', 'Desserts',
    [['Flour', 150, 'g'], ['Cocoa Powder', 60, 'g'], ['Sugar', 200, 'g'], ['Butter', 120, 'g'], ['Egg', 3, 'pcs']]],
  ['Cucumber Tomato Salad', 'Chop vegetables, dress with lemon juice, olive oil and salt.', 10, 2, 'easy', 'Salads',
    [['Cucumber', 2, 'pcs'], ['Tomato', 2, 'pcs'], ['Onion', 1, 'pcs'], ['Lemon', 1, 'pcs'], ['Olive Oil', 15, 'ml'], ['Salt', 2, 'g']]],
  ['Creamy Tomato Soup', 'Saute onion and garlic, add tomatoes and simmer, blend, finish with cream.', 35, 4, 'easy', 'Soups',
    [['Tomato', 8, 'pcs'], ['Onion', 1, 'pcs'], ['Garlic', 2, 'cloves'], ['Butter', 20, 'g'], ['Cream', 50, 'ml'], ['Salt', 4, 'g'], ['Black Pepper', 1, 'g']]],
];

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const catId = (n) => categories.indexOf(n) + 1;
    const ingId = (n) => ingredients.findIndex((i) => i[0] === n) + 1;

    await queryInterface.bulkInsert(
      'Categories',
      categories.map((name, i) => ({ id: i + 1, name, description: `${name} recipes`, createdAt: now, updatedAt: now }))
    );
    await queryInterface.bulkInsert(
      'Ingredients',
      ingredients.map(([name, defaultUnit], i) => ({ id: i + 1, name, defaultUnit, createdAt: now, updatedAt: now }))
    );
    await queryInterface.bulkInsert(
      'Recipes',
      recipes.map(([title, instructions, prepTime, servings, difficulty, cat], i) => ({
        id: i + 1, title, instructions, prepTime, servings, difficulty, categoryId: catId(cat), createdAt: now, updatedAt: now,
      }))
    );
    const junction = [];
    recipes.forEach((r, i) =>
      r[6].forEach(([name, quantity, unit]) =>
        junction.push({ recipeId: i + 1, ingredientId: ingId(name), quantity, unit, createdAt: now, updatedAt: now })
      )
    );
    await queryInterface.bulkInsert('RecipeIngredients', junction);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('RecipeIngredients', null, {});
    await queryInterface.bulkDelete('Recipes', null, {});
    await queryInterface.bulkDelete('Ingredients', null, {});
    await queryInterface.bulkDelete('Categories', null, {});
  },
};
