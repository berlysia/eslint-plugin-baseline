
import { createInstanceMethodRule } from "../utils/createObjectMethodRule.ts";

export const { seed, rule } = createInstanceMethodRule({
  objectTypeName: "Array",
  methodName: "toSpliced",
  compatKey: "javascript.builtins.Array.toSpliced",
  concern: "Array.toSpliced",
  mdnUrl: "https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/toSpliced",
  specUrl: "https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype.tospliced",
  newlyAvailableAt: "2023-07-04",
  widelyAvailableAt: undefined,
});

export default rule;
