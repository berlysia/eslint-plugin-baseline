
import { createStaticMethodRule } from "../utils/createObjectMethodRule.ts";

export const { seed, rule } = createStaticMethodRule({
  objectTypeName: "ArrayConstructor",
  methodName: "from",
  compatKeyPrefix: "javascript.builtins.Array",
  concern: "ArrayConstructor.from",
  mdnUrl: "https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/from",
  specUrl: "https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.from",
  newlyAvailableAt: "2015-09-30",
  widelyAvailableAt: "2018-03-30",
});

export default rule;
