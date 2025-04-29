import { createInstanceMethodExistenceRule } from "../utils/ruleFactories/createMethodExistenceRule.ts";

export const { seed, rule } = createInstanceMethodExistenceRule({
	objectTypeName: "Array",
	methodName: "flatMap",
	compatKey: "javascript.builtins.Array.flatMap",
	concern: "Array.prototype.flatMap",
	mdnUrl:
		"https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/flatMap",
	specUrl:
		"https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype.flatmap",
	newlyAvailableAt: "2020-01-15",
	widelyAvailableAt: "2022-07-15",
});

export default rule;
