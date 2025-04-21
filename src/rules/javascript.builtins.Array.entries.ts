
import { createInstanceMethodRule } from "../utils/createObjectMethodRule.ts";

export const { seed, rule } = createInstanceMethodRule({
  objectTypeName: "Array",
  methodName: "entries",
  compatKeyPrefix: "javascript.builtins.Array",
  concern: "Array.prototype.entries",
  mdnUrl: "https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/entries",
  specUrl: "https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype.entries",
  newlyAvailableAt: "2015-07-29",
  widelyAvailableAt: "2018-01-29",
});

export default rule;
