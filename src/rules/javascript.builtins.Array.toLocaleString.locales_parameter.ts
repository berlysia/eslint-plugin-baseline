import { createRuleV2, createSeed } from "../utils/ruleFactory.ts";
import { createInstanceMethodArgumentExistsValidator } from "../utils/validators/createInstanceMethodValidator.ts";

export const seed = createSeed({
	concern: "Array.prototype.toLocaleString with locales parameter",
	compatKeys: ["javascript.builtins.Array.toLocaleString.locales_parameter"],
	mdnUrl:
		"https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/toLocaleString",
	specUrl: "https://tc39.github.io/ecma402/#sup-array.prototype.tolocalestring",
	newlyAvailableAt: "2020-01-15",
	widelyAvailableAt: "2022-07-15",
});

const rule = createRuleV2(
	seed,
	createInstanceMethodArgumentExistsValidator({
		typeName: "Array",
		constructorTypeName: "ArrayConstructor",
		methodName: "toLocaleString",
		argumentIndex: 0, // localesパラメータ（最初の引数）が存在するかチェック
	}),
);

export default rule;
