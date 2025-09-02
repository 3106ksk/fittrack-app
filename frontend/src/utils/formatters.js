export const formatDuration = seconds => {
  if (!seconds || seconds === 0) {
    return '-';
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const paddedSeconds = remainingSeconds.toString().padStart(2, '0');

  return `${minutes}m${paddedSeconds}s`;
};

export const formatDistance = distance => {
  if (!distance && distance !== 0) {
    return '-';
  }

  // 小数点第1位で表示
  return `${distance.toFixed(2)}km`;
};
