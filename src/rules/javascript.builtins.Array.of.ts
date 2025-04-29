import { createStaticMethodExistenceRule } from "../utils/ruleFactories/createMethodExistenceRule.ts";

export const { seed, rule } = createStaticMethodExistenceRule({
	objectTypeName: "Array",
	methodName: "of",
	compatKey: "javascript.builtins.Array.of",
	concern: "ArrayConstructor.of",
	mdnUrl:
		"https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/of",
	specUrl:
		"https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.of",
	newlyAvailableAt: "2015-09-30",
	widelyAvailableAt: "2018-03-30",
});

export default rule;
