import rule, { seed } from "../../src/rules/javascript.builtins.Array.from.ts";
import createSimpleRuleTest from "./utils/createSimpleRuleTest.ts";

createSimpleRuleTest({
	rule,
	seed,
	codes: [
		"const arr = Array.from('hello');", // 文字列からの配列変換
		"const set = new Set([1, 2, 3]); const arr = Array.from(set);", // Setからの変換
		"function createArray() { return Array.from(arguments); }", // argumentsからの変換
		"const arr = Array.from([1, 2, 3], x => x * 2);", // マッピング関数を使用
	],
	validOnlyCodes: [
		"const arr = [1, 2, 3];", // 普通の配列宣言は問題なし
		"const obj = { from: (iterable) => [] }; obj.from([]);", // Arrayではないオブジェクトのfromメソッド
		"class MyArray { static from() {} } MyArray.from();", // カスタムクラスでのfrom
	],
	validOption: {
		asOf: "2020-01-01",
		support: "widely",
	},
	invalidOption: {
		asOf: "2015-01-01",
		support: "widely",
	},
});
