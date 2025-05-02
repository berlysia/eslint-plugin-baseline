import { createRuleV2, createSeed } from "../utils/ruleFactory.ts";
import { createInstancePropertyValidator } from "../utils/validators/createPropertyValidator.ts";

export const seed = createSeed({
	concern: "ArrayBuffer.prototype.byteLength",
	compatKeys: ["javascript.builtins.ArrayBuffer.byteLength"],
	mdnUrl:
		"https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer/byteLength",
	specUrl:
		"https://tc39.es/ecma262/multipage/structured-data.html#sec-get-arraybuffer.prototype.bytelength",
	newlyAvailableAt: "2015-07-29",
	widelyAvailableAt: "2018-01-29",
});

const rule = createRuleV2(
	seed,
	createInstancePropertyValidator({
		typeName: "ArrayBuffer",
		propertyName: "byteLength",
	}),
);

export default rule;
