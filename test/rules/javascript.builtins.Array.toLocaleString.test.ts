import "./utils/init.ts";
import rule, {
	seed,
} from "../../src/rules/javascript.builtins.Array.toLocaleString.ts";
import createSimpleRuleTest from "./utils/createSimpleRuleTest.ts";

createSimpleRuleTest({
	rule,
	seed,
	codes: [
		"const arr = [1, 2, 3]; const result = arr.toLocaleString();", // 基本的な使用方法
		"const arr = [1, 2, 3]; const result = arr.toLocaleString('ja-JP');", // ロケールを指定
		"const arr = [1, 2, 3]; const result = arr.toLocaleString('en-US', { style: 'currency', currency: 'USD' });", // オプション付き
		"Array.prototype.toLocaleString.call([1, 2, 3]);", // 明示的なメソッド呼び出し
	],
	validOnlyCodes: [
		"const obj = { toLocaleString: () => 'value' }; obj.toLocaleString();", // ArrayではないオブジェクトのtoLocaleStringメソッド
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
