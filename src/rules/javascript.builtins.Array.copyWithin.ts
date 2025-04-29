import { createInstanceMethodExistenceRule } from "../utils/ruleFactories/createMethodExistenceRule.ts";

export const { seed, rule } = createInstanceMethodExistenceRule({
	objectTypeName: "Array",
	methodName: "copyWithin",
	compatKey: "javascript.builtins.Array.copyWithin",
	concern: "Array.prototype.copyWithin",
	mdnUrl:
		"https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/copyWithin",
	specUrl:
		"https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype.copywithin",
	newlyAvailableAt: "2015-09-30",
	widelyAvailableAt: "2018-03-30",
});

export default rule;
