const express = require('express');
const { verifyToken } = require('../middleware/auth.middleware');
const {
  getOverviewInsights,
  getTaskDraftSuggestion,
  getTaskFieldSuggestions
} = require('../controllers/insights.controller');

const router = express.Router();

router.use(verifyToken);
router.get('/overview', getOverviewInsights);
router.post('/task-draft', getTaskDraftSuggestion);
router.post('/task-fields', getTaskFieldSuggestions);

module.exports = router;
