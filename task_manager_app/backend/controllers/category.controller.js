const Category = require('../models/category.model');

const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({ user: req.userId }).sort({ name: 1 });
    return res.status(200).json(categories);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch categories.' });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findOne({ _id: req.params.id, user: req.userId });
    if (!category) {
      return res.status(404).json({ message: 'Category not found.' });
    }
    return res.status(200).json(category);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch category.' });
  }
};

const createCategory = async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    if (!name) {
      return res.status(400).json({ message: 'Category name is required.' });
    }

    const existing = await Category.findOne({ user: req.userId, name });
    if (existing) {
      return res.status(409).json({ message: 'Category already exists.' });
    }

    const category = await Category.create({ name, user: req.userId });
    return res.status(201).json(category);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create category.' });
  }
};

const updateCategory = async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    if (!name) {
      return res.status(400).json({ message: 'Category name is required.' });
    }

    const category = await Category.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { name },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    return res.status(200).json(category);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update category.' });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!category) {
      return res.status(404).json({ message: 'Category not found.' });
    }
    return res.status(200).json({ message: 'Category deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete category.' });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
