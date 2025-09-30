# 医療免責事項（Medical Disclaimer）

## ⚠️ 重要なお知らせ

FitStartは医療機器ソフトウェア（SaMD: Software as a Medical Device）ではありません。

## 📋 免責事項全文

### 日本語版

```
【医療情報提供に関する重要な免責事項】

FitStart（以下「本サービス」）が提供する健康スコア、運動指標、健康に関する情報（以下「健康情報」）は、
一般的な健康情報の提供を目的としており、医学的診断、治療、予防を目的としたものではありません。

1. 医療行為の代替ではありません
   本サービスは、医師、薬剤師、その他の医療専門家による診断、治療、助言の代替となるものではありません。
   健康に関する決定を行う前に、必ず適切な医療専門家にご相談ください。

2. 個別の医学的助言ではありません
   提供される情報は、WHO（世界保健機関）および厚生労働省の一般的なガイドラインに基づいていますが、
   個人の健康状態、既往歴、体質、服用薬等を考慮したものではありません。

3. 緊急時の対応
   医療上の緊急事態が発生した場合は、直ちに119番通報するか、最寄りの医療機関を受診してください。
   本サービスは緊急医療の代替手段ではありません。

4. 運動プログラムの開始前に
   新しい運動プログラムを開始する前に、特に以下の場合は医師にご相談ください：
   - 心臓疾患、高血圧、糖尿病などの持病がある場合
   - 妊娠中または妊娠の可能性がある場合
   - 65歳以上の場合
   - 長期間運動をしていなかった場合

5. 責任の制限
   本サービスの利用により生じたいかなる損害についても、当社は責任を負いません。
   健康情報の正確性、完全性、有用性について保証するものではありません。

最終更新日：2025年9月26日
FitStart運営チーム
```

### 英語版（English Version）

```
MEDICAL DISCLAIMER

The health scores, exercise metrics, and health-related information ("Health Information")
provided by FitStart ("the Service") are for general informational purposes only and are
not intended for medical diagnosis, treatment, or prevention.

1. NOT A SUBSTITUTE FOR PROFESSIONAL MEDICAL ADVICE
   The Service is not a substitute for diagnosis, treatment, or advice from physicians,
   pharmacists, or other healthcare professionals. Always consult qualified healthcare
   professionals before making health decisions.

2. NOT PERSONALIZED MEDICAL ADVICE
   Information provided is based on general guidelines from WHO and relevant health
   authorities but does not consider individual health conditions, medical history,
   constitution, or medications.

3. EMERGENCY SITUATIONS
   In case of medical emergency, immediately call emergency services or visit the
   nearest medical facility. The Service is not a substitute for emergency care.

4. BEFORE STARTING EXERCISE
   Consult your physician before starting any exercise program, especially if you have:
   - Heart disease, hypertension, diabetes, or other chronic conditions
   - Are pregnant or may be pregnant
   - Are 65 years or older
   - Have been inactive for an extended period

5. LIMITATION OF LIABILITY
   We assume no responsibility for any damages arising from the use of the Service.
   We do not guarantee the accuracy, completeness, or usefulness of Health Information.

Last Updated: September 26, 2025
FitStart Team
```

## 🏥 SaMD非該当の根拠

### 定義確認

```typescript
// 医療機器該当性チェックリスト
const SAMD_CRITERIA = {
  diagnosis: false,    // 診断機能なし
  treatment: false,    // 治療機能なし
  prevention: false,   // 予防（医学的）機能なし
  monitoring: false,   // 医学的モニタリング機能なし

  // FitStartの機能
  information: true,   // 一般的な健康情報提供
  tracking: true,      // 運動記録
  visualization: true, // データ可視化
  export: true        // データエクスポート
};
```

### 規制対応マトリクス

| 国・地域 | 規制 | 該当性 | 根拠 |
|---------|------|--------|------|
| 日本 | 薬機法 | 非該当 | 診断・治療目的なし |
| EU | MDR | 非該当 | 医療目的なし |
| 米国 | FDA | 非該当 | General Wellness |
| 中国 | NMPA | 非該当 | 健康管理用途 |

## 🚫 禁止表現リスト

### 使用してはいけない表現

```javascript
const PROHIBITED_TERMS = [
  // 診断系
  '診断', 'diagnosis', '病気を発見', 'detect disease',

  // 治療系
  '治療', 'treatment', '改善', 'cure', '治す',

  // 予防系（医学的）
  '予防', 'prevent disease', '発症を防ぐ',

  // 効果効能
  '効く', 'effective for', '○○に効果的',

  // 医学的判断
  '正常', 'abnormal', '異常', 'pathological'
];
```

