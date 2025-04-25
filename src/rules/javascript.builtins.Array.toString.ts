
import { createInstanceMethodRule } from "../utils/createObjectMethodRule.ts";

export const { seed, rule } = createInstanceMethodRule({
  objectTypeName: "Array",
  methodName: "toString",
  compatKey: "javascript.builtins.Array.toString",
  concern: "Array.prototype.toString",
  mdnUrl: "https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/toString",
  specUrl: "https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype.tostring",
  newlyAvailableAt: "2015-07-29",
  widelyAvailableAt: "2018-01-29",
});

export default rule;
