const handleApiError = (error) => {
  console.error('Goal API Error:', error);
  const errorMessage = error.response?.data?.error || 'エラーが発生しました';
  throw new Error(errorMessage);
};

export default handleApiError;
