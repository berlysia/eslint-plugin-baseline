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
	concern: "Array.fromAsync",
	compatKeys: ["javascript.builtins.Array.fromAsync"],
	mdnUrl:
		"https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/fromAsync",
	specUrl: "https://tc39.es/proposal-array-from-async/#sec-array.fromAsync",
	newlyAvailableAt: "2024-01-25",
	widelyAvailableAt: undefined,
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

		const isTargetConstructorType = createIsTargetType(
			typeChecker,
			"ArrayConstructor",
		);

		return {
			// Check for calls to fromAsync
			CallExpression(node) {
				if (node.callee.type === "MemberExpression") {
					const property = node.callee.property;
					const object = node.callee.object;

					// Check if the property is "fromAsync"
					if (property.type === "Identifier" && property.name === "fromAsync") {
						if (object.type === "Identifier" && object.name === "Array") {
							const isAvailable = checkIsAvailable(config, baseline);
							if (!isAvailable) {
								context.report({
									messageId: "notAvailable",
									node,
									data: createMessageData(seed, config).notAvailable,
								});
							}
							return;
						}

						const tsNode = services.esTreeNodeToTSNodeMap.get(object);
						const type = typeChecker.getTypeAtLocation(tsNode);

						if (isTargetConstructorType(type)) {
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
				}
			},
		};
	},
});

export default rule;
