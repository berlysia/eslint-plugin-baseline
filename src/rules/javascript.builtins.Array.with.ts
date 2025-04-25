
import { createInstanceMethodRule } from "../utils/createObjectMethodRule.ts";

export const { seed, rule } = createInstanceMethodRule({
  objectTypeName: "Array",
  methodName: "with",
  compatKey: "javascript.builtins.Array.with",
  concern: "Array.with",
  mdnUrl: "https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/with",
  specUrl: "https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype.with",
  newlyAvailableAt: "2023-07-04",
  widelyAvailableAt: undefined,
});

export default rule;
