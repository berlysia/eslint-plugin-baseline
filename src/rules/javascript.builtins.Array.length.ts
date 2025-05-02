import { createRuleV2, createSeed } from "../utils/ruleFactory.ts";
import { createInstancePropertyValidator } from "../utils/validators/createPropertyValidator.ts";

export const seed = createSeed({
	concern: "Array.prototype.length",
	compatKeys: ["javascript.builtins.Array.length"],
	mdnUrl:
		"https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/length",
	specUrl:
		"https://tc39.es/ecma262/multipage/indexed-collections.html#sec-properties-of-array-instances-length",
	newlyAvailableAt: "2015-07-29",
	widelyAvailableAt: "2018-01-29",
});

const rule = createRuleV2(
	seed,
	createInstancePropertyValidator({
		typeName: "Array",
		propertyName: "length",
	}),
);

export default rule;
