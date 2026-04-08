const Task = require('../models/task.model');
const Category = require('../models/category.model');

const ensureGeneralCategory = async (userId) => {
  let category = await Category.findOne({ user: userId, name: 'General' });
  if (!category) {
    category = await Category.create({ user: userId, name: 'General' });
  }
  return category;
};

const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.userId })
      .populate('category', 'name')
      .sort({ createdAt: -1 });
    return res.status(200).json(tasks);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch tasks.' });
  }
};

const getTasksForToday = async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const tasks = await Task.find({
      user: req.userId,
      dueDate: { $gte: start, $lt: end }
    })
      .populate('category', 'name')
      .sort({ dueDate: 1 });

    return res.status(200).json(tasks);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch today tasks.' });
  }
};

const getCompletedTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.userId, status: 'completed' })
      .populate('category', 'name')
      .sort({ updatedAt: -1 });
    return res.status(200).json(tasks);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch completed tasks.' });
  }
};

const getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.userId }).populate('category', 'name');
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }
    return res.status(200).json(task);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch task.' });
  }
};

const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, category } = req.body;

    if (!title || !String(title).trim()) {
      return res.status(400).json({ message: 'Task title is required.' });
    }

    let categoryId = category;
    if (categoryId) {
      const categoryExists = await Category.findOne({ _id: categoryId, user: req.userId });
      if (!categoryExists) {
        return res.status(400).json({ message: 'Invalid category.' });
      }
    } else {
      const defaultCategory = await ensureGeneralCategory(req.userId);
      categoryId = defaultCategory._id;
    }

    const task = await Task.create({
      title: String(title).trim(),
      description: description || '',
      status,
      priority,
      dueDate,
      category: categoryId,
      user: req.userId
    });

    const populatedTask = await Task.findById(task._id).populate('category', 'name');
    return res.status(201).json(populatedTask);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create task.' });
  }
};

const updateTask = async (req, res) => {
  try {
    const payload = { ...req.body };

    if (payload.category) {
      const categoryExists = await Category.findOne({ _id: payload.category, user: req.userId });
      if (!categoryExists) {
        return res.status(400).json({ message: 'Invalid category.' });
      }
    }

    if (payload.title !== undefined && !String(payload.title).trim()) {
      return res.status(400).json({ message: 'Task title cannot be empty.' });
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      payload,
      { new: true, runValidators: true }
    ).populate('category', 'name');

    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    return res.status(200).json({ message: 'Task was updated successfully.', data: task });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update task.' });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }
    return res.status(200).json({ message: 'Task deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete task.' });
  }
};

const markTaskAsCompleted = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { status: 'completed' },
      { new: true, runValidators: true }
    ).populate('category', 'name');

    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    return res.status(200).json({
      message: 'Task was marked as completed successfully.',
      data: task
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to mark task as completed.' });
  }
};

const markTaskAsIncomplete = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { status: 'todo' },
      { new: true, runValidators: true }
    ).populate('category', 'name');

    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    return res.status(200).json({
      message: 'Task was marked as incomplete successfully.',
      data: task
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to mark task as incomplete.' });
  }
};

module.exports = {
  getAllTasks,
  getTasksForToday,
  getCompletedTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  markTaskAsCompleted,
  markTaskAsIncomplete
};
