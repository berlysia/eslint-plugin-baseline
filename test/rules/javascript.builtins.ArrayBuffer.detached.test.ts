import "./utils/init.ts";
import rule, { seed } from "../../src/rules/javascript.builtins.ArrayBuffer.detached.ts";
import createSimpleRuleTest from "./utils/createSimpleRuleTest.ts";

createSimpleRuleTest({
  rule,
  seed,
  codes: [
    // 基本的なインスタンスプロパティアクセス
    "new ArrayBuffer().detached;",
    // 計算プロパティによるアクセス
    "new ArrayBuffer()['detached'];",
    // 変数経由のアクセス
    "const obj = new ArrayBuffer(); obj.detached;",
    // destructuringによるアクセス
    "const obj = new ArrayBuffer(); const { detached } = obj;",
    // 変数経由のdestructuringによるアクセス
    "const obj = new ArrayBuffer(); const prop = \"detached\"; const { [prop]: renamed } = obj;",
    // リテラル指定でのdestructuringによるアクセス
    "const obj = new ArrayBuffer(); const { [\"detached\"]: renamed } = obj;",
    // メソッドチェーンでのアクセス
    "new ArrayBuffer(10).slice(0, 5).detached;",
    // ArrayBuffer.prototypeへの直接アクセス
    "ArrayBuffer.prototype.detached;",
  ],
  validOnlyCodes: [
    // 誤った型へのアクセス（ArrayBufferではない）
    "const obj = {}; obj.detached;",
    "const obj = []; obj.detached;",
    "const obj = new Uint8Array(); obj.detached;",
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
