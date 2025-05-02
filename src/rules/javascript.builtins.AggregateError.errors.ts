import { createRuleV2, createSeed } from "../utils/ruleFactory.ts";
import { createInstancePropertyValidator } from "../utils/validators/createPropertyValidator.ts";

export const seed = createSeed({
	concern: "AggregateError.errors",
	compatKeys: ["javascript.builtins.AggregateError.errors"],
	mdnUrl:
		"https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/AggregateError/errors",
	specUrl:
		"https://tc39.es/ecma262/multipage/fundamental-objects.html#sec-aggregate-error",
	newlyAvailableAt: "2020-09-16",
	widelyAvailableAt: "2023-03-16",
});

const rule = createRuleV2(
	seed,
	createInstancePropertyValidator({
		typeName: "AggregateError",
		propertyName: "errors",
	}),
);

export default rule;
