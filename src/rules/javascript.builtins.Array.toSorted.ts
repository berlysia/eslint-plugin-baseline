import { createRuleV2, createSeed } from "../utils/ruleFactory.ts";
import { createInstanceMethodValidator } from "../utils/validators/createInstanceMethodValidator.ts";

export const seed = createSeed({
	concern: "Array.toSorted",
	compatKeys: ["javascript.builtins.Array.toSorted"],
	mdnUrl:
		"https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/toSorted",
	specUrl:
		"https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype.tosorted",
	newlyAvailableAt: "2023-07-04",
	widelyAvailableAt: undefined,
});

const rule = createRuleV2(
	seed,
	createInstanceMethodValidator({
		typeName: "Array",
		constructorTypeName: "ArrayConstructor",
		methodName: "toSorted",
	}),
);

export default rule;
