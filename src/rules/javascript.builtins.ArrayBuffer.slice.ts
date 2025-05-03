import { createRuleV2, createSeed } from "../utils/ruleFactory.ts";
import { createInstancePropertyValidator } from "../utils/validators/createPropertyValidator.ts";

export const seed = createSeed({
	concern: "ArrayBuffer.prototype.slice",
	compatKeys: ["javascript.builtins.ArrayBuffer.slice"],
	mdnUrl:
		"https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer/slice",
	specUrl:
		"https://tc39.es/ecma262/multipage/structured-data.html#sec-arraybuffer.prototype.slice",
	newlyAvailableAt: "2015-07-29",
	widelyAvailableAt: "2018-01-29",
});

const rule = createRuleV2(
	seed,
	createInstancePropertyValidator({
		typeName: "ArrayBuffer",
		propertyName: "slice",
	}),
);

export default rule;
