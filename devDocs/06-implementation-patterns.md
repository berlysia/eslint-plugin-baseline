# 実装パターンと対応方法

このドキュメントでは、ESLintのルール実装における一般的なパターンと対応方法について説明します。特に、JavaScriptの様々な記述パターンに対するバリデーション方法と、型情報を活用した高度な検出機能について解説します。

## メソッド呼び出しの検出パターン

JavaScript/TypeScriptでは、メソッドにアクセスする方法が多様です。以下は一般的なパターンとその検出方法です。

### 1. 基本的なインスタンスメソッド呼び出し

```javascript
const obj = new ArrayBuffer();
obj.transferToFixedLength();
```

このパターンは基本的なMemberExpressionとして検出できます。

### 2. メソッド参照

```javascript
const obj = new ArrayBuffer();
const method = obj.transferToFixedLength;
```

変数宣言を追跡し、メソッド参照を記録する必要があります。

### 3. 計算プロパティによる呼び出し

```javascript
const obj = new ArrayBuffer();
obj["transferToFixedLength"]();
```

プロパティが文字列リテラルの場合は直接検出できますが、変数の場合は型情報を活用します。

### 4. 変数経由のプロパティアクセス

```javascript
const obj = new ArrayBuffer();
const prop = "transferToFixedLength";
obj[prop]();
```

TypeScriptの型情報を活用して変数の値を特定する必要があります。

### 5. prototype経由のメソッド呼び出し

```javascript
const obj = new ArrayBuffer();
ArrayBuffer.prototype.transferToFixedLength.call(obj);
```

`prototype`プロパティへのアクセスと`call`/`apply`メソッドの組み合わせを検出します。

### 6. 分割代入パターン

```javascript
const obj = new ArrayBuffer();
const { transferToFixedLength } = obj;
transferToFixedLength();
```

分割代入で取り出されたメソッドの追跡が必要です。

### 7. 配列リテラルからのメソッド呼び出し (Array特有)

```javascript
[].slice.call(arguments);
```

特に配列のメソッドで多用される特殊なパターンです。

### 8. 関数内での呼び出し

```javascript
function processBuffer(buf: ArrayBuffer) {
  return buf.transferToFixedLength();
}
const obj = new ArrayBuffer();
processBuffer(obj);
```

引数に型注釈がある場合でも適切に検出する必要があります。

## 実装上の重要ポイント

### 変数参照の追跡

`createInstanceMethodValidator`では、メソッド参照を変数に代入した場合、その変数を追跡する機能を実装しています：

```javascript
// Mapを使用して変数名とソースノードを追跡
const methodReferences = new Map<string, { originNode: TSESTree.Node; fromType: string }>();

function trackMethodReference(variableName: string, originNode: TSESTree.Node, fromType: string): void {
  methodReferences.set(variableName, { originNode, fromType });
}

function isMethodReference(identifier: TSESTree.Identifier): boolean {
  return methodReferences.has(identifier.name);
}
```

### 重複報告の防止

特に`call`/`apply`パターンでは、同じ箇所を複数回報告しないよう注意が必要です：

```javascript
// 重複報告を防ぐためのセット
const reportedNodes = new Set<TSESTree.Node>();

function reportOnce(node: TSESTree.Node) {
  if (!reportedNodes.has(node)) {
    reportedNodes.add(node);
    sharedValidator.report(node);
  }
}
```

### 配列リテラルメソッド呼び出しの特殊対応

`[].slice.call(arguments)`のようなパターンに対応するには特別な処理が必要です：

```javascript
// 配列リテラルメソッド - [].method
if (typeName === "Array" && isArrayLiteralMethod(node)) {
	// call/applyパターンの場合は追跡
	if (isPartOfCallOrApply(node)) {
		trackArrayLiteralMethod(node);
		return;
	}

	reportOnce(node);
	return;
}

// 追跡した配列リテラルメソッドの呼び出しを検出
if (typeName === "Array" && isTrackedArrayLiteralMethod(callee.object)) {
	reportOnce(callee.object);
}
```

### 型情報の活用

TypeScriptの型情報を活用することで、変数の値を正確に特定できます：

