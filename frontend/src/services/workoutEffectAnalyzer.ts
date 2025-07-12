import {
    EXERCISE_DATABASE,
    MUSCLE_GROUPS,
    SYNERGY_COMBINATIONS,
    TRAINING_EFFECTS,
    type MuscleGroup,
    type TrainingEffect
} from '../data/exercises';

export interface WorkoutAnalysisResult {
  overallScore: number;
  primaryEffects: EffectAnalysis[];
  muscleBalance: MuscleBalanceAnalysis;
  synergyEffects: SynergyEffect[];
  recommendations: string[];
  strengthAreas: string[];
  improvementAreas: string[];
  estimatedCalorieBurn: string;
  intensityLevel: string;
}

export interface EffectAnalysis {
  effect: TrainingEffect;
  strength: number; // 1-10
  description: string;
  exercises: string[];
}

export interface MuscleBalanceAnalysis {
  coverage: number; // パーセンテージ
  targetedMuscles: MuscleGroup[];
  gaps: MuscleGroup[];
  balance: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface SynergyEffect {
  name: string;
  description: string;
  score: number;
  exercises: string[];
}

class WorkoutEffectAnalyzer {
  
  analyzeWorkout(selectedExercises: string[], maxSets: number = 3): WorkoutAnalysisResult {
    const exercises = selectedExercises
      .map(name => Object.values(EXERCISE_DATABASE).find(ex => ex.name === name))
      .filter((exercise): exercise is NonNullable<typeof exercise> => exercise !== undefined);

    const primaryEffects = this.analyzePrimaryEffects(exercises);
    const muscleBalance = this.analyzeMuscleBalance(exercises);
    const synergyEffects = this.analyzeSynergyEffects(selectedExercises);
    const overallScore = this.calculateOverallScore(primaryEffects, muscleBalance, synergyEffects);
    const recommendations = this.generateRecommendations(exercises, muscleBalance, primaryEffects);
    const strengthAreas = this.identifyStrengthAreas(primaryEffects, synergyEffects);
    const improvementAreas = this.identifyImprovementAreas(muscleBalance, primaryEffects);
    const estimatedCalorieBurn = this.estimateCalorieBurn(exercises, maxSets);
    const intensityLevel = this.calculateIntensityLevel(exercises);

    return {
      overallScore,
      primaryEffects,
      muscleBalance,
      synergyEffects,
      recommendations,
      strengthAreas,
      improvementAreas,
      estimatedCalorieBurn,
      intensityLevel,
    };
  }

  private analyzePrimaryEffects(exercises: any[]): EffectAnalysis[] {
    const effectMap = new Map<TrainingEffect, {
      strength: number;
      exercises: string[];
      count: number;
    }>();

    exercises.forEach(exercise => {
      exercise.primaryEffects.forEach((effect: TrainingEffect) => {
        if (!effectMap.has(effect)) {
          effectMap.set(effect, { strength: 0, exercises: [], count: 0 });
        }
        const current = effectMap.get(effect)!;
        current.strength += exercise.intensity;
        current.exercises.push(exercise.name);
        current.count += 1;
      });

      exercise.secondaryEffects?.forEach((effect: TrainingEffect) => {
        if (!effectMap.has(effect)) {
          effectMap.set(effect, { strength: 0, exercises: [], count: 0 });
        }
        const current = effectMap.get(effect)!;
        current.strength += exercise.intensity * 0.5; // 副次効果は半分の重み
        current.exercises.push(exercise.name);
        current.count += 0.5;
      });
    });

    return Array.from(effectMap.entries()).map(([effect, data]) => ({
      effect,
      strength: Math.min(10, Math.round((data.strength / exercises.length) * 2)),
      description: this.getEffectDescription(effect, data.strength),
      exercises: [...new Set(data.exercises)], // 重複除去
    })).sort((a, b) => b.strength - a.strength);
  }

  private analyzeMuscleBalance(exercises: any[]): MuscleBalanceAnalysis {
    const targetedMuscles = new Set<MuscleGroup>();
    const allMuscles = Object.values(MUSCLE_GROUPS);
    
    exercises.forEach(exercise => {
      exercise.targetMuscles.forEach((muscle: MuscleGroup) => {
        targetedMuscles.add(muscle);
      });
    });

    const coverage = (targetedMuscles.size / allMuscles.length) * 100;
    const gaps = allMuscles.filter(muscle => !targetedMuscles.has(muscle));
    
    let balance: 'excellent' | 'good' | 'fair' | 'poor';
    if (coverage >= 80) balance = 'excellent';
    else if (coverage >= 60) balance = 'good';
    else if (coverage >= 40) balance = 'fair';
    else balance = 'poor';

    return {
      coverage: Math.round(coverage),
      targetedMuscles: Array.from(targetedMuscles),
      gaps,
      balance,
    };
  }

