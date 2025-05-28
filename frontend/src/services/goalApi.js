import axios from 'axios';
import handleApiError from './errorHandler';

const BASE_URL = 'http://localhost:8000/goals';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
};

const createGoal = async (goalData) => {
  try {
    const response = await axios.post(BASE_URL, goalData, getAuthHeaders());
    return {
      goal: response.data.goal,
      message: response.data.message || '目標が正常に作成されました'
    };
  } catch (error) {
    handleApiError(error);
  }
};

export { createGoal };