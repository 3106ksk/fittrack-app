# UIコンポーネント仕様書

## 🎨 デザインシステム

### カラーパレット
```scss
// プライマリカラー
$primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
$primary-main: #667eea;
$primary-light: #8b9dff;
$primary-dark: #4c5eb8;

// セカンダリカラー
$secondary-main: #f50057;
$secondary-light: #ff5472;
$secondary-dark: #bb002f;

// 成功・警告・エラー
$success-main: #4caf50;
$warning-main: #ff9800;
$error-main: #f44336;
$info-main: #2196f3;

// グレースケール
$grey-50: #fafafa;
$grey-100: #f5f5f5;
$grey-200: #eeeeee;
$grey-300: #e0e0e0;
$grey-400: #bdbdbd;
$grey-500: #9e9e9e;
$grey-600: #757575;
$grey-700: #616161;
$grey-800: #424242;
$grey-900: #212121;

// 健康スコアカラー
$score-excellent: #00c853;  // 80-100
$score-good: #64dd17;       // 60-79
$score-moderate: #ffd600;   // 40-59
$score-needs-improvement: #ff6d00; // 20-39
$score-poor: #d50000;       // 0-19
```

### タイポグラフィ
```typescript
const typography = {
  h1: { fontSize: '2.5rem', fontWeight: 700, lineHeight: 1.2 },
  h2: { fontSize: '2rem', fontWeight: 600, lineHeight: 1.3 },
  h3: { fontSize: '1.75rem', fontWeight: 600, lineHeight: 1.4 },
  h4: { fontSize: '1.5rem', fontWeight: 500, lineHeight: 1.4 },
  h5: { fontSize: '1.25rem', fontWeight: 500, lineHeight: 1.5 },
  h6: { fontSize: '1rem', fontWeight: 500, lineHeight: 1.6 },
  body1: { fontSize: '1rem', fontWeight: 400, lineHeight: 1.5 },
  body2: { fontSize: '0.875rem', fontWeight: 400, lineHeight: 1.43 },
  caption: { fontSize: '0.75rem', fontWeight: 400, lineHeight: 1.66 },
};
```

## 📦 コンポーネント仕様

### SmallWinCard

**パス**: `/frontend/src/components/SmallWinCard.tsx`

#### Props
```typescript
interface SmallWinCardProps {
  type: 'daily' | 'weekly' | 'achievement';
  score: number;
  level?: 'excellent' | 'good' | 'moderate' | 'needs_improvement' | 'poor';
  rationale: {
    weeklyMinutes?: number;
    targetMinutes?: number;
    streakDays?: number;
    weekOverWeekChange?: number;
    healthBenefit?: HealthBenefit;
  };
  recommendations?: string[];
  onDetailsClick?: () => void;
}

interface HealthBenefit {
  level: 'gold' | 'silver' | 'bronze';
  message: string;
  evidence?: string;
}
```

#### 使用例
```tsx
<SmallWinCard
  type="daily"
  score={85}
  level="excellent"
  rationale={{
    weeklyMinutes: 157,
    targetMinutes: 150,
    streakDays: 7,
    weekOverWeekChange: 12,
    healthBenefit: {
      level: 'gold',
      message: 'WHO推奨達成：心疾患リスク30%減'
    }
  }}
  recommendations={[
    'Zone2運動を追加で15分',
    '週末も継続して連続記録を伸ばしましょう'
  ]}
/>
```

#### ビジュアルデザイン
```
┌──────────────────────────────────────┐
│ 今日の健康スコア              ⓘ  85 │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  /100│
│                                      │
│ [!] WHO推奨達成：心疾患リスク30%減    │
│                                      │
│ WHO推奨運動量（週150分）             │
│ ████████████████████░ 157/150分     │
│                                      │
│ [🔥7日連続] [📈前週比+12%] [🏆達成]  │
└──────────────────────────────────────┘
```

---

### ConsentToggle

**パス**: `/frontend/src/components/ConsentToggle.tsx`

#### Props
```typescript
interface ConsentToggleProps {
  consentType: 'dataUsage' | 'stravaSync' | 'exportData' | 'analytics';
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  required?: boolean;
}
```

#### 使用例
```tsx
<ConsentToggle
  consentType="dataUsage"
  title="運動データの健康指標への変換"
  description="運動記録をWHO推奨基準に基づく健康指標に変換します"
  checked={consents.dataUsage}
  onChange={(checked) => handleConsentChange('dataUsage', checked)}
/>
```

---

### ExportButton

**パス**: `/frontend/src/components/ExportButton.tsx`

#### Props
```typescript
interface ExportButtonProps {
  format: 'pdf' | 'csv';
  startDate?: Date;
  endDate?: Date;
  variant?: 'contained' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  disabled?: boolean;
  onSuccess?: (blob: Blob) => void;
  onError?: (error: Error) => void;
}
```

