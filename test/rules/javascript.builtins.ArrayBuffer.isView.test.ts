import "./utils/init.ts";
import rule, {
	seed,
} from "../../src/rules/javascript.builtins.ArrayBuffer.isView.ts";
import createSimpleRuleTest from "./utils/createSimpleRuleTest.ts";

createSimpleRuleTest({
	rule,
	seed,
	codes: [
		// 基本的な静的プロパティアクセス
		"ArrayBuffer.isView;",
		// 計算プロパティによるアクセス
		"ArrayBuffer['isView'];",
		// 変数経由のアクセス
		"const obj = ArrayBuffer; obj.isView;",
		// destructuringによるアクセス
		"const { isView } = ArrayBuffer;",
		// 変数経由のdestructuringによるアクセス
		'const prop = "isView"; const { [prop]: renamed } = obj;',
		// リテラル指定でのdestructuringによるアクセス
		'const { ["isView"]: renamed } = obj;',
		// メソッド呼び出し - 基本パターン
		"ArrayBuffer.isView(new Uint8Array());",
		// メソッド呼び出し - 別の型引数
		"ArrayBuffer.isView(new Int32Array(10));",
		// メソッド呼び出し - ArrayBufferオブジェクト
		"ArrayBuffer.isView(new ArrayBuffer(10));",
		// メソッド呼び出し - DataView
		"ArrayBuffer.isView(new DataView(new ArrayBuffer(10)));",
		// 参照呼び出し
		"const isViewFn = ArrayBuffer.isView; isViewFn(new Uint8Array());",
		// 関数としての間接呼び出し
		"const ABIsView = ArrayBuffer.isView; ABIsView.call(null, new Uint8Array());",
		// applyによる呼び出し
		"ArrayBuffer.isView.apply(null, [new Int32Array(5)]);",
	],
	validOnlyCodes: [
		// 非対象オブジェクトの類似メソッド
		"const customObj = { isView: () => false }; customObj.isView();",
		// 非対象の変数名
		"const isView = (arg) => typeof arg === 'object'; isView({});",
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
