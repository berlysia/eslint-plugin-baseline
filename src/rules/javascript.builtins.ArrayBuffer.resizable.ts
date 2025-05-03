import { createRuleV2, createSeed } from "../utils/ruleFactory.ts";
import { createInstancePropertyValidator } from "../utils/validators/createPropertyValidator.ts";

export const seed = createSeed({
	concern: "ArrayBuffer.prototype.resizable",
	compatKeys: ["javascript.builtins.ArrayBuffer.resizable"],
	mdnUrl:
		"https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer/resizable",
	specUrl:
		"https://tc39.es/ecma262/multipage/structured-data.html#sec-get-arraybuffer.prototype.resizable",
	newlyAvailableAt: "2024-07-09",
	widelyAvailableAt: undefined,
});

const rule = createRuleV2(
	seed,
	createInstancePropertyValidator({
		typeName: "ArrayBuffer",
		propertyName: "resizable",
	}),
);

export default rule;
