const { Op } = require('sequelize');
const { Ingredient, RecipeIngredient } = require('../models');
const HttpError = require('../utils/httpError');

const findOr404 = async (id) => {
  const ingredient = await Ingredient.findByPk(id);
  if (!ingredient) throw new HttpError(404, `Ingredient ${id} not found`);
  return ingredient;
};

exports.getAll = async (req, res) => {
  const where = req.query.search ? { name: { [Op.like]: `%${req.query.search}%` } } : {};
  res.json(await Ingredient.findAll({ where, order: [['name', 'ASC']] }));
};

exports.getOne = async (req, res) => {
  res.json(await findOr404(req.params.id));
};

exports.create = async (req, res) => {
  const { name, defaultUnit } = req.body;
  res.status(201).json(await Ingredient.create({ name, defaultUnit }));
};

exports.update = async (req, res) => {
  const ingredient = await findOr404(req.params.id);
  const { name, defaultUnit } = req.body;
  await ingredient.update({ name, defaultUnit });
  res.json(ingredient);
};

exports.remove = async (req, res) => {
  const ingredient = await findOr404(req.params.id);
  const used = await RecipeIngredient.count({ where: { ingredientId: ingredient.id } });
  if (used > 0) throw new HttpError(409, `Cannot delete: ingredient is used in ${used} recipe(s)`);
  await ingredient.destroy();
  res.status(204).send();
};
