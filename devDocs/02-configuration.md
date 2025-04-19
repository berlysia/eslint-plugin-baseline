# ESLint Baseline Plugin 設定構造

## 設定ファクトリ関数

```typescript
interface BaselineConfig {
  // 基準となる日付
  asOf?: Date;
  // 必要なサポート範囲（widely, newly）
  support: "widely" | "newly";
  // オプション：特定の機能に対する個別設定
  overrides?: {
    [feature: string]: {
      support?: "widely" | "newly";
      enabled?: boolean;
    };
  };
}

function createConfig(config: BaselineConfig) {
  // 設定を生成して返す
}
```

## 使用例

```typescript
// .eslintrc.js
module.exports = {
  extends: [
    ...createConfig({
      asOf: new Date("2025-04-19"),
      support: "widely",
      overrides: {
        "optional-chaining": {
          support: "newly"
        }
      }
    })
  ]
}
```

## 設定の優先順位

1. 個別のオーバーライド設定
2. グローバル設定
3. デフォルト値（widely）