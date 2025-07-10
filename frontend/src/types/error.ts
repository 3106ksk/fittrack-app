export interface ApiErrorResponse {
  error: string;
  message?: string;
  details?: unknown;
}

export type SimpleErrorType = 'API_ERROR' | 'NETWORK_ERROR' | 'UNKNOWN_ERROR';

export interface ErrorProcessResult {
  type: SimpleErrorType;
  userMessage: string;
  statusCode?: number;
}

export class SimpleAppError extends Error {
  public readonly type: SimpleErrorType;
  public readonly statusCode: number | undefined;

  constructor(type: SimpleErrorType, message: string, statusCode?: number) {
    super(message);
    this.name = 'SimpleAppError';
    this.type = type;
    this.statusCode = statusCode;
  }
}
