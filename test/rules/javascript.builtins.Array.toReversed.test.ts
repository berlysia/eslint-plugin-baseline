import "./utils/init.ts";
import rule, {
	seed,
} from "../../src/rules/javascript.builtins.Array.toReversed.ts";
import createSimpleRuleTest from "./utils/createSimpleRuleTest.ts";

createSimpleRuleTest({
	rule,
	seed,
	codes: [
		"const arr = [1, 2, 3]; arr.toReversed();", // 基本的な使用方法
		"const myArray = new Array(10); myArray.toReversed();", // 他の配列形式での使用
		"Array.prototype.toReversed.call([1, 2, 3]);", // メソッドの明示的な呼び出し
		"[].toReversed();", // 空の配列での使用
	],
	validOnlyCodes: [
		"const arr = [1, 2, 3]; arr.reverse();", // 元の配列を変更するreverse()メソッド
		"const obj = { toReversed: () => [] }; obj.toReversed();", // 配列でないオブジェクトのtoReversedメソッド
	],
	validOption: {
		asOf: "2023-07-06",
		support: "newly",
	},
	invalidOption: {
		asOf: "2023-01-01",
		support: "widely",
	},
});
