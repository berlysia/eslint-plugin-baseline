import { computeBaseline } from "compute-baseline";
import { getParserServices } from "@typescript-eslint/utils/eslint-utils";
import { ensureConfig } from "../config.ts";
import type { BaselineRuleConfig } from "../types.ts";
import checkIsAvailable from "../utils/checkIsAvailable.ts";
import {
	createMessageData,
	createRule,
	createSeed,
} from "../utils/ruleFactory.ts";
import { createIsTargetType } from "../utils/createIsTargetType.ts";

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

const rule = createRule(seed, {
	create(context) {
		const options = context.options[0] || {};
		const config: BaselineRuleConfig = ensureConfig(options);

		const baseline = computeBaseline({
			compatKeys: seed.compatKeys,
			checkAncestors: true,
		});

		const services = getParserServices(context);
		const typeChecker = services.program.getTypeChecker();

		// Check if a type is Array
		const isArrayType = createIsTargetType(typeChecker, "Array");

		return {
			// Check for Array.length property access
			MemberExpression(node) {
				const property = node.property;
				if (property.type === "Identifier" && property.name === "length") {
					const objectTsNode = services.esTreeNodeToTSNodeMap.get(node.object);
					const objectType = typeChecker.getTypeAtLocation(objectTsNode);

					if (isArrayType(objectType)) {
						const isAvailable = checkIsAvailable(config, baseline);

						if (!isAvailable) {
							context.report({
								messageId: "notAvailable",
								node,
								data: createMessageData(seed, config).notAvailable,
							});
						}
					}
				}
			},
		};
	},
});

export default rule;
