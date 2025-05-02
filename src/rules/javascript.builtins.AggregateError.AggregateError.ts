import { createRuleV2, createSeed } from "../utils/ruleFactory.ts";
import { createConstructorUsageValidator } from "../utils/validators/createConstructorValidator.ts";

export const seed = createSeed({
	concern: "AggregateError constructor",
	compatKeys: ["javascript.builtins.AggregateError.AggregateError"],
	mdnUrl:
		"https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/AggregateError/AggregateError",
	specUrl:
		"https://tc39.es/ecma262/multipage/fundamental-objects.html#sec-aggregate-error-constructor",
	newlyAvailableAt: "2020-09-16",
	widelyAvailableAt: "2023-03-16",
});

const rule = createRuleV2(
	seed,
	createConstructorUsageValidator({
		typeName: "AggregateError",
		constructorTypeName: "AggregateErrorConstructor",
		detectWithoutNew: false,
	}),
);

export default rule;
