export const generateDefaultValues = formConfig => {
  const defaults = { intensity: '' };

  formConfig.exercises.forEach(exercise => {
    // カーディオかどうかは名前で判断（簡易実装）
    const isCardio = [
      'ウォーキング',
      'ジョギング',
      'ランニング',
      'サイクリング',
    ].includes(exercise);

    if (isCardio) {
      defaults[`${exercise}_distance`] = null;
      defaults[`${exercise}_duration`] = null;
    } else {
      for (let i = 1; i <= formConfig.maxSets; i++) {
        defaults[`${exercise}_set${i}`] = null;
      }
    }
  });

  return defaults;
};

export default generateDefaultValues;
