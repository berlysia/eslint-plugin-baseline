import "./utils/init.ts";
import rule, { seed } from "../../src/rules/javascript.builtins.Array.of.ts";
import createSimpleRuleTest from "./utils/createSimpleRuleTest.ts";

createSimpleRuleTest({
	rule,
	seed,
	codes: [
		"const arr = Array.of(1, 2, 3);", // 基本的な使用法
		"const arr = Array.of();", // 引数なしの使用
		"const arr = Array.of(...[1, 2, 3]);", // スプレッド構文を使用
		"const ArrayAlias = Array; const arr = ArrayAlias.of(1, 2, 3);", // エイリアス経由での使用
		"function createArray() { return Array.of(...arguments); }", // argumentsとスプレッド演算子を使用
	],
	validOnlyCodes: [
		"const arr = [1, 2, 3];", // 普通の配列宣言
		"const obj = { of: (...args) => [] }; obj.of(1, 2, 3);", // Arrayではないオブジェクトのofメソッド
		"class MyArray { static of() {} } MyArray.of(1, 2, 3);", // カスタムクラスでのof
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
