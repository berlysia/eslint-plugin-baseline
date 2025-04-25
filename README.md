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
    - **注意**: 実装済みルールの一覧は、規模が大きくなるため本READMEには含めていません。
      - どうしても必要ならば、全てを読み込まなくてよいようなツールを新規に作成します。
    - `npm run agent:rules:next` で次に実装するルールの情報を取得
      - コマンドが失敗したら、実装は完了
      - 連続でこのコマンドを複数回実行することは禁止されます。ファイルが新規に作成されているはずなので、結果が受け取れなかった場合は作成されたファイルを確認します。
    - mdnUrlやspecUrlを確認して、実装対象について調査します。
      - 実装対象がインスタンスメソッドかクラスメソッドかを判定します。
    - ruleNameに注目する
    - `npm run agent:rules:scaffold -- --ruleName "<ルール名>" --methodKind <instance|static>` でルールの雛形を生成、ルールを実装する。
      - ルール名はエスケープされている場合があるが、元の名前を指定する。

#### ルール開発のガイドライン

1. テストの実装

   - 各ルールには対応するテストを実装する
   - テストは以下のパターンを含むべき:
     - 正常系: 対象の機能が十分にサポートされている場合
     - 異常系: 対象の機能がサポートされていない場合
     - エッジケース: 特殊な状況での動作
   - 常に実装上で検知すべきASTの種別の特定には次のツールを使用:
     - `npm run agent:ast:acorn` でASTを生成
     - `npm run agent:ast:typescript` でTypeScriptのASTを生成

2. 機能の判定方法

   - シンタックスレベルの機能は、その構文で判定:
     - 例: `import` 文は `ImportDeclaration` ノードで判定
     - 例: `class` 文は `ClassDeclaration` ノードで判定
     - 例: `async` 関数は `FunctionDeclaration` ノードで判定
   - オブジェクトやメンバーの存在確認は型情報を使用:
     - 例: `AggregateError` は `AggregateError` コンストラクタの参照で判定する。型的には `AggregateErrorConstructor` のような型が対応していることが多い。
     - 例: `AggregateError.prototype.errors` は `.errors` へのアクセスのレシーバが `AggregateError` 型のオブジェクトかどうかで判定

3. コード品質と実装原則

   - 最小限かつ効率的な実装を心がける:
     - 重複するハンドラーはできるだけ避ける（例: `CallExpression`で捕捉可能な場合は、別途`ForOfStatement`などで再度検出する必要はない）
     - 同じノードに対して複数回のエラー報告を避ける
     - 複雑なロジックは共通の関数に抽出し、可読性を高める
   - ASTの構造を理解し、最も効率的な検出方法を選択する:
     - メソッド呼び出しは基本的に`CallExpression`で捕捉できる
     - 抽象度の高い検出（例: 特定のパターン）ではなく、具体的な構文要素で検出する

4. 実装上の制約

   - seedPathのファイルへの参照をルール内に持つことは禁止
   - seedの内容を的確に反映しなければならない。 `widelyAvaliableAt` `newlyAvailableAt` の欠落にも意味がある。

5. 実装フロー

   - テストを実装しながら開発を進める
   - 実装の完了には `npm run agent:check` が正常終了することを確認する
     - `npm run agent:check` は以下の3つのコマンドを実行します:
       - `npm run test` でテストを実行し、動作を確認
       - `npm run typecheck` で型チェックを実行
       - `npm run lint` でコードの整形と静的解析を実行
         - 警告の場合も対処をしなければなりません
   - 3つのコマンドの正常終了を確認したら、`src/index.ts` にルールを追加
   - **必ず** 作業内容を以下の手順でコミットする:
     1. `git status` で変更ファイルを確認
     2. `git add` で必要なファイルをステージングに追加
     3. `git commit -m "feat: Add [ルール名] rule implementation"` でコミット
     4. コミットが成功したことを確認

   **注意**: コミットを忘れると作業内容が保存されません。実装完了後は必ずコミットしましょう。

6. **基本機能と拡張機能の分割ルール**

   - 基本機能（例：`Array.prototype.toLocaleString`、`AggregateError`）とその拡張機能（例：`Array.prototype.toLocaleString.locales_parameter`、`AggregateError.serializable_object`）が別々のルールとして実装される場合は、以下のガイドラインに従ってください：

     - 基本機能のルール：機能の基本的な振る舞いのみをテスト。拡張機能や特殊パラメータを使用しないテストケースのみを含める。
     - 拡張機能のルール：特定の拡張機能（特殊パラメータや追加プロパティなど）を使用するケースのみをテスト。基本機能のテストと重複しないようにする。
     - 関連ルール間でのテストの重複を避ける。各ルールは明確な責任領域を持つべき。

   - テストケースの作成時の注意点：

     ```javascript
     // 基本機能のテスト（Array.toLocaleString）
     "const arr = [1, 2, 3]; arr.toLocaleString();"; // 拡張パラメータなし

     // 基本機能のテスト（AggregateError）
     "new AggregateError([new Error('エラー1')]);"; // 基本的な使用方法

     // 拡張機能のテスト（Array.toLocaleString.locales_parameter）
     "const arr = [1, 2, 3]; arr.toLocaleString('en-US');"; // ロケールパラメータを使用

     // 拡張機能のテスト（AggregateError.serializable_object）
     "const err = new AggregateError([new Error('エラー')], 'メッセージ');";
     "JSON.stringify(err);"; // AggregateErrorオブジェクトのシリアライズ
     ```

   - 拡張機能のルールのテストでは、拡張機能を使用しないケースは `validOnlyCodes` に含め、常に有効とマークする。

   - 実装順序：
     - 関連するルールを実装する場合は、まず基本機能のルールを実装してから拡張機能のルールに進む。
     - 最初のルールを実装した後、テストケースが適切に分離されていることを確認してから次のルールに進む。

