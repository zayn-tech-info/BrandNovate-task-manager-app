const mongoose = require('mongoose');

const taskStatuses = ['todo', 'in-progress', 'review', 'completed'];
const taskPriorities = ['low', 'medium', 'high'];

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required.'],
      trim: true,
      minlength: [3, 'Task title must be at least 3 characters.'],
      maxlength: [120, 'Task title must be less than 120 characters.'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Task description must be less than 2000 characters.'],
      default: ''
    },
    status: {
      type: String,
      enum: taskStatuses,
      default: 'todo'
    },
    priority: {
      type: String,
      enum: taskPriorities, 
      default: 'medium'
    },
    dueDate: {
      type: Date,
      validate: {
        validator: (value) => {
          if (value == null) return true;
          const candidate = new Date(value);
          if (Number.isNaN(candidate.getTime())) return false;

          const dueDay = new Date(candidate);
          dueDay.setHours(0, 0, 0, 0);
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          return dueDay >= today;
        },
        message: 'Due date must be a valid date and cannot be in the past.'
      }
    },
    category: {
      type: String,
      trim: true,
      maxlength: [50, 'Category must be less than 50 characters.'],
      default: 'Other'
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required.'],
      validate: {
        validator: (value) => mongoose.Types.ObjectId.isValid(value),
        message: 'Invalid user reference.'
      }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
