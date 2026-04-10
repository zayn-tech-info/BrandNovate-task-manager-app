import axios from 'axios';
import { API_URL } from '../utils/constants';
import authService from './auth.service';

const API_INSIGHTS_URL = `${API_URL}/api/insights`;

class InsightsService {
  async getOverviewInsights() {
    return axios.get(`${API_INSIGHTS_URL}/overview`, {
      headers: authService.getAuthHeader()
    });
  }

  async getTaskDraftSuggestion({ prompt = '', draftTitle = '', draftDescription = '' } = {}) {
    return axios.post(
      `${API_INSIGHTS_URL}/task-draft`,
      { prompt, draftTitle, draftDescription },
      {
        headers: authService.getAuthHeader()
      }
    );
  }
}

export default new InsightsService();
