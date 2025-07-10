export type FeedbackType = 'success' | 'error' | 'info' | 'warning';

export interface FeedbackState {
  message: string;
  type: FeedbackType;
  visible: boolean;
}
