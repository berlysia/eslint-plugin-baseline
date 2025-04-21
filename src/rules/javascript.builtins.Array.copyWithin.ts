
import { createInstanceMethodRule } from "../utils/createObjectMethodRule.ts";

export const { seed, rule } = createInstanceMethodRule({
  objectTypeName: "Array",
  methodName: "copyWithin",
  compatKeyPrefix: "javascript.builtins.Array",
  concern: "Array.prototype.copyWithin",
  mdnUrl: "https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/copyWithin",
  specUrl: "https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype.copywithin",
  newlyAvailableAt: "2015-09-30",
  widelyAvailableAt: "2018-03-30",
});

export default rule;
