import { createRuleV2, createSeed } from "../utils/ruleFactory.ts";
import { createStaticMethodValidator } from "../utils/validators/createStaticMethodValidator.ts";

export const seed = createSeed({
	concern: "ArrayConstructor.fromAsync",
	compatKeys: ["javascript.builtins.Array.fromAsync"],
	mdnUrl:
		"https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/fromAsync",
	specUrl: "https://tc39.es/proposal-array-from-async/#sec-array.fromAsync",
	newlyAvailableAt: "2024-01-25",
	widelyAvailableAt: undefined,
});

const rule = createRuleV2(
	seed,
	createStaticMethodValidator({
		typeName: "Array",
		constructorTypeName: "ArrayConstructor",
		methodName: "fromAsync",
	}),
);

export default rule;
