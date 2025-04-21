
import { createInstanceMethodRule } from "../utils/createObjectMethodRule.ts";

export const { seed, rule } = createInstanceMethodRule({
  objectTypeName: "Array",
  methodName: "filter",
  compatKeyPrefix: "javascript.builtins.Array",
  concern: "Array.prototype.filter",
  mdnUrl: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter",
  specUrl: "https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype.filter",
  newlyAvailableAt: "2015-07-29",
  widelyAvailableAt: "2018-01-29",
});

export default rule;