その他の実装項目:

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

## テストケースのガイドライン

このプラグインで各ルールのテストを作成する際には、以下のパターンとアプローチを推奨します。

### テストケースの構造

1. **基本のテスト構造**

   - 各ルールのテストは `createSimpleRuleTest` 関数を使用して実装
   - テストは以下の要素を含む必要があります：
     - `rule`: テスト対象のESLintルール
     - `seed`: ルールの設定情報を含むオブジェクト
     - `codes`: 指定された条件下で適切または不適切と判断されるコード例
     - `validOnlyCodes`: 常に適切と判断されるコード例（オプション）
     - `invalidOnlyCodes`: 常に不適切と判断されるコード例（オプション）
     - `validOption`: 全てのコードが適切になる設定（例：新しい日付設定）
     - `invalidOption`: `codes` 内のコードが不適切になる設定（例：古い日付設定）

2. **テストケースの選定基準**

   - メソッドの基本的な使い方を示す例（例: `arr.at(0)`）
   - compatKeyが特徴的な使い方を示している場合にのみ、その特徴的な使い方を示す例（例: `arr.at(-1)` - 負のインデックスでの配列アクセス）
   - 異なる初期化方法での使用例（例: `.at` メソッドに対する配列リテラル、 `Array.of` に対する `new Array()` など）
   - メソッドのプロトタイプを直接利用する呼び出し方法（例: `Array.prototype.at.call([1, 2, 3], 1)`）
   - 非対象オブジェクトの類似メソッド（例: `const obj = { at: (index) => 'value' }; obj.at(0);`）

3. **テスト条件の設定**
   - 通常、将来の日付（例: 2025年）でwidely supportedとなる条件を正常系として
   - 過去の日付（例: 機能が導入される前の日付）を異常系として

### 例：Array.atメソッドのテストケース

```typescript
createSimpleRuleTest({
	rule,
	seed,
	codes: [
		"const arr = [1, 2, 3]; const item = arr.at(0);", // 基本的な使用方法
		"const arr = [1, 2, 3]; const last = arr.at(-1);", // 負のインデックスによるアクセス
		"const myArray = new Array(10); const item = myArray.at(5);", // 他の配列形式での使用
		"Array.prototype.at.call([1, 2, 3], 1);", // 明示的なメソッド呼び出し
	],
	validOnlyCodes: [
		"const arr = [1, 2, 3]; arr[0];", // 従来の配列アクセス方法
		"const obj = { at: (index) => 'value' }; obj.at(0);", // 対象外オブジェクトの類似メソッド
	],
	validOption: {
		asOf: "2025-01-01",
		support: "widely",
	},
	invalidOption: {
		asOf: "2020-01-01",
		support: "widely",
	},
});
```

ここでは、Array.atメソッドの基本的な使用方法（`arr.at(0)`）だけでなく、特徴的な機能である負のインデックス（`arr.at(-1)`）や、様々な配列生成パターンでの使用も検証しています。これにより、ルールが正しく機能していることを包括的に確認できます。

また、`validOnlyCodes` に含まれる従来の配列アクセス方法は、ルールが誤検知しないことを検証するために重要です。

### 複数ルールにまたがる機能のテスト

1. **責任の明確な分離**

   - 複数のルールにまたがる機能（基本機能とその拡張機能）をテストする場合は、各ルールのテストの責任領域を明確に分離する。
   - テストの重複を避け、各ルールが独自の側面をテストするようにする。

2. **テストケースの配置**

   - 基本機能（例：Array.toLocaleString、AggregateError）のテスト：拡張機能を使用しない基本的な使用方法をテスト
   - 拡張機能（例：Array.toLocaleString.locales_parameter、AggregateError.serializable_object）のテスト：その拡張機能を使用するケースのみをテスト
   - 両方のテストに、それぞれが対象としない機能をテストするケースを `validOnlyCodes` として含める

3. **コメントの活用**

   - テストケースには明確なコメントを含め、テストの意図を示す
   - 例：`// 基本的な使用方法（拡張機能なし）`、`// ロケールパラメータを指定`、`// オブジェクトのシリアライズ`

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

### 開発用コマンド

- `npm run format` - Prettierを使用してコードを整形
  - プロジェクト全体のコードスタイルを統一するために使用します
  - コミット前に実行することを推奨します

### ASTの解析

- `npm run agent:ast:acorn` - Acornを使用してASTを生成

  - `--code "<コード>"` コードを文字列で与える
  - `--jsx` JSXを有効にする
  - 出力: AST（JSON形式）

- `npm run agent:ast:typescript` - TypeScript ESTreeを使用してASTを生成
  - `--code "<コード>"` コードを文字列で与える
  - `--jsx` JSXを有効にする
  - 出力: AST（JSON形式）と型情報

### ルール開発

- `npm run agent:rules:next` - 次に実装するルールの情報を取得

  - 出力:
    - `ruleName`: 実装すべきルール名
    - `description`: ルールの説明
    - `seedPath`: 機能のサポート状況データへのパス
  - 注意: すべてのルールが実装済みの場合はエラーを返します

- `npm run agent:rules:scaffold --ruleName <ルール名>`
  - 指定されたルール名で新しいルールの雛形を生成
  - 生成されるファイル:
    - `src/rules/<ルール名>.ts`: ルールの実装
    - `test/rules/<ルール名>.test.ts`: テストファイル
  - テンプレートには基本的なルール構造とテストケースが含まれます
