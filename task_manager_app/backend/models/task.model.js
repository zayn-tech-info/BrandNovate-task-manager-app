const mongoose = require('mongoose');

const TASK_STATUSES = ['todo', 'in-progress', 'review', 'completed'];
const TASK_PRIORITIES = ['low', 'medium', 'high'];

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: TASK_STATUSES,
      default: 'todo'
    },
    priority: {
      type: String,
      enum: TASK_PRIORITIES,
      default: 'medium'
    },
    dueDate: {
      type: Date
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
