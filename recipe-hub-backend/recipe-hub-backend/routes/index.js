const router = require('express').Router();

router.use('/categories', require('./categoryRoutes'));
router.use('/recipes', require('./recipeRoutes'));
router.use('/ingredients', require('./ingredientRoutes'));
router.use('/shopping-list', require('./shoppingListRoutes'));

module.exports = router;
