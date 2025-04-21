
import { createInstanceMethodRule } from "../utils/createObjectMethodRule.ts";

export const { seed, rule } = createInstanceMethodRule({
  objectTypeName: "Array",
  methodName: "flat",
  compatKeyPrefix: "javascript.builtins.Array",
  concern: "Array.prototype.flat",
  mdnUrl: "https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/flat",
  specUrl: "https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype.flat",
  newlyAvailableAt: "2020-01-15",
  widelyAvailableAt: "2022-07-15",
});

export default rule;
