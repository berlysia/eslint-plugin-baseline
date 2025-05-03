import "./utils/init.ts";
import rule, {
	seed,
} from "../../src/rules/javascript.builtins.ArrayBuffer.resizable.ts";
import createSimpleRuleTest from "./utils/createSimpleRuleTest.ts";

createSimpleRuleTest({
	rule,
	seed,
	codes: [
		// 基本的なインスタンスプロパティアクセス
		"const obj = new ArrayBuffer(10, { maxByteLength: 20 }); obj.resizable;",
		// 計算プロパティによるアクセス
		'const obj = new ArrayBuffer(10, { maxByteLength: 20 }); obj["resizable"];',
		// 変数経由のアクセス
		'const obj = new ArrayBuffer(10, { maxByteLength: 20 }); const prop = "resizable"; obj[prop];',
		// destructuringによるアクセス
		"const obj = new ArrayBuffer(10, { maxByteLength: 20 }); const { resizable } = obj;",
		// 変数経由のdestructuringによるアクセス
		'const obj = new ArrayBuffer(10, { maxByteLength: 20 }); const prop = "resizable"; const { [prop]: renamed } = obj;',
		// リテラル指定でのdestructuringによるアクセス
		'const obj = new ArrayBuffer(10, { maxByteLength: 20 }); const { ["resizable"]: renamed } = obj;',
		// 条件分岐での利用
		"const buffer = new ArrayBuffer(10, { maxByteLength: 20 }); if (buffer.resizable) console.log('拡張可能なバッファです');",
		// 論理演算子での利用
		"const buffer = new ArrayBuffer(10, { maxByteLength: 20 }); const canResize = buffer.resizable && buffer.maxByteLength > buffer.byteLength;",
		// 非リサイズ可能バッファ
		"const regularBuffer = new ArrayBuffer(5); regularBuffer.resizable;",
	],
	validOnlyCodes: [
		// 非対象オブジェクトの類似プロパティ
		"const customObj = { resizable: true }; customObj.resizable;",
		// 非対象の変数名
		"const resizable = true; console.log(resizable);",
		// 関数内での利用
		"const buffer = new ArrayBuffer(10); function isResizable(buf) { return buf.resizable === true; } isResizable(buffer);",
		// メソッドチェーン
		"const getBufferInfo = (buf) => ({ size: buf.byteLength, resizable: buf.resizable }); getBufferInfo(new ArrayBuffer(10, { maxByteLength: 100 }));",
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
