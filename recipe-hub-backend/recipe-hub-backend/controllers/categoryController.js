const { Category, Recipe } = require('../models');
const HttpError = require('../utils/httpError');

const findOr404 = async (id) => {
  const category = await Category.findByPk(id);
  if (!category) throw new HttpError(404, `Category ${id} not found`);
  return category;
};

exports.getAll = async (req, res) => {
  res.json(await Category.findAll({ order: [['name', 'ASC']] }));
};

exports.getOne = async (req, res) => {
  const category = await Category.findByPk(req.params.id, {
    include: [{ model: Recipe, as: 'recipes', attributes: ['id', 'title', 'prepTime', 'difficulty'] }],
  });
  if (!category) throw new HttpError(404, `Category ${req.params.id} not found`);
  res.json(category);
};

exports.create = async (req, res) => {
  const { name, description } = req.body;
  res.status(201).json(await Category.create({ name, description }));
};

exports.update = async (req, res) => {
  const category = await findOr404(req.params.id);
  const { name, description } = req.body;
  await category.update({ name, description });
  res.json(category);
};

exports.remove = async (req, res) => {
  const category = await findOr404(req.params.id);
  const count = await Recipe.count({ where: { categoryId: category.id } });
  if (count > 0) throw new HttpError(409, `Cannot delete: category still has ${count} recipe(s)`);
  await category.destroy();
  res.status(204).send();
};
