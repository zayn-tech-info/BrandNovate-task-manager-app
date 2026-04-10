const Task = require('../models/task.model');
const { generateOverviewInsights, generateTaskDraftSuggestion } = require('../services/ai/providerRouter');

const getOverviewInsights = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.userId }).sort({ createdAt: -1 }).lean();
    const insights = await generateOverviewInsights({ tasks });
    return res.status(200).json(insights);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to generate overview insights.' });
  }
};

const getTaskDraftSuggestion = async (req, res) => {
  try {
    const prompt = String(req.body?.prompt || '').trim();
    const draftTitle = String(req.body?.draftTitle || '').trim();
    const draftDescription = String(req.body?.draftDescription || '').trim();
    const tasks = await Task.find({ user: req.userId }).sort({ createdAt: -1 }).lean();
    const draft = await generateTaskDraftSuggestion({
      tasks,
      prompt,
      draftTitle,
      draftDescription
    });
    return res.status(200).json(draft);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to generate task suggestion.' });
  }
};

module.exports = {
  getOverviewInsights,
  getTaskDraftSuggestion
};
