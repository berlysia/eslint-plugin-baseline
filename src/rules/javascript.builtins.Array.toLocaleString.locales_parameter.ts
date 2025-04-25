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
	concern: "Array.prototype.toLocaleString with locales parameter",
	compatKeys: ["javascript.builtins.Array.toLocaleString.locales_parameter"],
	mdnUrl:
		"https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/toLocaleString",
	specUrl: "https://tc39.github.io/ecma402/#sup-array.prototype.tolocalestring",
	newlyAvailableAt: "2020-01-15",
	widelyAvailableAt: "2022-07-15",
});

export const rule = createRule(seed, {
	create(context) {
		const options = context.options[0] || {};
		const ruleConfig: BaselineRuleConfig = ensureConfig(options);

		const baseline = computeBaseline({
			compatKeys: seed.compatKeys,
			checkAncestors: true,
		});

		const services = getParserServices(context);
		const typeChecker = services.program.getTypeChecker();

		// Check if the type is Array
		const isArrayType = createIsTargetType(typeChecker, "Array");

		const isArrayConstructorType = createIsTargetType(
			typeChecker,
			"ArrayConstructor",
		);

		return {
			// Check for CallExpression only
			CallExpression(node) {
				const callee = node.callee;

				// Case 1: array.toLocaleString('en-US')
				if (
					callee.type === "MemberExpression" &&
					callee.property.type === "Identifier" &&
					callee.property.name === "toLocaleString" &&
					isArrayType(
						typeChecker.getTypeAtLocation(
							services.esTreeNodeToTSNodeMap.get(callee.object),
						),
					) &&
					// Only check if args exist (locales parameter is used)
					node.arguments.length > 0
				) {
					const isAvailable = checkIsAvailable(ruleConfig, baseline);
					if (!isAvailable) {
						context.report({
							messageId: "notAvailable",
							node,
							data: createMessageData(seed, ruleConfig).notAvailable,
						});
					}
				}

				// Case 2: Array.prototype.toLocaleString.call(array, 'en-US')
				else if (
					callee.type === "MemberExpression" &&
					callee.property.type === "Identifier" &&
					(callee.property.name === "call" ||
						callee.property.name === "apply") &&
					callee.object.type === "MemberExpression" &&
					callee.object.property.type === "Identifier" &&
					callee.object.property.name === "toLocaleString" &&
					callee.object.object.type === "MemberExpression" &&
					callee.object.object.property.type === "Identifier" &&
					callee.object.object.property.name === "prototype" &&
					isArrayConstructorType(
						typeChecker.getTypeAtLocation(
							services.esTreeNodeToTSNodeMap.get(callee.object.object.object),
						),
					) &&
					// For call(), check if we have at least 2 args (this and locales)
					node.arguments.length >= 2
				) {
					const isAvailable = checkIsAvailable(ruleConfig, baseline);
					if (!isAvailable) {
						context.report({
							messageId: "notAvailable",
							node,
							data: createMessageData(seed, ruleConfig).notAvailable,
						});
					}
				}
			},
		};
	},
});

export default rule;
