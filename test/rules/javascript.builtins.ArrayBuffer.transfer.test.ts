import "./utils/init.ts";
import rule, { seed } from "../../src/rules/javascript.builtins.ArrayBuffer.transfer.ts";
import createSimpleRuleTest from "./utils/createSimpleRuleTest.ts";

createSimpleRuleTest({
  rule,
  seed,
  codes: [
    // 基本的なインスタンスメソッド呼び出し - 引数なしで同じサイズでコピー
    "const buffer = new ArrayBuffer(8); const newBuffer = buffer.transfer();",
    // サイズ指定での呼び出し
    "const buffer = new ArrayBuffer(10); const smallerBuffer = buffer.transfer(5);",
    // リサイズ可能なバッファでの呼び出し
    "const buffer = new ArrayBuffer(10, { maxByteLength: 20 }); const largerBuffer = buffer.transfer(15);",
    // 変数に格納してから呼び出し
    "const buffer = new ArrayBuffer(8); const transferFn = buffer.transfer; const newBuffer = transferFn.call(buffer);",
    // 別の直接呼び出しパターン
    "const buffer = new ArrayBuffer(8); buffer.transfer(buffer.byteLength);",
    // resizable属性の確認とともに使用
    "const buffer = new ArrayBuffer(8, { maxByteLength: 16 }); if (buffer.resizable) { const newBuf = buffer.transfer(12); }",
  ],
  validOption: {
    asOf: "2024-03-06",
    support: "newly",
  },
  invalidOption: {
    asOf: "2024-03-04",
    support: "newly",
  },
});
