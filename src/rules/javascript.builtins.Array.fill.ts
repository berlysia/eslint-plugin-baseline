import { createInstanceMethodExistenceRule } from "../utils/ruleFactories/createMethodExistenceRule.ts";

export const { seed, rule } = createInstanceMethodExistenceRule({
	objectTypeName: "Array",
	methodName: "fill",
	compatKey: "javascript.builtins.Array.fill",
	concern: "Array.prototype.fill",
	mdnUrl:
		"https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/fill",
	specUrl:
		"https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype.fill",
	newlyAvailableAt: "2015-09-01",
	widelyAvailableAt: "2018-03-01",
});

export default rule;
