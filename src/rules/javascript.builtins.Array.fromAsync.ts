import { createStaticMethodExistenceRule } from "../utils/ruleFactories/createMethodExistenceRule.ts";

export const { seed, rule } = createStaticMethodExistenceRule({
	objectTypeName: "Array",
	methodName: "fromAsync",
	compatKey: "javascript.builtins.Array.fromAsync",
	concern: "ArrayConstructor.fromAsync",
	mdnUrl:
		"https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/fromAsync",
	specUrl: "https://tc39.es/proposal-array-from-async/#sec-array.fromAsync",
	newlyAvailableAt: "2024-01-25",
	widelyAvailableAt: undefined,
});

export default rule;
