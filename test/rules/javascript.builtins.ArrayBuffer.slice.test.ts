import "./utils/init.ts";
import rule, { seed } from "../../src/rules/javascript.builtins.ArrayBuffer.slice.ts";
import createSimpleRuleTest from "./utils/createSimpleRuleTest.ts";

createSimpleRuleTest({
  rule,
  seed,
  codes: [
    // 基本的なインスタンスメソッド呼び出し
    "const buffer = new ArrayBuffer(8); buffer.slice(0, 4);",
    // メソッド呼び出しをプロパティとして参照
    "const buffer = new ArrayBuffer(8); const sliceMethod = buffer.slice;",
    // 別の変数に代入して使用
    "const buffer = new ArrayBuffer(8); const newBuffer = buffer.slice(2, 6);",
    // 計算プロパティによるアクセス
    "const buffer = new ArrayBuffer(8); buffer[\"slice\"](0, 4);",
    // 変数経由のアクセス
    "const buffer = new ArrayBuffer(8); const prop = \"slice\"; buffer[prop](0, 4);",
    // destructuringによるアクセス
    "const buffer = new ArrayBuffer(8); const { slice } = buffer; slice(0, 4);",
    // メソッドを関数として使用
    "const buffer = new ArrayBuffer(8); const fn = buffer.slice; fn.call(buffer, 0, 4);",
    // チェーンでの使用
    "const buffer = new ArrayBuffer(8); const view = new Uint8Array(buffer.slice(0, 4));",
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
