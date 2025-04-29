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

## ライセンス

MIT
