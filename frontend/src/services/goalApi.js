import axios from 'axios';

class GoalApiService {
  constructor() {
    this.apiUrl = 'http://localhost:8000/goals';
  }

  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };
  }

  async createGoal(goalData) {
    try {
      const response = await axios.post(this.apiUrl, goalData, this.getAuthHeaders());
      return response.data;
    } catch (error) {
      // エラーメッセージを統一
      const errorMessage = error.response?.data?.error || 'エラーが発生しました';
      throw new Error(errorMessage);
    }
  }
}

export const goalApi = new GoalApiService();