#### 使用例
```tsx
<ExportButton
  format="pdf"
  startDate={new Date('2025-08-01')}
  endDate={new Date('2025-09-26')}
  variant="contained"
  onSuccess={(blob) => console.log('PDFダウンロード成功')}
/>
```

---

### HealthMetricCard

**パス**: `/frontend/src/components/HealthMetricCard.tsx`

#### Props
```typescript
interface HealthMetricCardProps {
  title: string;
  value: number | string;
  unit: string;
  icon: React.ReactElement;
  color: string;
  target?: number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
}
```

#### ビジュアルデザイン
```
┌─────────────────┐
│ 🏃 週間運動時間  │
│                 │
│   157 分        │
│   ━━━━━━━━━━    │
│   目標: 150分   │
│                 │
│ ↑ +12% vs 先週  │
└─────────────────┘
```

---

### PrivacyBanner

**パス**: `/frontend/src/components/PrivacyBanner.tsx`

#### Props
```typescript
interface PrivacyBannerProps {
  show: boolean;
  onAccept: () => void;
  onManage: () => void;
  onClose?: () => void;
}
```

#### 使用例
```tsx
<PrivacyBanner
  show={!hasAcceptedPrivacy}
  onAccept={handleAcceptAll}
  onManage={() => navigate('/settings/consent')}
/>
```

---

### AchievementBadge

**パス**: `/frontend/src/components/AchievementBadge.tsx`

#### Props
```typescript
interface AchievementBadgeProps {
  type: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: Date;
  level?: 'bronze' | 'silver' | 'gold' | 'platinum';
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
}
```

#### ビジュアルデザイン
```
    ⭐️
  ╱────╲
 │ 150 │  週間目標達成
  ╲────╱  WHO推奨運動量クリア
```

## 📱 レスポンシブデザイン

### ブレークポイント
```typescript
const breakpoints = {
  xs: 0,     // モバイル
  sm: 600,   // タブレット縦
  md: 960,   // タブレット横
  lg: 1280,  // デスクトップ
  xl: 1920   // 大画面
};
```

### グリッドシステム
```tsx
// デスクトップ（3カラム）
<Grid container spacing={3}>
  <Grid item xs={12} md={4}>
    <SmallWinCard />
  </Grid>
  <Grid item xs={12} md={4}>
    <HealthMetricCard />
  </Grid>
  <Grid item xs={12} md={4}>
    <AchievementBadge />
  </Grid>
</Grid>

// モバイル（1カラム）
<Stack spacing={2}>
  <SmallWinCard />
  <HealthMetricCard />
  <AchievementBadge />
</Stack>
```

## 🎭 アニメーション

### トランジション
```scss
// カード出現
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// スコア更新
@keyframes scoreUpdate {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

// プログレスバー
.progress-bar {
  transition: width 0.6s ease-in-out;
}
```

### インタラクション
```typescript
const interactions = {
  hover: {
    card: { transform: 'translateY(-4px)', boxShadow: 4 },
    button: { backgroundColor: 'rgba(0,0,0,0.08)' }
  },
  press: {
    button: { transform: 'scale(0.95)' }
  },
  focus: {
    input: { borderColor: 'primary.main', borderWidth: 2 }
  }
};
```

## ♿ アクセシビリティ

### ARIA属性
```tsx
<Card
  role="article"
  aria-label="健康スコアカード"
  tabIndex={0}
>
  <CardContent>
    <Typography id="score-label" variant="h6">
      今日の健康スコア
    </Typography>
    <Typography
      aria-labelledby="score-label"
      aria-valuenow={85}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      85点
    </Typography>
  </CardContent>
</Card>
```

### キーボードナビゲーション
```typescript
const handleKeyDown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'Enter':
    case ' ':
      handleClick();
      break;
    case 'Escape':
      handleClose();
      break;
    case 'Tab':
      // フォーカス管理
      break;
  }
};
```

## 🌐 国際化（i18n）

```typescript
const translations = {
  ja: {
    smallWins: {
      title: '今日の健康スコア',
      whoTarget: 'WHO推奨運動量',
      streak: '連続日数',
      weekOverWeek: '前週比'
    }
  },
  en: {
    smallWins: {
      title: "Today's Health Score",
      whoTarget: 'WHO Recommended Exercise',
      streak: 'Streak Days',
      weekOverWeek: 'Week over Week'
    }
  }
};
```

## 🧪 Storybook

```typescript
// SmallWinCard.stories.tsx
export default {
  title: 'Components/SmallWinCard',
  component: SmallWinCard,
  parameters: {
    layout: 'centered'
  }
};

export const Default = {
  args: {
    score: 85,
    type: 'daily'
  }
};

export const Perfect = {
  args: {
    score: 100,
    type: 'daily',
    level: 'excellent'
  }
};

export const NeedsImprovement = {
  args: {
    score: 35,
    type: 'daily',
    level: 'needs_improvement'
  }
};
```

---

**作成日**: 2025年9月26日
**バージョン**: 1.0.0
**作成者**: FitStart Tech Lead