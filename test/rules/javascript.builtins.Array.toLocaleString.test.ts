import "./utils/init.ts";
import rule, {
	seed,
} from "../../src/rules/javascript.builtins.Array.toLocaleString.ts";
import createSimpleRuleTest from "./utils/createSimpleRuleTest.ts";

createSimpleRuleTest({
	rule,
	seed,
	codes: [
		"const arr = [1, 2, 3]; const result = arr.toLocaleString();", // 基本的な使用方法（パラメータなし）
		"const numArr = new Array(10).fill(42); numArr.toLocaleString();", // 別の配列生成方法
		"Array.prototype.toLocaleString.call([1, 2, 3]);", // 明示的なメソッド呼び出し（パラメータなし）
	],
	validOnlyCodes: [
		"const obj = { toLocaleString: () => 'value' }; obj.toLocaleString();", // ArrayではないオブジェクトのtoLocaleStringメソッド
		"const str = '123'; str.toLocaleString();", // 文字列のtoLocaleStringメソッド
	],
	validOption: {
		asOf: "2020-01-01",
		support: "widely",
	},
	invalidOption: {
		asOf: "2016-01-01",
		support: "widely",
	},
});
