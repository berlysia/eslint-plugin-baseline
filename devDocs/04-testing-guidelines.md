# ESLint Baseline Plugin テストケースのガイドライン

このドキュメントでは、eslint-plugin-baselineの各ルールのテスト作成に関するガイドラインを提供します。

## テストケースの構造

### 基本のテスト構造

各ルールのテストは `createSimpleRuleTest` 関数を使用して実装します。テストは以下の要素を含む必要があります：

```typescript
createSimpleRuleTest({
	rule, // テスト対象のESLintルール
	seed, // ルールの設定情報を含むオブジェクト
	codes: [
		// 指定された条件下で適切または不適切と判断されるコード例
		"const arr = [1, 2, 3]; const item = arr.at(0);", // 基本的な使用方法
		"const arr = [1, 2, 3]; const last = arr.at(-1);", // 負のインデックスによるアクセス
	],
	validOnlyCodes: [
		// 常に適切と判断されるコード例（オプション）
		"const arr = [1, 2, 3]; arr[0];", // 従来の配列アクセス方法
	],
	invalidOnlyCodes: [
		// 常に不適切と判断されるコード例（オプション）
		"// 該当する場合のみ使用",
	],
	validOption: {
		// 全てのコードが適切になる設定（例：新しい日付設定）
		asOf: "2025-01-01",
		support: "widely", // または "newly"
	},
	invalidOption: {
		// `codes` 内のコードが不適切になる設定（例：古い日付設定）
		asOf: "2020-01-01",
		support: "widely", // または "newly"
	},
});
```

### validOption と invalidOption の設定

- `validOption` の設定:

  - `support`: `widely` または `newly` のいずれか。seedに対応する値が入っているほうを使わなければならないので、`widely` が使えない場合もあることに注意する。
  - `asOf`: 日付を指定する。`support` に対応する日付よりも後の日付を指定すること。

- `invalidOption` の設定:
  - `support`: `widely` または `newly` のいずれか。
  - `asOf`: 日付を指定する。`support` に対応する日付よりも前の日付を指定すること。

## テストケースの選定基準

効果的なテストケースを作成するために、以下の基準を考慮してください：

1. **基本的な使用方法**  
   メソッドの基本的な使い方を示す例を必ず含める。

   ```javascript
   "const arr = [1, 2, 3]; const item = arr.at(0);"; // 基本的な使用方法
   ```

2. **特徴的な使用方法**  
   compatKeyが特徴的な使い方を示している場合にのみ、その特徴的な使い方を示す例を含める。

   ```javascript
   "const arr = [1, 2, 3]; const last = arr.at(-1);"; // 負のインデックスでの配列アクセス
   ```

3. **異なる初期化方法**  
   異なる初期化方法での使用例を含めて、幅広いケースをカバーする。

   ```javascript
   "const myArray = new Array(10); const item = myArray.at(5);"; // 他の配列形式での使用
   ```

4. **プロトタイプ参照**  
   メソッドのプロトタイプを直接利用する呼び出し方法を含める。

   ```javascript
   "Array.prototype.at.call([1, 2, 3], 1);"; // 明示的なメソッド呼び出し
   ```

5. **非対象ケース**  
   非対象オブジェクトの類似メソッドなど、誤検知を防ぐためのケースを `validOnlyCodes` に含める。
   ```javascript
   "const obj = { at: (index) => 'value' }; obj.at(0);"; // 対象外オブジェクトの類似メソッド
   ```

## テスト条件の設定

テスト条件は以下の原則に従って設定します：

- **正常系テスト**: 通常、将来の日付（例: 2025年）で widely supported となる条件
- **異常系テスト**: 過去の日付（例: 機能が導入される前の日付）を使用

```typescript
createSimpleRuleTest({
	// ...
	validOption: {
		asOf: "2025-01-01", // 将来の日付（十分にサポートされている）
		support: "widely",
	},
	invalidOption: {
		asOf: "2020-01-01", // 過去の日付（機能導入前）
		support: "widely",
	},
	// ...
});
```

## テストケースの改善と保守

テストケースは継続的に改善する必要があります：

- 実装の改善に伴い、テストケースも適切に更新する
- 当初は検出できなかったケースでも、実装が改善されれば `validOnlyCodes` から `codes` に移動する
- 各テストケースの意図を明確にするためのコメントを必ず追加する
- 変数に代入されたコンストラクタなど、複雑なケースも積極的にテストに含める

## 複数ルールにまたがる機能のテスト

基本機能とその拡張機能が別々のルールとして実装される場合の対応方法:

### 責任の明確な分離

- 複数のルールにまたがる機能をテストする場合は、各ルールのテストの責任領域を明確に分離する
- テストの重複を避け、各ルールが独自の側面をテストするようにする

### テストケースの配置

- **基本機能のテスト**: 拡張機能を使用しない基本的な使用方法をテスト

  ```javascript
  // Array.toLocaleString の基本機能テスト
  "const arr = [1, 2, 3]; arr.toLocaleString();"; // 拡張パラメータなし
  ```

- **拡張機能のテスト**: その拡張機能を使用するケースのみをテスト

  ```javascript
  // Array.toLocaleString.locales_parameter の拡張機能テスト
  "const arr = [1, 2, 3]; arr.toLocaleString('en-US');"; // ロケールパラメータを使用
  ```

- 両方のテストに、それぞれが対象としない機能をテストするケースを `validOnlyCodes` として含める

### コメントの活用

テストケースには明確なコメントを含め、テストの意図を示す:

```javascript
// 基本的な使用方法（拡張機能なし）
"const arr = [1, 2, 3]; arr.toLocaleString();";

// ロケールパラメータを指定（拡張機能）
"const arr = [1, 2, 3]; arr.toLocaleString('en-US');";

// オブジェクトのシリアライズ（特殊ケース）
"JSON.stringify(new AggregateError([new Error('エラー')], 'メッセージ'));";
```

## サンプルテストケース

### Array.atメソッドのテストケース例

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

このテストは、Array.atメソッドの基本的な使用方法だけでなく、特徴的な機能である負のインデックスや、様々な配列生成パターンでの使用も検証しています。
