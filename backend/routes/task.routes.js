const express = require('express');
const { verifyToken } = require('../middleware/auth.middleware');
const {
  getAllTasks,
  getTasksForToday,
  getCompletedTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  markTaskAsCompleted,
  markTaskAsIncomplete
} = require('../controllers/task.controller');

const router = express.Router();

router.use(verifyToken);

router.get('/', getAllTasks);
router.get('/today', getTasksForToday);
router.get('/completed', getCompletedTasks);
router.get('/:id', getTaskById);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.patch('/:id/complete', markTaskAsCompleted);
router.patch('/:id/incomplete', markTaskAsIncomplete);

module.exports = router;
