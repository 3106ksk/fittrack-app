export interface ApiErrorResponse {
  error: string;
  message?: string;
  details?: unknown;
}

export type SimpleErrorType = 
  | 'API_ERROR'      
  | 'NETWORK_ERROR'  
  | 'UNKNOWN_ERROR';

  export class SimpleAppError extends Error {
  public readonly type: SimpleErrorType;
  
  constructor(type: SimpleErrorType, message: string) {
    super(message);
    this.name = 'SimpleAppError';
    this.type = type;
  }
}