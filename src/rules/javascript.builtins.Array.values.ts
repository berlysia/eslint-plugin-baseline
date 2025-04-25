
import { createInstanceMethodRule } from "../utils/createObjectMethodRule.ts";

export const { seed, rule } = createInstanceMethodRule({
  objectTypeName: "Array",
  methodName: "values",
  compatKey: "javascript.builtins.Array.values",
  concern: "Array.values",
  mdnUrl: "https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/values",
  specUrl: "https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype.values",
  newlyAvailableAt: "2018-05-09",
  widelyAvailableAt: "2020-11-09",
});

export default rule;
