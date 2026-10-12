const { QueryTypes } = require('sequelize');
const { sequelize } = require('../models');
const HttpError = require('../utils/httpError');

// POST /api/shopping-list  { "recipeIds": [1, 3, 5] }
// Raw SQL: merges the ingredients of several recipes into one consolidated list.
exports.build = async (req, res) => {
  const { recipeIds } = req.body;
  if (!Array.isArray(recipeIds) || recipeIds.length === 0) {
    throw new HttpError(400, 'recipeIds must be a non-empty array');
  }
  const ids = recipeIds.map(Number);
  if (ids.some((n) => !Number.isInteger(n) || n < 1)) {
    throw new HttpError(400, 'recipeIds must contain positive integers only');
  }

  const rows = await sequelize.query(
    `SELECT i.id AS ingredientId,
            i.name,
            ri.unit,
            SUM(ri.quantity)            AS totalQuantity,
            COUNT(DISTINCT ri.recipeId) AS usedInRecipes
       FROM RecipeIngredients ri
       JOIN Ingredients i ON i.id = ri.ingredientId
      WHERE ri.recipeId IN (:ids)
      GROUP BY i.id, i.name, ri.unit
      ORDER BY i.name, ri.unit`,
    { replacements: { ids }, type: QueryTypes.SELECT }
  );

  if (rows.length === 0) throw new HttpError(404, 'No ingredients found for the given recipeIds');

  res.json({
    recipeIds: ids,
    itemCount: rows.length,
    items: rows.map((r) => ({
      ingredientId: r.ingredientId,
      name: r.name,
      unit: r.unit,
      totalQuantity: Number(r.totalQuantity),
      usedInRecipes: Number(r.usedInRecipes),
    })),
  });
};
