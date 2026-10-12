const router = require('express').Router();
const c = require('../controllers/recipeController');
const wrap = require('../utils/asyncHandler');

router.get('/', wrap(c.getAll));
router.get('/:id', wrap(c.getOne));
router.post('/', wrap(c.create));
router.put('/:id', wrap(c.update));
router.delete('/:id', wrap(c.remove));

router.post('/:id/ingredients', wrap(c.upsertIngredient));
router.delete('/:id/ingredients/:ingredientId', wrap(c.removeIngredient));

module.exports = router;
