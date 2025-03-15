import { useForm } from 'react-hook-form'
import axios from 'axios';

const WORKOUT_TYPES = {
  CARDIO: 'cardio',
  STRENGTH: 'strength'
};

const workoutExercises = [
  {
    name: 'ウォーキング',
    type: WORKOUT_TYPES.CARDIO,
    description: '全身運動。心肺機能を高め、脚部の筋肉と体幹を軽く鍛える有酸素運動。20-30分、週3-5回行うのが効果的。メリット：基礎代謝アップ、ストレス軽減、生活習慣病予防、睡眠の質向上、長時間の運動耐性向上',
    beginner: true
  },
  {
    name: 'ジョギング',
    type: WORKOUT_TYPES.CARDIO,
    description: '全身運動。心肺機能を向上させ、下半身の筋肉を強化する有酸素運動。15-20分、週2-3回から始めるのが適切。メリット：脂肪燃焼効果が高い、心肺機能の大幅な向上、持久力アップ、メンタルヘルス改善、骨密度増加',
    beginner: true
  },
  {
    name: 'スクワット',
    type: WORKOUT_TYPES.STRENGTH,
    description: '下半身トレーニング。太もも前部、お尻、体幹を鍛える基本的な自重運動。初めは自重から始め、フォームを重視する。メリット：基礎代謝向上、日常動作の安定性向上、姿勢改善、下半身のバランス強化、ホルモン分泌促進',
    beginner: true
  },
  {
    name: 'プッシュアップ',
    type: WORKOUT_TYPES.STRENGTH,
    description: '上半身トレーニング。胸筋、三頭筋、肩を鍛える基本的な自重トレーニング。初心者は膝をついた状態から始めても良い。メリット：上半身の筋力バランス向上、姿勢改善、腕の引き締め効果、体幹強化、どこでも手軽にできる',
    beginner: true
  },
  {
    name: 'ベンチプレス',
    type: WORKOUT_TYPES.STRENGTH,
    description: '上半身トレーニング。胸筋、三頭筋、肩を鍛える基本的なウェイトトレーニング。初めは軽いバーから始めてフォームを習得する。メリット：上半身の筋肉量増加、押す動作の強化、胸部の発達による姿勢改善、上半身の見た目の向上',
    beginner: true
  },
  {
    name: 'デッドリフト',
    type: WORKOUT_TYPES.STRENGTH,
    description: '全身トレーニング。背中、お尻、ハムストリングスなど多くの筋群を同時に鍛える複合運動。フォームを重視し、軽い重量から始める。メリット：全身の筋力バランス向上、背筋強化による姿勢改善、基礎代謝の大幅アップ、日常生活での腰痛リスク軽減',
    beginner: true
  },
  {
    name: 'クランチ',
    type: WORKOUT_TYPES.STRENGTH,
    description: '腹筋運動。主に腹直筋上部を鍛える自重トレーニング。背中への負担が少なく初心者に適している。メリット：体幹安定性の向上、腹部の引き締め効果、姿勢改善、腰痛予防、見た目の変化が実感しやすい',
    beginner: true
  },
  {
    name: 'レッグレイズ',
    type: WORKOUT_TYPES.STRENGTH,
    description: '腹筋運動。下腹部と腸腰筋を重点的に鍛える自重トレーニング。仰向けに寝た状態から脚を持ち上げる動作で行う。メリット：下腹部の引き締め、体幹強化、姿勢改善、腰痛予防、骨盤の安定性向上',
    beginner: true
  }
];

const REPS_OPTIONS = [5, 10, 15, 20, 25, 30, 40, 50];
const SETS_OPTIONS = [1, 2, 3, 4, 5];
const DISTANCE_OPTIONS = Array.from({ lenght: 10 }, (_, i) => i * 0.5);
const DURATION_OPTIONS = Array.from({ length: 13 }, (_, i) => i * 5);

console.log(workoutExercises);

const WorkoutForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const onSubmit = (data) => {
    axios.post("http://localhost:8000/workouts", data)
      .then(() => {
      })
      .catch(error => {
        console.error('There was an error!', error);
      });
  };


  return (
    <form className='formContainer' onSubmit={handleSubmit(onSubmit)}>
      <div className='fitName'>
        <input
          id='fitname'
          type='text'
          placeholder='トレーニング名を入力'
          {...register("fitname", { required: "トレーニング名を入力してください" })}
        />
        {errors.fitname && <p>{errors.fitname.message}</p>}
      </div>

      <div className='setNumber'>
        <input
          id='setNumber'
          type='number'
          placeholder='セット数を入力'
          {...register("setNumber", { min: 1, max: 99, required: "セット数を入力してください" })}
        />
        <span>set</span>
        {errors.setNumber && <p>{errors.setNumber.message}</p>}
      </div>

      <div className='repsNumber'>
        <input
          id='repsNumber'
          type='number'
          placeholder='回数を入力'
          {...register("repsNumber", { required: "回数を入力してください" })}
        />
        <span>回</span>
      </div>
      <div>
        <button type='submit'>送信</button>
      </div>
    </form>
  )
}

export default WorkoutForm