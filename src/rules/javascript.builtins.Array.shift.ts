
import { createInstanceMethodRule } from "../utils/createObjectMethodRule.js";

export const { seed, rule } = createInstanceMethodRule({
  objectTypeName: "Array",
  methodName: "shift",
  compatKeyPrefix: "javascript.builtins.Array",
  concern: "Array.prototype.shift",
  mdnUrl: "https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/shift",
  specUrl: "https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype.shift",
  newlyAvailableAt: "2015-07-29",
  widelyAvailableAt: "2018-01-29",
});

export default rule;
