import { Goal } from '../types';
import apiClient from './api';

export const goalAPI = {

  async createGoal(goal: Goal): Promise<{message: string, goal: Goal}> {
    try {
      console.log("📡 API Call: POST /goals");
      const response = await apiClient.post<{message: string, goal: Goal}>('/goals', goal);
      return response.data;
    } catch (error) {
      console.error('目標作成エラー:', error);
      throw new Error('目標の作成に失敗しました');
    }
  },

  async getGoals(): Promise<Goal[]> {
    try {
      console.log("📡 API Call: GET /goals");
      const response = await apiClient.get<{message: string, count: number, goals: Goal[]}>('/goals');
      console.log("✅ API成功:", response.data);
      return response.data.goals;
    } catch (error) {
      console.error('❌ API エラー詳細:', error);
      throw new Error('目標の取得に失敗しました');
    }
  },

    async updateProgress(goalId: number, progressAmount: number): Promise<Goal> {
    try {
      console.log(`📡 API Call: PUT /goals/${goalId}/progress`);
      const response = await apiClient.put<Goal>(`/goals/${goalId}/progress`, {
        progressAmount
      });
      return response.data;
    } catch (error) {
      console.error('進捗更新エラー:', error);
      throw new Error('進捗の更新に失敗しました');
    }
  },

    async updateStatus(goalId: number, status: Goal['status']): Promise<Goal> {
    try {
      console.log(`📡 API Call: PUT /goals/${goalId}/status`);
      const response = await apiClient.put<Goal>(`/goals/${goalId}/status`, {
        status
      });
      return response.data;
    } catch (error) {
      console.error('ステータス更新エラー:', error);
      throw new Error('ステータスの更新に失敗しました');
    }
  },

  
};