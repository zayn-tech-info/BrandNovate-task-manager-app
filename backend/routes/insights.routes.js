const express = require('express');
const { verifyToken } = require('../middleware/auth.middleware');
const { getOverviewInsights, getTaskDraftSuggestion } = require('../controllers/insights.controller');

const router = express.Router();

router.use(verifyToken);
router.get('/overview', getOverviewInsights);
router.post('/task-draft', getTaskDraftSuggestion);

module.exports = router;
