
import { createInstanceMethodRule } from "../utils/createObjectMethodRule.ts";

export const { seed, rule } = createInstanceMethodRule({
  objectTypeName: "Array",
  methodName: "findLastIndex",
  compatKeyPrefix: "javascript.builtins.Array",
  concern: "Array.prototype.findLastIndex",
  mdnUrl: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/findLastIndex",
  specUrl: "https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype.findlastindex",
  newlyAvailableAt: "2022-08-23",
  widelyAvailableAt: "2025-02-23",
});

export default rule;
