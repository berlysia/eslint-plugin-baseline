
import { createInstanceMethodRule } from "../utils/createObjectMethodRule.ts";

export const { seed, rule } = createInstanceMethodRule({
  objectTypeName: "Array",
  methodName: "toSorted",
  compatKey: "javascript.builtins.Array.toSorted",
  concern: "Array.toSorted",
  mdnUrl: "https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/toSorted",
  specUrl: "https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype.tosorted",
  newlyAvailableAt: "2023-07-04",
  widelyAvailableAt: undefined, // Set to undefined to follow project conventions
});

export default rule;
