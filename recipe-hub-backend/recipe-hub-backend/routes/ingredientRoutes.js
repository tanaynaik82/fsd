const router = require('express').Router();
const c = require('../controllers/ingredientController');
const wrap = require('../utils/asyncHandler');

router.get('/', wrap(c.getAll));
router.get('/:id', wrap(c.getOne));
router.post('/', wrap(c.create));
router.put('/:id', wrap(c.update));
router.delete('/:id', wrap(c.remove));

module.exports = router;
