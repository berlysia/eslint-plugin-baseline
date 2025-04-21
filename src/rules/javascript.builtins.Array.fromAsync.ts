
import { createStaticMethodRule } from "../utils/createObjectMethodRule.ts";

export const { seed, rule } = createStaticMethodRule({
  objectTypeName: "ArrayConstructor",
  methodName: "fromAsync",
  compatKeyPrefix: "javascript.builtins.Array",
  concern: "ArrayConstructor.fromAsync",
  mdnUrl: "https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/fromAsync",
  specUrl: "https://tc39.es/proposal-array-from-async/#sec-array.fromAsync",
  newlyAvailableAt: "2024-01-25",
  widelyAvailableAt: undefined,
});

export default rule;
