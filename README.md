# eslint-plugin-baseline

ブラウザの機能サポート状況に基づいて、コードがユーザーの期待するBaselineを満たしているかを検証するESLintプラグイン。

## 開発ステータス

本プラグインは現在開発中です。最新の実装状況については [実装状況とガイドライン](./devDocs/03-implementation.md) を参照してください。

## 概要

このプラグインは、[compute-baseline](https://www.npmjs.com/package/compute-baseline)を利用して、コードで使用されている機能が指定された基準日時点で十分にサポートされているかをチェックします。

## 主な特徴

- **柔軟な設定オプション**: 基準日とサポートレベル（widely/newly）を設定可能
- **ハイブリッドアプローチ**: 基本機能は統合ルールで、特殊なケースは個別ルールで対応
- **ECMAScript機能検証**: 最新のJavaScript機能のサポート状況を検証
- **パフォーマンス重視**: 効率的なキャッシング機構を実装

## 設計方針

- **コアとなる機能は統合ルールで提供**
  - 一般的なECMAScript機能のサポート検証
  - パフォーマンスを重視したキャッシング機構
- **特殊なケースは個別ルールで対応**
  - 特別な検証ロジックが必要な機能
  - CSSなど、異なるドメインの機能
- **柔軟な設定システム**
  - グローバル設定とオーバーライド設定をサポート
  - 機能ごとの細かい制御が可能
- **多様なJavaScriptパターンへの対応**
  - 文字列リテラル、計算プロパティ、call/applyパターンなど様々な書き方に対応
  - 分割代入や変数経由のメソッド呼び出しなど高度なパターンをサポート
  - 配列リテラルメソッド呼び出し（`[].slice.call(arguments)`）などの特殊パターンも検出

## インストール

```bash
npm install eslint-plugin-baseline --save-dev
```

## 基本的な使用方法

```javascript
// eslint.config.js
import { createConfig } from "eslint-plugin-baseline";

export default [
	...createConfig({
		asOf: new Date("2025-01-01"),
		support: "widely",
	}),
];
```

## 詳細ドキュメント

詳細なドキュメントは [devDocs](./devDocs) ディレクトリを参照してください。

- [導入と全体概要](./devDocs/00-introduction.md)
- [設計パターン](./devDocs/01-design-patterns.md)
- [設定構造と使用例](./devDocs/02-configuration.md)
- [実装状況とガイドライン](./devDocs/03-implementation.md)
- [テストケースのガイドライン](./devDocs/04-testing-guidelines.md)
- [開発ツール](./devDocs/05-development-tools.md)
- [実装パターンと対応方法](./devDocs/06-implementation-patterns.md)

## 開発コマンド

```bash
# 次に実装すべきルールを検索
npm run agent:rules:next

# ルール名からプロパティタイプ（メソッド/プロパティ、Static/Instance）を事前に検出
npm run agent:rules:detect -- --ruleName javascript.builtins.Array.at

# 静的メソッド/プロパティのルールスカフォールドを生成
npm run agent:rules:scaffold -- --ruleName javascript.builtins.Array.fromAsync

# 明示的にバリデータを指定してルールスカフォールドを生成
npm run agent:rules:scaffold -- --ruleName javascript.builtins.Array.from --validator createStaticMethodValidator

# インスタンスメソッド/プロパティのルールスカフォールドを生成
npm run agent:rules:scaffold -- --ruleName javascript.builtins.Array.at

# ルールをインデックスファイルに追加
npm run agent:rules:add javascript.builtins.Array.fromAsync

# バリデータ情報の生成（スカフォールド生成に必要）
npm run agent:rules:validators

# URLからプロパティタイプを解析
node scripts/tools/analyzeUrlForPropertyType.ts --mdnUrl <MDN URL> --specUrl <SPEC URL>
```

## 特殊なケースの処理

一部のプロパティやメソッドは典型的な命名規則に従わず、インスタンスメンバーなのかstaticメンバーなのかを自動で判別することが難しい場合があります。これらの特殊なケースについては、`scripts/data/property_corrections.json`のメタデータファイルを使用して対応しています。

例:

```json
{
	"javascript.builtins.ArrayBuffer.detached": {
		"propertyType": "instance",
		"concern": "ArrayBuffer.prototype.detached",
		"notes": "ruleName内に'prototype'がなくてもインスタンスプロパティ"
	},
	"javascript.builtins.ArrayBuffer.byteLength": {
		"propertyType": "instance",
		"concern": "ArrayBuffer.prototype.byteLength",
		"notes": "ruleName内に'prototype'がなくてもインスタンスプロパティ"
	}
}
```

プロパティタイプの判定には、以下の3つの戦略が順番に使用されます:

1. 既知の特殊ケースについてはメタデータファイルをチェック
2. MDN URLと仕様URLを分析してプロパティタイプを推論
3. ルール名分析（パス内の"prototype"の有無をチェック）にフォールバック

## ライセンス

MIT
