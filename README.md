# eslint-plugin-baseline

ブラウザの機能サポート状況に基づいて、コードがユーザーの期待するBaselineを満たしているかを検証するESLintプラグイン。

## 概要

このプラグインは、[compute-baseline](https://www.npmjs.com/package/compute-baseline)を利用して、コードで使用されている機能が指定された基準日時点で十分にサポートされているかをチェックします。

## 進捗状況

### 完了済み

- [x] 基本設計の確立
  - [x] 設計パターンの検討と決定（ハイブリッドアプローチ採用）
  - [x] 設定構造の設計
  - [x] 基本設計ドキュメントの作成

### 進行中

- [ ] コア機能の実装
  - [ ] 各ルールの実装
    - `npm run agent:rules:next` で次に実装するルールの情報を取得
      - コマンドが失敗したら、実装は完了
    - seedPathにあるJSONを `jq` コマンドで読む。 `description` と `mdn_url` と `spec_url` を取得し、理解する。
    - rulePathにファイルを作成し、ルールを実装する。
      - 対応するテストを実装しながら開発する。
      - すでに実装されているルールやテストを参考にすべきである。
      - シンタックスレベルの機能は、その構文で判定する。
        - 例: `import` 文は `ImportDeclaration` ノードで判定する。
        - 例: `class` 文は `ClassDeclaration` ノードで判定する。
        - 例: `async` 関数は `FunctionDeclaration` ノードで判定する。
      - オブジェクトやメンバーの存在を確認する場合は、型情報を使用する。
        - 例: `AggregateError` は `AggregateError` 型で判定する。
        - 例: `AggregateError.prototype.errors` は `.errors` へのアクセスのレシーバが `AggregateError` 型のオブジェクトかどうかで判定する。
      - seedPathのファイルへの参照をルール内に持つことは禁止されている。
        - `npm run agent:ast:acorn` でASTを生成し、役立てる。
        - `npm run agent:ast:typescript` でTypeScriptのASTを生成し、役立てる。
      - `npm run test` でテストを実行し、ルールが正しく動作することを確認する。
      - `src/index.ts` にルールを追加する。
  - [ ] 統合ルールの実装
  - [ ] 設定ファクトリ関数の実装
  - [ ] ディテクターの実装
  - [ ] キャッシング機構の実装

### 予定

- [ ] 追加機能

  - [ ] 個別ルールのテンプレート作成
  - [ ] パフォーマンス最適化
  - [ ] エラーメッセージのローカライズ
  - [ ] CSS機能のサポート（別プラグインとして）

- [ ] ドキュメント
  - [ ] API リファレンス
  - [ ] 設定ガイド
  - [ ] 貢献ガイド
  - [ ] プラグイン分割ガイドライン

## 設計方針

詳細な設計ドキュメントは[devDocs](./devDocs)を参照してください。

- コアとなる機能は統合ルールで提供
  - 一般的なECMAScript機能のサポート検証
  - パフォーマンスを重視したキャッシング機構
- 特殊なケースは個別ルールで対応
  - 特別な検証ロジックが必要な機能
  - CSSなど、異なるドメインの機能
- 柔軟な設定システム
  - グローバル設定とオーバーライド設定をサポート
  - 機能ごとの細かい制御が可能

## エージェント向け開発用ツール

- `npm run agent:ast:acorn` - Acornを使用してASTを生成
  - `--code` 文字列でコードを与える
  - `--jsx` JSXを有効にする
- `npm run agent:ast:typescript` - TypeScript ESTreeを使用してASTを生成
  - `--code` 文字列でコードを与える
  - `--jsx` JSXを有効にする
- `npm run agent:rules:next` - 次に実装するルールの情報を取得
