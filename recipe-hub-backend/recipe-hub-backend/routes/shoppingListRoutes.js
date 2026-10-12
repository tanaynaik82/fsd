const router = require('express').Router();
const c = require('../controllers/shoppingListController');
const wrap = require('../utils/asyncHandler');

router.post('/', wrap(c.build));

module.exports = router;