  private analyzeSynergyEffects(selectedExercises: string[]): SynergyEffect[] {
    const synergyEffects: SynergyEffect[] = [];

    Object.entries(SYNERGY_COMBINATIONS).forEach(([key, combination]) => {
      const matchingExercises = combination.exercises.filter(exercise => {
        const exerciseData = Object.values(EXERCISE_DATABASE).find(ex => ex.id === exercise);
        return exerciseData && selectedExercises.includes(exerciseData.name);
      });

      if (matchingExercises.length >= 2) {
        const exerciseNames = matchingExercises.map(id => {
          const exercise = Object.values(EXERCISE_DATABASE).find(ex => ex.id === id);
          return exercise?.name || '';
        }).filter(Boolean);

        synergyEffects.push({
          name: this.getSynergyName(key),
          description: combination.effect,
          score: combination.score * (matchingExercises.length / combination.exercises.length),
          exercises: exerciseNames,
        });
      }
    });

    return synergyEffects.sort((a, b) => b.score - a.score);
  }

  private calculateOverallScore(
    primaryEffects: EffectAnalysis[], 
    muscleBalance: MuscleBalanceAnalysis, 
    synergyEffects: SynergyEffect[]
  ): number {
    const effectScore = primaryEffects.reduce((sum, effect) => sum + effect.strength, 0) / primaryEffects.length;
    const balanceScore = muscleBalance.coverage / 10;
    const synergyScore = synergyEffects.length > 0 
      ? synergyEffects.reduce((sum, synergy) => sum + synergy.score, 0) / synergyEffects.length 
      : 0;

    return Math.round((effectScore * 0.4 + balanceScore * 0.3 + synergyScore * 0.3) * 10) / 10;
  }

  private generateRecommendations(
    exercises: any[], 
    muscleBalance: MuscleBalanceAnalysis, 
    primaryEffects: EffectAnalysis[]
  ): string[] {
    const recommendations: string[] = [];

    // 筋肉バランスの改善提案
    if (muscleBalance.gaps.length > 0) {
      const gapNames = muscleBalance.gaps.map(gap => this.getMuscleGroupName(gap));
      recommendations.push(`${gapNames.slice(0, 2).join('・')}の種目を追加すると、より全身バランスの良いワークアウトになります`);
    }

    // カーディオと筋トレのバランス
    const cardioCount = exercises.filter(ex => ex.type === 'cardio').length;
    const strengthCount = exercises.filter(ex => ex.type === 'strength').length;
    
    if (cardioCount === 0) {
      recommendations.push('有酸素運動を追加すると脂肪燃焼効果と心肺機能向上が期待できます');
    } else if (strengthCount === 0) {
      recommendations.push('筋力トレーニングを追加すると基礎代謝向上と筋力強化が期待できます');
    }

    // 強度バランス
    const avgIntensity = exercises.reduce((sum, ex) => sum + ex.intensity, 0) / exercises.length;
    if (avgIntensity < 2.5) {
      recommendations.push('強度を上げることでより効果的なトレーニングが可能です');
    } else if (avgIntensity > 4) {
      recommendations.push('初心者の方は低強度の種目も組み合わせることを推奨します');
    }

    return recommendations.slice(0, 3); // 最大3つの提案
  }

  private identifyStrengthAreas(primaryEffects: EffectAnalysis[], synergyEffects: SynergyEffect[]): string[] {
    const strengths: string[] = [];

    // 強い効果を持つエリアを特定
    primaryEffects.slice(0, 3).forEach(effect => {
      if (effect.strength >= 7) {
        strengths.push(this.getEffectDisplayName(effect.effect));
      }
    });

    // 相乗効果があるエリアを追加
    synergyEffects.slice(0, 2).forEach(synergy => {
      if (synergy.score >= 8) {
        strengths.push(synergy.name);
      }
    });

    return strengths.slice(0, 4);
  }

  private identifyImprovementAreas(muscleBalance: MuscleBalanceAnalysis, primaryEffects: EffectAnalysis[]): string[] {
    const improvements: string[] = [];

    if (muscleBalance.balance === 'poor' || muscleBalance.balance === 'fair') {
      improvements.push('筋肉群のバランス');
    }

    // 低い効果のエリアを特定
    const weakEffects = primaryEffects.filter(effect => effect.strength < 5);
    if (weakEffects.length > 0) {
      improvements.push(this.getEffectDisplayName(weakEffects[0].effect));
    }

    return improvements.slice(0, 2);
  }

