import "./utils/init.ts";
import rule, {
	seed,
} from "../../src/rules/javascript.builtins.ArrayBuffer.maxByteLength.ts";
import createSimpleRuleTest from "./utils/createSimpleRuleTest.ts";

createSimpleRuleTest({
	rule,
	seed,
	codes: [
		// 基本的なインスタンスプロパティアクセス
		"const obj = new ArrayBuffer(10); obj.maxByteLength;",
		// 計算プロパティによるアクセス
		'const obj = new ArrayBuffer(10); obj["maxByteLength"];',
		// 変数経由のアクセス
		'const obj = new ArrayBuffer(10); const prop = "maxByteLength"; obj[prop];',
		// destructuringによるアクセス
		"const obj = new ArrayBuffer(10); const { maxByteLength } = obj;",
		// 変数経由のdestructuringによるアクセス
		'const obj = new ArrayBuffer(10); const prop = "maxByteLength"; const { [prop]: renamed } = obj;',
		// リテラル指定でのdestructuringによるアクセス
		'const obj = new ArrayBuffer(10); const { ["maxByteLength"]: renamed } = obj;',
		// maxByteLengthオプション付きでの初期化
		"const buffer = new ArrayBuffer(10, { maxByteLength: 20 }); buffer.maxByteLength;",
		// maxByteLengthの利用 - 条件チェック
		"const buffer = new ArrayBuffer(10, { maxByteLength: 20 }); if (buffer.maxByteLength > buffer.byteLength) console.log('拡張可能');",
		// maxByteLengthの利用 - 値のロギング
		"const buffer = new ArrayBuffer(10, { maxByteLength: 100 }); console.log(`最大バイト長: ${buffer.maxByteLength}`);",
		// 異なる初期化方式
		"const buffer = new ArrayBuffer(5, { maxByteLength: 50 }); buffer.maxByteLength;",
	],
	validOnlyCodes: [
		// 非対象オブジェクトの類似プロパティ
		"const customObj = { maxByteLength: 100 }; customObj.maxByteLength;",
		// 非対象の変数名
		"const maxByteLength = 50; console.log(maxByteLength);",
		// 関数内部でのプロパティアクセス
		"function getMaxByteLength(buf) { return buf.maxByteLength; } getMaxByteLength(new ArrayBuffer(10, { maxByteLength: 20 }));",
	],
	validOption: {
		asOf: "2024-07-10",
		support: "newly",
	},
	invalidOption: {
		asOf: "2024-07-08",
		support: "newly",
	},
});
