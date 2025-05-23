import "./utils/init.ts";
import rule, {
	seed,
} from "../../src/rules/javascript.builtins.ArrayBuffer.byteLength.ts";
import createSimpleRuleTest from "./utils/createSimpleRuleTest.ts";

createSimpleRuleTest({
	rule,
	seed,
	codes: [
		// 基本的なインスタンスプロパティアクセス
		"new ArrayBuffer().byteLength;",
		// 計算プロパティによるアクセス
		"new ArrayBuffer()['byteLength'];",
		// 変数経由のアクセス
		"const obj = new ArrayBuffer(); obj.byteLength;",
	],
	validOption: {
		asOf: "2018-01-30",
		support: "widely",
	},
	invalidOption: {
		asOf: "2018-01-28",
		support: "widely",
	},
});
