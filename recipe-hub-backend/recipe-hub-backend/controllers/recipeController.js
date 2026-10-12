const { Op } = require('sequelize');
const { sequelize, Recipe, Category, Ingredient, RecipeIngredient } = require('../models');
const HttpError = require('../utils/httpError');

const fullInclude = [
  { model: Category, as: 'category', attributes: ['id', 'name'] },
  {
    model: Ingredient,
    as: 'ingredients',
    attributes: ['id', 'name'],
    through: { attributes: ['quantity', 'unit'] },
  },
];

const getFull = (id, options = {}) => Recipe.findByPk(id, { include: fullInclude, ...options });

const findOr404 = async (id, options = {}) => {
  const recipe = await Recipe.findByPk(id, options);
  if (!recipe) throw new HttpError(404, `Recipe ${id} not found`);
  return recipe;
};

const toPositiveInt = (value, name) => {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1) throw new HttpError(400, `${name} must be a positive integer`);
  return n;
};

// Validates [{ ingredientId, quantity, unit? }] and returns junction rows
async function buildJunctionRows(recipeId, list, transaction) {
  if (!Array.isArray(list)) throw new HttpError(400, 'ingredients must be an array');
  const ids = list.map((i) => Number(i && i.ingredientId));
  if (ids.some((id) => !Number.isInteger(id))) throw new HttpError(400, 'Every ingredient needs an integer ingredientId');
  if (new Set(ids).size !== ids.length) throw new HttpError(400, 'Duplicate ingredientId in ingredients list');

  const found = await Ingredient.findAll({ where: { id: ids }, transaction });
  if (found.length !== ids.length) throw new HttpError(404, 'One or more ingredientIds do not exist');
  const byId = new Map(found.map((i) => [i.id, i]));

  return list.map((i) => ({
    recipeId,
    ingredientId: Number(i.ingredientId),
    quantity: i.quantity,
    unit: i.unit || byId.get(Number(i.ingredientId)).defaultUnit,
  }));
}

// GET /api/recipes?category=&maxTime=&difficulty=&search=&ingredient=&sort=&order=&page=&limit=
exports.getAll = async (req, res) => {
  const { category, maxTime, difficulty, search, ingredient } = req.query;
  const where = {};

  if (category) where.categoryId = toPositiveInt(category, 'category');
  if (maxTime) where.prepTime = { [Op.lte]: toPositiveInt(maxTime, 'maxTime') };
  if (difficulty) {
    if (!['easy', 'medium', 'hard'].includes(difficulty)) throw new HttpError(400, 'difficulty must be easy, medium or hard');
    where.difficulty = difficulty;
  }
  if (search) {
    where[Op.or] = [
      { title: { [Op.like]: `%${search}%` } },
      { instructions: { [Op.like]: `%${search}%` } },
    ];
  }
  if (ingredient) {
    const matches = await Ingredient.findAll({
      where: { name: { [Op.like]: `%${ingredient}%` } },
      attributes: ['id'],
    });
    const links = await RecipeIngredient.findAll({
      where: { ingredientId: { [Op.in]: matches.map((m) => m.id) } },
      attributes: ['recipeId'],
    });
    where.id = { [Op.in]: [...new Set(links.map((l) => l.recipeId))] };
  }

  const sortable = ['title', 'prepTime', 'servings', 'createdAt'];
  const sort = sortable.includes(req.query.sort) ? req.query.sort : 'title';
  const order = String(req.query.order).toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
  const page = req.query.page ? toPositiveInt(req.query.page, 'page') : 1;
  const limit = req.query.limit ? Math.min(toPositiveInt(req.query.limit, 'limit'), 100) : 20;

  const { rows, count } = await Recipe.findAndCountAll({
    where,
    include: fullInclude,
    order: [[sort, order]],
    limit,
    offset: (page - 1) * limit,
    distinct: true,
  });

  res.json({ total: count, page, limit, data: rows });
};

exports.getOne = async (req, res) => {
  const recipe = await getFull(req.params.id);
  if (!recipe) throw new HttpError(404, `Recipe ${req.params.id} not found`);
  res.json(recipe);
};

exports.create = async (req, res) => {
  const { title, instructions, prepTime, servings, difficulty, categoryId, ingredients = [] } = req.body;

  if (!categoryId || !(await Category.findByPk(categoryId))) {
    throw new HttpError(404, `Category ${categoryId} not found`);
  }

  const id = await sequelize.transaction(async (transaction) => {
    const recipe = await Recipe.create(
      { title, instructions, prepTime, servings, difficulty, categoryId },
      { transaction }
    );
    if (ingredients.length || !Array.isArray(ingredients)) {
      const rows = await buildJunctionRows(recipe.id, ingredients, transaction);
      await RecipeIngredient.bulkCreate(rows, { validate: true, transaction });
    }
    return recipe.id;
  });

  res.status(201).json(await getFull(id));
};

exports.update = async (req, res) => {
  const recipe = await findOr404(req.params.id);
  const { title, instructions, prepTime, servings, difficulty, categoryId, ingredients } = req.body;

  if (categoryId !== undefined && !(await Category.findByPk(categoryId))) {
    throw new HttpError(404, `Category ${categoryId} not found`);
  }

  await sequelize.transaction(async (transaction) => {
    await recipe.update({ title, instructions, prepTime, servings, difficulty, categoryId }, { transaction });
    // If an ingredients array is sent, it REPLACES the existing list
    if (ingredients !== undefined) {
      const rows = await buildJunctionRows(recipe.id, ingredients, transaction);
      await RecipeIngredient.destroy({ where: { recipeId: recipe.id }, transaction });
      await RecipeIngredient.bulkCreate(rows, { validate: true, transaction });
    }
  });

  res.json(await getFull(recipe.id));
};

exports.remove = async (req, res) => {
  const recipe = await findOr404(req.params.id);
  await sequelize.transaction(async (transaction) => {
    await RecipeIngredient.destroy({ where: { recipeId: recipe.id }, transaction });
    await recipe.destroy({ transaction });
  });
  res.status(204).send();
};

// POST /api/recipes/:id/ingredients  -> add an ingredient or update its quantity
exports.upsertIngredient = async (req, res) => {
  const recipe = await findOr404(req.params.id);
  const [row] = await buildJunctionRows(recipe.id, [req.body]);
  const existing = await RecipeIngredient.findOne({
    where: { recipeId: row.recipeId, ingredientId: row.ingredientId },
  });
  if (existing) {
    await existing.update({ quantity: row.quantity, unit: row.unit });
    return res.json(await getFull(recipe.id));
  }
  await RecipeIngredient.create(row);
  res.status(201).json(await getFull(recipe.id));
};

exports.removeIngredient = async (req, res) => {
  const recipe = await findOr404(req.params.id);
  const deleted = await RecipeIngredient.destroy({
    where: { recipeId: recipe.id, ingredientId: req.params.ingredientId },
  });
  if (!deleted) throw new HttpError(404, 'That ingredient is not part of this recipe');
  res.status(204).send();
};
