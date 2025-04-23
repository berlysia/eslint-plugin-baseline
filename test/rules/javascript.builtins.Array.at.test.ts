import "./utils/init.ts";
import rule, { seed } from "../../src/rules/javascript.builtins.Array.at.ts";
import createSimpleRuleTest from "./utils/createSimpleRuleTest.ts";

createSimpleRuleTest({
	rule,
	seed,
	codes: [
		"const arr = [1, 2, 3]; const item = arr.at(0);", // 基本的な使用方法
		"const arr = [1, 2, 3]; const last = arr.at(-1);", // 負のインデックスによるアクセス
		"const myArray = new Array(10); const item = myArray.at(5);", // 他の配列形式での使用
		"Array.prototype.at.call([1, 2, 3], 1);",
	],
	validOnlyCodes: [
		"const arr = [1, 2, 3]; arr[0];", // 古い配列アクセス方法
		"const obj = { at: (index) => 'value' }; obj.at(0);", // Arrayではないオブジェクトのatメソッド
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