```javascript
function isStringLiteralWithValue(node: TSESTree.Node, value: string): boolean {
  // 直接的なリテラル
  if (node.type === "Literal" && typeof node.value === "string" && node.value === value) {
    return true;
  }

  // 型情報からの判定
  try {
    if ('type' in node) {
      const tsNode = services.esTreeNodeToTSNodeMap.get(node);
      if (tsNode) {
        const type = typeChecker.getTypeAtLocation(tsNode);
        return Boolean(type && type.isStringLiteral && type.isStringLiteral() && type.value === value);
      }
    }
  } catch (e) {
    // 型情報の取得に失敗した場合は無視
  }

  return false;
}
```

## テストケースの作成

各パターンに対応するテストケースを作成することが重要です：

```javascript
createSimpleRuleTest({
	rule,
	seed,
	codes: [
		// 通常の呼び出し
		"const obj = new ArrayBuffer(); obj.transferToFixedLength();",
		// 計算プロパティ
		'const obj = new ArrayBuffer(); obj["transferToFixedLength"]();',
		// 変数経由
		'const obj = new ArrayBuffer(); const prop = "transferToFixedLength"; obj[prop]();',
		// プロトタイプ経由
		"const obj = new ArrayBuffer(); ArrayBuffer.prototype.transferToFixedLength.call(obj);",
		// 分割代入
		"const obj = new ArrayBuffer(); const { transferToFixedLength } = obj; transferToFixedLength();",
		// 変数に格納したメソッド
		"const obj = new ArrayBuffer(); const method = obj.transferToFixedLength; method.call(obj);",
		// 関数内での呼び出し（型注釈あり）
		"function processBuffer(buf: ArrayBuffer) { return buf.transferToFixedLength(); } const obj = new ArrayBuffer(); processBuffer(obj);",
	],
	// 誤検出すべきでないケース
	validOnlyCodes: [
		// 独自オブジェクトの同名メソッド
		"const customObj = { transferToFixedLength: () => {} }; customObj.transferToFixedLength();",
	],
	// 日付設定
	validOption: { asOf: "2024-03-06", support: "newly" },
	invalidOption: { asOf: "2024-03-04", support: "newly" },
});
```

## 実装の教訓と複雑なパターン対応

JavaScriptの実際のコードベースでは、多様な書き方や思わぬパターンが使われていることがあります。これらを正確に検出するためには、徐々に対応パターンを拡充していく反復的なアプローチが有効です。

### コード重複の回避と段階的改良

初期段階では単純なパターンに対応した実装からスタートし、必要に応じて機能を強化する方法が効果的です。既存の実装が不十分だと判明した場合、以下のアプローチで対応します：

1. **独立した実験的実装**: まず別のファイルで強化実装を作成・検証
2. **機能検証と安定化**: 実験的実装がテストを通過し安定したら
3. **コードの統合**: 拡張機能を既存の実装に統合し、重複を排除

この段階的アプローチにより、安全にコードを進化させながら、機能拡充を実現できます。

### 型注釈の重要性

TypeScriptプロジェクトでは、特に関数でパラメータを扱う場合、型注釈が重要な役割を果たします：

```typescript
// 型注釈あり - 型情報を解析で活用可能
function processArray(arr: Array<number>) {
	return arr.slice(1);
}

// 型注釈なし - 型情報が不明確で解析が困難
function processArray(arr) {
	return arr.slice(1);
}
```

型注釈がある場合、静的解析ツールが型情報を活用できるため、より正確な検出が可能になります。

## まとめ

JavaScriptの柔軟な文法に対応するためには、以下の点に注意する必要があります：

1. **多様なパターンへの対応**: JavaScriptには様々なメソッドアクセスパターンがあり、それぞれに対応する必要があります
2. **変数の追跡**: メソッド参照を保持する変数を正確に追跡します
3. **型情報の活用**: TypeScriptの型システムを活用して、より正確な検出を行います
4. **重複報告の防止**: 同じ問題を複数回報告しないようにします
5. **特殊パターンの対応**: 配列リテラルメソッドなど、特殊なパターンにも対応します
6. **包括的なテスト**: すべてのパターンに対するテストケースを作成します
7. **段階的な機能拡充**: 基本機能から始め、必要に応じて徐々に機能を追加・拡張します
8. **コードの統合**: 実験的な実装が安定したら、既存のコードに統合して重複を排除します
9. **型注釈の活用**: 特に関数内での検出では、パラメータの型注釈が検出精度を向上させます

これらの点に注意して実装することで、より堅牢なESLintルールを作成できます。
