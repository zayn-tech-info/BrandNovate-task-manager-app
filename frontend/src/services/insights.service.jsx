import axios from 'axios';
import { apiUrl } from '../utils/constants';
import authService from './auth.service';

const apiInsightsUrl = `${apiUrl}/api/insights`;

class InsightsService {
  async getOverviewInsights() {
    return axios.get(`${apiInsightsUrl}/overview`, {
      headers: authService.getAuthHeader()
    });
  }

  async getTaskDraftSuggestion({ prompt = '', draftTitle = '', draftDescription = '' } = {}) {
    return axios.post(
      `${apiInsightsUrl}/task-draft`,
      { prompt, draftTitle, draftDescription },
      {
        headers: authService.getAuthHeader()
      }
    );
  }

  async getTaskFieldSuggestions({ draftTitle = '', draftDescription = '' } = {}) {
    return axios.post(
      `${apiInsightsUrl}/task-fields`,
      { draftTitle, draftDescription },
      {
        headers: authService.getAuthHeader()
      }
    );
  }
}

export default new InsightsService();