  private estimateCalorieBurn(exercises: any[], maxSets: number): string {
    let totalBurn = 0;
    
    exercises.forEach(exercise => {
      if (!exercise) return;
      
      let baseBurn = 0;
      switch (exercise.calorieBurnRate) {
        case 'low': baseBurn = 50; break;
        case 'medium': baseBurn = 100; break;
        case 'high': baseBurn = 150; break;
      }
      
      if (exercise.type === 'strength') {
        baseBurn *= (maxSets / 3); // セット数に応じて調整
      }
      
      totalBurn += baseBurn;
    });

    if (totalBurn < 100) return '低（〜100kcal）';
    if (totalBurn < 200) return '中（100-200kcal）';
    return '高（200kcal〜）';
  }

  private calculateIntensityLevel(exercises: any[]): string {
    const avgIntensity = exercises.reduce((sum, ex) => sum + ex.intensity, 0) / exercises.length;
    
    if (avgIntensity < 2.5) return '軽い';
    if (avgIntensity < 3.5) return '普通';
    if (avgIntensity < 4.5) return 'やや激しい';
    return '激しい';
  }

  // ヘルパーメソッド
  private getEffectDescription(effect: TrainingEffect, strength: number): string {
    const descriptions = {
      [TRAINING_EFFECTS.CARDIOVASCULAR]: '心肺機能を向上させ、持久力を高めます',
      [TRAINING_EFFECTS.MUSCLE_STRENGTH]: '筋力を増加させ、基礎代謝を向上させます',
      [TRAINING_EFFECTS.MUSCLE_ENDURANCE]: '筋持久力を高め、疲労しにくい体を作ります',
      [TRAINING_EFFECTS.POWER]: '瞬発力と爆発力を向上させます',
      [TRAINING_EFFECTS.FLEXIBILITY]: '柔軟性を高め、怪我の予防に効果的です',
      [TRAINING_EFFECTS.BALANCE]: 'バランス感覚と安定性を向上させます',
      [TRAINING_EFFECTS.CORE_STABILITY]: '体幹の安定性を高め、姿勢を改善します',
      [TRAINING_EFFECTS.FAT_BURNING]: '脂肪燃焼を促進し、体重管理に効果的です',
      [TRAINING_EFFECTS.AGILITY]: '俊敏性と動作の切り替え能力を向上させます',
    };
    return descriptions[effect] || '';
  }

  private getEffectDisplayName(effect: TrainingEffect): string {
    const names = {
      [TRAINING_EFFECTS.CARDIOVASCULAR]: '心肺機能',
      [TRAINING_EFFECTS.MUSCLE_STRENGTH]: '筋力',
      [TRAINING_EFFECTS.MUSCLE_ENDURANCE]: '筋持久力',
      [TRAINING_EFFECTS.POWER]: '瞬発力',
      [TRAINING_EFFECTS.FLEXIBILITY]: '柔軟性',
      [TRAINING_EFFECTS.BALANCE]: 'バランス',
      [TRAINING_EFFECTS.CORE_STABILITY]: '体幹安定性',
      [TRAINING_EFFECTS.FAT_BURNING]: '脂肪燃焼',
      [TRAINING_EFFECTS.AGILITY]: '俊敏性',
    };
    return names[effect] || '';
  }

  private getMuscleGroupName(muscle: MuscleGroup): string {
    const names = {
      [MUSCLE_GROUPS.CHEST]: '胸部',
      [MUSCLE_GROUPS.BACK]: '背中',
      [MUSCLE_GROUPS.SHOULDERS]: '肩',
      [MUSCLE_GROUPS.ARMS]: '腕',
      [MUSCLE_GROUPS.CORE]: '体幹',
      [MUSCLE_GROUPS.LEGS]: '脚',
      [MUSCLE_GROUPS.GLUTES]: '臀部',
      [MUSCLE_GROUPS.CALVES]: 'ふくらはぎ',
      [MUSCLE_GROUPS.FULL_BODY]: '全身',
    };
    return names[muscle] || '';
  }

  private getSynergyName(key: string): string {
    const names = {
      cardio_strength_balance: 'バランス型トレーニング',
      explosive_power: '爆発力強化',
      upper_lower_balance: '上下半身バランス',
      core_stability_focus: '体幹強化特化',
      functional_movement: '機能的動作',
    };
    return names[key as keyof typeof names] || '相乗効果';
  }
}

export const workoutEffectAnalyzer = new WorkoutEffectAnalyzer(); 