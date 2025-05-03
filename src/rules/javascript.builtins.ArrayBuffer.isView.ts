import { createRuleV2, createSeed } from "../utils/ruleFactory.ts";
import { createStaticPropertyValidator } from "../utils/validators/createPropertyValidator.ts";

export const seed = createSeed({
	concern: "ArrayBuffer.isView",
	compatKeys: ["javascript.builtins.ArrayBuffer.isView"],
	mdnUrl:
		"https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer/isView",
	specUrl:
		"https://tc39.es/ecma262/multipage/structured-data.html#sec-arraybuffer.isview",
	newlyAvailableAt: "2015-07-29",
	widelyAvailableAt: "2018-01-29",
});

const rule = createRuleV2(
	seed,
	createStaticPropertyValidator({
		typeName: "ArrayBuffer",
		constructorTypeName: "ArrayBufferConstructor",
		propertyName: "isView",
	}),
);

export default rule;
