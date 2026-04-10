const Task = require('../models/task.model');

const TASK_STATUSES = Task.taskStatuses;
const TASK_PRIORITIES = Task.taskPriorities;

const DAY_MS = 24 * 60 * 60 * 1000;

const getLocalDayBoundsUtc = (offsetMinutes) => {
  const now = Date.now();
  const shifted = new Date(now - offsetMinutes * 60 * 1000);
  const y = shifted.getUTCFullYear();
  const m = shifted.getUTCMonth();
  const d = shifted.getUTCDate();
  const startUtc = Date.UTC(y, m, d, 0, 0, 0, 0) + offsetMinutes * 60 * 1000;
  return { start: new Date(startUtc), end: new Date(startUtc + DAY_MS) };
};

const parseStatus = (status, hasField = true) => {
  if (!hasField) return { hasValue: false, value: undefined };
  if (status == null || status === '') return { hasValue: true, value: undefined };
  const normalized = String(status).toLowerCase().trim();
  if (!TASK_STATUSES.includes(normalized)) {
    return { hasValue: true, error: `Invalid status. Allowed values: ${TASK_STATUSES.join(', ')}.` };
  }
  return { hasValue: true, value: normalized };
};

const parsePriority = (priority, hasField = true) => {
  if (!hasField) return { hasValue: false, value: undefined };
  if (priority == null || priority === '') return { hasValue: true, value: undefined };
  const normalized = String(priority).toLowerCase().trim();
  if (!TASK_PRIORITIES.includes(normalized)) {
    return { hasValue: true, error: `Invalid priority. Allowed values: ${TASK_PRIORITIES.join(', ')}.` };
  }
  return { hasValue: true, value: normalized };
};

const parseDueDate = (dueDate, hasField = true) => {
  if (!hasField) {
    return { hasValue: false, value: undefined };
  }
  if (dueDate == null || dueDate === '') {
    return { hasValue: true, value: undefined };
  }
  const d = new Date(dueDate);
  if (Number.isNaN(d.getTime())) {
    return { hasValue: true, error: 'Invalid due date format.', value: undefined };
  }
  return { hasValue: true, value: d };
};

const normalizeCategory = (value) => {
  const category = String(value || '').trim();
  return category || 'Other';
};

const extractMongooseErrorMessage = (error, fallbackMessage) => {
  if (!error) return fallbackMessage;
  if (error.name === 'ValidationError' && error.errors) {
    const first = Object.values(error.errors)[0];
    return first?.message || fallbackMessage;
  }
  if (error.name === 'CastError') {
    return `Invalid ${error.path || 'data'}.`;
  }
  return fallbackMessage;
};

const getUnexpectedErrorMessage = (error, fallbackMessage) => {
  if (process.env.NODE_ENV !== 'production' && error?.message) {
    return error.message;
  }
  return fallbackMessage;
};

const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.userId })
      .sort({ createdAt: -1 });
    return res.status(200).json(tasks);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch tasks.' });
  }
};

const getTasksForToday = async (req, res) => {
  try {
    let start;
    let end;
    const raw = req.query.timezoneOffset;

    if (raw === undefined || raw === '') {
      start = new Date();
      start.setHours(0, 0, 0, 0);
      end = new Date(start.getTime() + DAY_MS);
    } else {
      const n = Number(raw);
      if (!Number.isFinite(n) || !Number.isInteger(n) || n < -840 || n > 840) {
        return res.status(400).json({
          message:
            'Invalid timezoneOffset. Send an integer from -840 to 840 (same convention as Date.prototype.getTimezoneOffset()).'
        });
      }
      ({ start, end } = getLocalDayBoundsUtc(n));
    }

    const tasks = await Task.find({
      user: req.userId,
      dueDate: { $gte: start, $lt: end }
    }).sort({ dueDate: 1 });

    return res.status(200).json(tasks);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch today tasks.' });
  }
};

const getCompletedTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.userId, status: 'completed' })
      .sort({ updatedAt: -1 });
    return res.status(200).json(tasks);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch completed tasks.' });
  }
};

const getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.userId });
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

    const categoryName = normalizeCategory(category);

    const parsedStatus = parseStatus(status, Object.prototype.hasOwnProperty.call(req.body, 'status'));
    if (parsedStatus.error) {
      return res.status(400).json({ message: parsedStatus.error });
    }

    const parsedPriority = parsePriority(priority, Object.prototype.hasOwnProperty.call(req.body, 'priority'));
    if (parsedPriority.error) {
      return res.status(400).json({ message: parsedPriority.error });
    }

    const due = parseDueDate(dueDate, Object.prototype.hasOwnProperty.call(req.body, 'dueDate'));
    if (due.error) {
      return res.status(400).json({ message: due.error });
    }

    const task = await Task.create({
      title: String(title).trim(),
      description: description || '',
      status: parsedStatus.hasValue ? parsedStatus.value : undefined,
      priority: parsedPriority.hasValue ? parsedPriority.value : undefined,
      dueDate: due.value,
      category: categoryName,
      user: req.userId
    });

    return res.status(201).json(task);
  } catch (error) {
    if (error.name === 'ValidationError' || error.name === 'CastError') {
      return res.status(400).json({ message: extractMongooseErrorMessage(error, 'Invalid task data.') });
    }
    console.error('createTask error:', error);
    return res.status(500).json({ message: getUnexpectedErrorMessage(error, 'Failed to create task.') });
  }
};

const updateTask = async (req, res) => {
  try {
    const payload = {};
    const hasOwn = (key) => Object.prototype.hasOwnProperty.call(req.body, key);

    if (hasOwn('title')) payload.title = String(req.body.title || '').trim();
    if (hasOwn('description')) payload.description = String(req.body.description || '');
    if (hasOwn('status')) {
      const parsedStatus = parseStatus(req.body.status, true);
      if (parsedStatus.error) {
        return res.status(400).json({ message: parsedStatus.error });
      }
      payload.status = parsedStatus.value;
    }

    if (hasOwn('priority')) {
      const parsedPriority = parsePriority(req.body.priority, true);
      if (parsedPriority.error) {
        return res.status(400).json({ message: parsedPriority.error });
      }
      payload.priority = parsedPriority.value;
    }
    if (hasOwn('dueDate')) {
      const parsedDueDate = parseDueDate(req.body.dueDate, true);
      if (parsedDueDate.error) {
        return res.status(400).json({ message: parsedDueDate.error });
      }
      payload.dueDate = parsedDueDate.value;
    }

    if (hasOwn('category')) {
      payload.category = normalizeCategory(req.body.category);
    }

    if (payload.title !== undefined && !String(payload.title).trim()) {
      return res.status(400).json({ message: 'Task title cannot be empty.' });
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      payload,
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    return res.status(200).json({
      message: 'Task was updated successfully.',
      data: task
    });
  } catch (error) {
    if (error.name === 'ValidationError' || error.name === 'CastError') {
      return res.status(400).json({ message: extractMongooseErrorMessage(error, 'Invalid task data.') });
    }
    console.error('updateTask error:', error);
    return res.status(500).json({ message: getUnexpectedErrorMessage(error, 'Failed to update task.') });
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
    );

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
    );

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
