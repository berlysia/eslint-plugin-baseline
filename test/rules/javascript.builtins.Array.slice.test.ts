import rule, { seed } from "../../src/rules/javascript.builtins.Array.slice.ts";
import createSimpleRuleTest from "./utils/createSimpleRuleTest.ts";

createSimpleRuleTest({
	rule,
	seed,
	codes: [
		// 通常の呼び出し
		`const arr = [1, 2, 3]; arr.slice(1, 3);`,
		`const numbers = [1, 2, 3, 4, 5]; const subArray = numbers.slice(0, 3);`,
		// プロトタイプ経由の呼び出し
		`Array.prototype.slice.call([1, 2, 3], 1);`,
		// ショートハンド呼び出し
		`[].slice.call(arguments);`,
		// 変数経由の呼び出し
		`const slice = Array.prototype.slice; slice.call([1, 2, 3]);`,
		// 追加の引数をもつ呼び出し
		`Array.prototype.slice.call([1, 2, 3], 1, 2);`,
		// 計算プロパティ
		`const arr = [1, 2, 3]; arr["slice"](0, 2);`,
		// 変数経由の計算プロパティ
		`const arr = [1, 2, 3]; const method = "slice"; arr[method](0, 2);`,
		// 分割代入
		`const arr = [1, 2, 3]; const { slice } = arr; slice.call(arr, 1);`,
		// 関数内での呼び出し - 引数に型注釈あり
		`function processArray(arr: Array<number>) { return arr.slice(1); } const arr = [1, 2, 3]; processArray(arr);`,
	],
	// 検出されないべきケース
	validOnlyCodes: [
		// 非対象の同名関数
		`function slice(arr, start, end) { return arr.substring(start, end); }; slice("hello", 0, 3);`,
		// 独自オブジェクトのメソッド
		`const customObj = { slice: () => "custom" }; customObj.slice();`,
	],
	validOption: {
		asOf: "2025-01-01",
		support: "widely",
	},
	invalidOption: {
		asOf: "2017-01-01",
		support: "widely",
	},
});
