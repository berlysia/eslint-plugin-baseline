import "./utils/init.ts";
import rule, { seed } from "../../src/rules/javascript.builtins.Array.with.ts";
import createSimpleRuleTest from "./utils/createSimpleRuleTest.ts";

createSimpleRuleTest({
	rule,
	seed,
	codes: [
		"const arr = [1, 2, 3]; const newArr = arr.with(1, 42);", // 基本的な使用方法（インデックス1の要素を42に置換）
		"const arr = ['a', 'b', 'c']; const newArr = arr.with(0, 'x');", // 先頭要素の置換
		"const arr = [1, 2, 3]; const newArr = arr.with(-1, 99);", // 負のインデックスによるアクセス（末尾要素の置換）
		"const myArray = new Array(3).fill(0); const newArray = myArray.with(1, 5);", // 他の配列形式での使用
		"Array.prototype.with.call([1, 2, 3], 1, 42);", // 明示的なメソッド呼び出し
	],
	validOnlyCodes: [
		"const arr = [1, 2, 3]; arr[1] = 42; // [...arr];", // 古い配列要素置換方法
		"const obj = { with: (index, value) => ({...obj, [index]: value}) }; obj.with(0, 'value');", // Arrayではないオブジェクトのwithメソッド
	],
	validOption: {
		asOf: "2025-01-01",
		support: "newly",
	},
	invalidOption: {
		asOf: "2022-01-01",
		support: "newly",
	},
});