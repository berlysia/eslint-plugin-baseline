
import { createInstanceMethodRule } from "../utils/createObjectMethodRule.ts";

export const { seed, rule } = createInstanceMethodRule({
  objectTypeName: "Array",
  methodName: "reduceRight",
  compatKeyPrefix: "javascript.builtins.Array",
  concern: "Array.prototype.reduceRight",
  mdnUrl: "https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/reduceRight",
  specUrl: "https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype.reduceright",
  newlyAvailableAt: "2015-07-29",
  widelyAvailableAt: "2018-01-29",
});

export default rule;
