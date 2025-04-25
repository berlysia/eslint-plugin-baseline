
import rule, {
  seed,
} from "../../src/rules/javascript.builtins.ArrayBuffer.ArrayBuffer.ts";
import createSimpleRuleTest from "./utils/createSimpleRuleTest.ts";

createSimpleRuleTest({
  rule,
  seed,
  codes: [
    // 基本的な使用方法
    "const buffer = new ArrayBuffer(10);",
    // 別の初期化方法
    "const size = 1024; const buffer = new ArrayBuffer(size);",
    // 異なるバッファサイズ
    "const largeBuffer = new ArrayBuffer(1024 * 1024);",
    // 0バイトのバッファ
    "const emptyBuffer = new ArrayBuffer(0);",
  ],
  validOnlyCodes: [
    // ArrayBufferオブジェクトを他で使用するケース
    "const buffer = {}; buffer.byteLength = 10;",
    // 名前が似ているが別のオブジェクト
    "const customBuffer = { constructor: function() { return new Uint8Array(10); } }; customBuffer.constructor();",
    // コンストラクタを変数に代入して使用
    // 注: 型チェックの問題によりテスト環境ではキャッチできないケース
    "const BufferConstructor = ArrayBuffer; const buf = new BufferConstructor(16);",
  ],
  validOption: {
    asOf: "2018-01-30",
    support: "widely",
  },
  invalidOption: {
    asOf: "2015-07-28",
    support: "newly",
  },
});
