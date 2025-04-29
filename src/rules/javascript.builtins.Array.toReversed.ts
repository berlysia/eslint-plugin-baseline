import { createInstanceMethodExistenceRule } from "../utils/ruleFactories/createMethodExistenceRule.ts";

export const { seed, rule } = createInstanceMethodExistenceRule({
	objectTypeName: "Array",
	methodName: "toReversed",
	compatKey: "javascript.builtins.Array.toReversed",
	concern: "Array.toReversed",
	mdnUrl:
		"https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/toReversed",
	specUrl:
		"https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype.toreversed",
	newlyAvailableAt: "2023-07-04",
	widelyAvailableAt: undefined,
});

export default rule;
