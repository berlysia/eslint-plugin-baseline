# ESLint Baseline Plugin 設定構造

このドキュメントでは、eslint-plugin-baselineの設定構造とその利用方法について説明します。

## 基本的な設定構造

eslint-plugin-baselineの設定は、`BaselineConfig`インターフェースに基づいています：

```typescript
interface BaselineConfig {
    // 基準となる日付（必須）
    asOf?: Date;
    
    // 必要なサポート範囲（必須）
    // - widely: 広くサポートされていること（複数の主要ブラウザでサポート）
    // - newly: 新たにサポートが開始された（一部のブラウザでサポート）
    support: "widely" | "newly";
    
    // オプション：特定の機能に対する個別設定
    overrides?: Record<
        string,
        {
            // 個別機能のサポート範囲（省略時はグローバル設定を使用）
            support?: "widely" | "newly";
            
            // 機能の有効/無効を明示的に指定
            enabled?: boolean;
        }
    >;
}
```

## 設定ファクトリ関数

eslint-plugin-baselineは、設定を簡単に作成するための`createConfig`関数を提供しています：

```typescript
function createConfig(config: BaselineConfig) {
    // 設定を生成して返す
    // 返り値はESLintの設定オブジェクト
}
```

## 使用例

### 基本的な使用方法

```javascript
// .eslintrc.js
module.exports = {
    extends: [
        ...createConfig({
            asOf: new Date("2025-04-19"),
            support: "widely",
        }),
    ],
};
```

この設定は、2025年4月19日時点で広くサポートされている機能のみを許可します。

### オーバーライド設定を使用した例

```javascript
// .eslintrc.js
module.exports = {
    extends: [
        ...createConfig({
            asOf: new Date("2025-04-19"),
            support: "widely",
            overrides: {
                // オプショナルチェーンには異なる基準を適用
                "optional-chaining": {
                    support: "newly",
                },
                // BigIntは明示的に無効化
                "BigInt": {
                    enabled: false,
                },
                // Promiseは明示的に有効化
                "Promise": {
                    enabled: true,
                },
            },
        }),
    ],
};
```

この設定では：

1. 基本的には2025年4月19日時点で広くサポートされている機能を許可
2. オプショナルチェーン（`?.`）については、「新たにサポートが開始された」基準を適用
3. `BigInt`は明示的に使用を禁止
4. `Promise`は明示的に使用を許可

## 設定の優先順位

設定の適用には以下の優先順位があります：

1. 個別のオーバーライド設定（`overrides`で指定）
2. グローバル設定（`asOf`と`support`で指定）
3. デフォルト値（`support: "widely"`）

## ハイブリッド方式における設定

eslint-plugin-baselineは「ハイブリッド方式」を採用しています。これは、基本機能は統合ルールで提供し、特殊な要件がある機能のみ個別ルールとして実装するアプローチです。

### 統合ルールの設定

統合ルールは、`createConfig`関数で生成される設定を通じて制御されます。これにより、大多数の機能に対して一貫した設定を適用できます。

### 個別ルールの設定

特殊な要件がある機能については、個別ルールが提供されます。これらのルールは、以下のように明示的に設定することも可能です：

```javascript
// .eslintrc.js
module.exports = {
    extends: [
        ...createConfig({
            asOf: new Date("2025-04-19"),
            support: "widely",
        }),
    ],
    rules: {
        // 個別ルールの設定
        "baseline/array-at": ["error", {
            asOf: "2023-01-01",
            support: "newly",
        }],
    },
};
```

この場合、`array-at`ルールは統合ルールの設定ではなく、個別に指定された設定に従います。

## 実際のユースケース

### 保守的な設定（互換性重視）

```javascript
// .eslintrc.js
module.exports = {
    extends: [
        ...createConfig({
            asOf: new Date("2022-01-01"), // より古い日付を使用
            support: "widely", // 広くサポートされていることを要求
        }),
    ],
};
```

この設定は、2022年1月時点で広くサポートされている機能のみを許可します。これにより、より広範なブラウザ互換性が確保されます。

### 先進的な設定（最新機能活用）

```javascript
// .eslintrc.js
module.exports = {
    extends: [
        ...createConfig({
            asOf: new Date("2025-01-01"), // より新しい日付を使用
            support: "newly", // 新たにサポートが開始された機能も許可
        }),
    ],
};
```

この設定は、2025年1月時点で一部のブラウザでサポートされ始めた機能も許可します。最新の機能を積極的に活用したい場合に適しています。

### ハイブリッド設定（機能ごとに判断）

```javascript
// .eslintrc.js
module.exports = {
    extends: [
        ...createConfig({
            asOf: new Date("2023-06-01"),
            support: "widely",
            overrides: {
                // 特定の最新機能だけ許可
                "array-at": { support: "newly" },
                "optional-chaining": { support: "newly" },
                "nullish-coalescing": { support: "newly" },
                
                // レガシー互換性が特に重要な機能
                "promise-any": { support: "widely", asOf: "2022-01-01" },
                "intl": { support: "widely", asOf: "2021-01-01" },
            },
        }),
    ],
};
```

この設定では、基本的には2023年6月時点で広くサポートされている機能を許可しつつ、特定の便利な新機能（`Array.prototype.at`、オプショナルチェーン、Nullish結合演算子）については新しい基準を適用します。一方、`Promise.any`や国際化機能については、より厳格な基準を適用しています。

## 設定のベストプラクティス

1. **明確な基準日の設定**
   - プロジェクトのターゲットブラウザに合わせて適切な基準日を設定します
   - 基準日は定期的に見直し、更新することを推奨します

2. **必要に応じたオーバーライド**
   - 特に重要な機能や、特に注意が必要な機能についてはオーバーライドを検討します
   - オーバーライドは最小限に留め、設定の複雑化を避けます

3. **段階的な移行**
   - レガシープロジェクトでは、まず保守的な設定から始め、徐々に基準日を更新していくアプローチが効果的です
   - 新機能を試験的に導入する場合は、特定の機能のみオーバーライドすることを検討します
