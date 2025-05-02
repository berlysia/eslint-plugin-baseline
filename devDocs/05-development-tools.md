# ESLint Baseline Plugin 開発ツール

このドキュメントでは、eslint-plugin-baselineの開発に使用するツールとコマンドについて説明します。

## 開発用コマンド

### コード整形とリント

- `npm run format` - Prettierを使用してコードを整形

  - プロジェクト全体のコードスタイルを統一するために使用します
  - コミット前に実行することを推奨します

- `npm run lint` - ESLintを使用してコードをリント

  - コードの問題を検出します
  - `npm run lint:fix` でリント問題の自動修正を試みます

- `npm run typecheck` - TypeScriptの型チェックを実行
  - 型の整合性を検証します

### テスト実行

- `npm run test` - テストを実行

  - 実装したルールのテストを実行します

- `npm run agent:check` - 各種検証を一括実行
  - `npm run test`（テスト実行）
  - `npm run typecheck`（型チェック）
  - `npm run lint`（リント）
  - 実装完了の確認前に必ず実行してください

## AST解析ツール

AST（抽象構文木）の解析は、ルール開発において非常に重要です。以下のツールを使用して、コードのASTを分析できます。

### Acorn パーサーを使用したAST解析

```bash
npm run agent:ast:acorn -- --code "const arr = [1, 2, 3]; arr.at(0);"
```

#### オプション

- `--code "<コード>"` - 解析対象のJavaScriptコードを指定します
- `--jsx` - JSXの解析を有効にします

#### 出力

コードのASTがJSON形式で出力されます。これにより、ESLintルールで扱うノードの種類や構造を確認できます。

### TypeScript ESTreeを使用したAST解析

```bash
npm run agent:ast:typescript -- --code "const arr = [1, 2, 3]; arr.at(0);"
```

#### オプション

- `--code "<コード>"` - 解析対象のTypeScriptコードを指定します
- `--jsx` - JSXの解析を有効にします

#### 出力

TypeScriptのASTと型情報がJSON形式で出力されます。これにより、型情報を利用した高度なルール開発が可能になります。

## ルール開発ツール

### 次に実装するルールの情報取得

```bash
npm run agent:rules:next
```

このコマンドは、次に実装すべきルールの情報を取得します。

#### 出力

- `ruleName`: 実装すべきルール名
- `description`: ルールの説明
- `seedPath`: 機能のサポート状況データへのパス
- `mdnUrl`: MDNのドキュメントURL（存在する場合）
- `specUrl`: 仕様書URL（存在する場合）

#### 注意事項

- すべてのルールが実装済みの場合はエラーを返します
- 連続でこのコマンドを複数回実行することは禁止されています
- 結果が受け取れなかった場合は、新規に作成されたファイルを確認してください

### ルールの雛形生成

```bash
npm run agent:rules:scaffold -- --ruleName "Array.prototype.at" --methodKind "instance"
```

このコマンドは、指定されたルール名で新しいルールの雛形を生成します。

#### オプション

- `--ruleName "<ルール名>"` - 実装するルール名を指定します
- `--methodKind <instance|static>` - メソッドの種類を指定します
  - `instance`: インスタンスメソッド（例: `Array.prototype.at`）
  - `static`: 静的メソッド（例: `Array.of`）

#### 生成されるファイル

- `src/rules/<ルール名>.ts`: ルールの実装ファイル
- `test/rules/<ルール名>.test.ts`: テストファイル

#### 注意事項

- ルール名は元の名前（エスケープなし）を指定します
- 雛形には基本的なルール構造とテストケースが含まれます

### ルールの登録

```bash
npm run agent:rules:add <compatKey>
```

このコマンドは、実装したルールを `src/rules/index.ts` に登録します。これにより、ルールのインポートと登録が自動的に行われます。

#### 注意事項

- このコマンドは、実装が完了したルールに対してのみ実行してください
- 登録前に `npm run agent:check` でテストと検証が成功していることを確認してください

## 開発フロー

1. `npm run agent:rules:next` で次のルール情報を取得
2. mdnUrlやspecUrlを確認して、実装対象について調査
3. `npm run agent:rules:scaffold` でルールの雛形を生成
4. ルールを実装し、テストを作成
5. `npm run agent:check` で検証
6. 問題がなければ `npm run agent:rules:add` でルールを登録
7. 変更をコミット

このワークフローに従うことで、効率的かつ一貫性のあるルール開発が可能になります。