### 使用可能な表現

```javascript
const ALLOWED_TERMS = [
  // 情報提供
  '参考情報', 'general information', '一般的なガイドライン',

  // 記録・追跡
  '記録', 'track', '可視化', 'visualize',

  // 健康管理
  '健康管理', 'health management', 'wellness',

  // 推奨（一般的）
  'WHO推奨', 'general recommendation', '一般的に推奨される'
];
```

## 📱 UI実装ガイドライン

### 初回起動時の表示

```typescript
class MedicalDisclaimerModal {
  async showOnFirstLaunch() {
    const hasAccepted = await this.checkPreviousAcceptance();

    if (!hasAccepted) {
      const modalContent = {
        title: '医療に関する重要なお知らせ',
        content: MEDICAL_DISCLAIMER_TEXT,
        buttons: [
          {
            text: '理解しました',
            action: this.acceptDisclaimer,
            primary: true
          },
          {
            text: '詳細を読む',
            action: this.showFullDisclaimer,
            primary: false
          }
        ],
        dismissible: false // 必須確認
      };

      await this.displayModal(modalContent);
    }
  }
}
```

### 常時表示フッター

```tsx
const DisclaimerFooter: React.FC = () => {
  return (
    <footer className="disclaimer-footer">
      <p>
        <InfoIcon />
        本サービスは一般的な健康情報の提供を目的としており、
        医学的診断・治療・予防を目的としたものではありません。
        <a href="/disclaimer">詳細</a>
      </p>
    </footer>
  );
};
```

### 健康スコア表示時の注記

```tsx
const HealthScoreCard: React.FC = ({ score }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h4">
          健康スコア: {score}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          ※ このスコアは一般的な運動ガイドラインに基づく参考値です。
          医学的評価ではありません。
        </Typography>
      </CardContent>
    </Card>
  );
};
```

## 📋 コンプライアンスチェックリスト

### 開発時チェック

```typescript
const COMPLIANCE_CHECKLIST = {
  ui: [
    '免責事項が表示されているか',
    '医療用語を使用していないか',
    '「参考情報」であることが明記されているか'
  ],

  api: [
    '診断的な判定を返していないか',
    'エラー時に医療助言をしていないか'
  ],

  documentation: [
    'READMEに免責事項があるか',
    '利用規約に記載があるか',
    'プライバシーポリシーと整合性があるか'
  ],

  marketing: [
    '広告に医療効果を謳っていないか',
    'ユーザーレビューに医療効果の記載がないか'
  ]
};
```

### リリース前チェック

```bash
#!/bin/bash
# compliance-check.sh

echo "Medical Disclaimer Compliance Check"
echo "===================================="

# 1. 禁止用語チェック
echo "Checking prohibited terms..."
grep -r "診断\|治療\|予防\|効果\|改善" ./frontend/src
grep -r "diagnosis\|treatment\|prevent\|cure" ./frontend/src

# 2. 免責表示チェック
echo "Checking disclaimer display..."
grep -r "MedicalDisclaimer" ./frontend/src/components
grep -r "disclaimer" ./frontend/public/index.html

# 3. APIレスポンスチェック
echo "Checking API responses..."
grep -r "normal\|abnormal\|pathological" ./backend/routes

echo "Check complete. Review results above."
```

## 🏢 法務相談ポイント

### 確認すべき事項

1. **表現の適切性**
   - 現在の免責文言で十分か
   - 追加すべき注意事項はあるか

2. **表示方法**
   - 初回のみの表示で良いか
   - 定期的な再表示は必要か

3. **同意取得**
   - 明示的な同意ボタンが必要か
   - 同意ログの保存期間

4. **国際対応**
   - 各国の規制への対応
   - 翻訳の正確性確認

## 📚 参考資料

### 規制ガイドライン

- [厚生労働省: プログラムの医療機器該当性](https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/0000179749_00004.html)
- [FDA: General Wellness Policy](https://www.fda.gov/media/90652/download)
- [EU MDR: Medical Device Regulation](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32017R0745)

### 業界ベストプラクティス

- Apple Health: 明確な免責表示
- Google Fit: 医療助言でないことを強調
- Fitbit: 一般的なウェルネス情報として位置づけ

---

**作成日**: 2025年9月26日
**バージョン**: 1.0.0
**作成者**: FitStart Tech Lead
**法務確認**: 未実施（要確認）