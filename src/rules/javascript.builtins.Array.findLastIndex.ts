import { createRuleV2, createSeed } from "../utils/ruleFactory.ts";
import { createInstanceMethodValidator } from "../utils/validators/createInstanceMethodValidator.ts";

export const seed = createSeed({
	concern: "Array.prototype.findLastIndex",
	compatKeys: ["javascript.builtins.Array.findLastIndex"],
	mdnUrl:
		"https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/findLastIndex",
	specUrl:
		"https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype.findlastindex",
	newlyAvailableAt: "2022-08-23",
	widelyAvailableAt: "2025-02-23",
});

const rule = createRuleV2(
	seed,
	createInstanceMethodValidator({
		typeName: "Array",
		constructorTypeName: "ArrayConstructor",
		methodName: "findLastIndex",
	}),
);

export default rule;
