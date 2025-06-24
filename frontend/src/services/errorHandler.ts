import { AxiosError } from 'axios';
import { ApiErrorResponse, ErrorProcessResult, SimpleAppError, SimpleErrorType } from '../types/error';


export const handleApiError = (error : unknown):never => {
  console.error('Goal API Error:', error);

  function getAxiosErrorMessage(error: AxiosError): string {
  const responseData = error.response?.data as ApiErrorResponse;
  return responseData?.error || 'エラーが発生しました';
};

function getAxiosErrorType(error: AxiosError): SimpleErrorType {
  if (error.response) {
    return 'API_ERROR';   
  } else if (error.request) {
    return 'NETWORK_ERROR'; 
  } else {
    return 'UNKNOWN_ERROR';
  }
};

function processAxiosError(error: AxiosError): ErrorProcessResult {
  
  if (error.response) {
    const statusCode = error.response.status;
    const responseData = error.response.data as ApiErrorResponse;

switch (statusCode) {
      case 401:
        return {
          type: 'API_ERROR',
          userMessage: 'ログインが必要です',
          statusCode: statusCode
        };
      case 403:
        return {
          type: 'API_ERROR', 
          userMessage: 'アクセス権限がありません',
          statusCode: statusCode
        };
      case 404:
        return {
          type: 'API_ERROR',
          userMessage: 'データが見つかりません',
          statusCode: statusCode
        };
      case 500:
        return {
          type: 'API_ERROR',
          userMessage: 'サーバーでエラーが発生しました',
          statusCode: statusCode
        };
      default:

        return {
          type: 'API_ERROR',
          userMessage: responseData?.error || 'エラーが発生しました',
          statusCode: statusCode
        };
}
  } else if (error.request) {
    return {
      type: 'NETWORK_ERROR',
      userMessage: 'ネットワーク接続を確認してください'
    };
  }
  
  return {
    type: 'UNKNOWN_ERROR',
    userMessage: '予期しないエラーが発生しました'
  };
}

  if (error instanceof AxiosError) {
    const result = processAxiosError(error);
    throw new SimpleAppError(result.type, result.userMessage, result.statusCode);
  }
  const message = error instanceof Error ? error.message :'エラーが発生しました';
  throw new SimpleAppError('UNKNOWN_ERROR', message);
};

export default handleApiError;
