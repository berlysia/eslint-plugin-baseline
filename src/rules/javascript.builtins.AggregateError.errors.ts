import { computeBaseline } from "compute-baseline";
import type { TSESTree } from "@typescript-eslint/utils";
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
	concern: "AggregateError.errors",
	compatKeys: ["javascript.builtins.AggregateError.errors"],
	mdnUrl:
		"https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/AggregateError/errors",
	specUrl:
		"https://tc39.es/ecma262/multipage/fundamental-objects.html#sec-aggregate-error",
	newlyAvailableAt: "2020-09-16",
	widelyAvailableAt: "2023-03-16",
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

		const isTargetType = createIsTargetType(typeChecker, "AggregateError");

		function checkAndReport(node: TSESTree.Node, objectNode: TSESTree.Node) {
			const objectType = typeChecker.getTypeAtLocation(
				services.esTreeNodeToTSNodeMap.get(objectNode),
			);

			if (isTargetType(objectType)) {
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

		return {
			// メンバーアクセス (obj.errors, obj?.errors)
			MemberExpression(node: TSESTree.MemberExpression) {
				if (
					node.property.type === "Identifier" &&
					node.property.name === "errors"
				) {
					checkAndReport(node, node.object);
				}
			},

			// 分割代入 ({ errors } = aggregateError)
			VariableDeclarator(node: TSESTree.VariableDeclarator) {
				if (node.id.type === "ObjectPattern" && node.init) {
					const errorsProp = node.id.properties.find(
						(prop) =>
							prop.type === "Property" &&
							prop.key.type === "Identifier" &&
							prop.key.name === "errors",
					);

					if (errorsProp) {
						checkAndReport(errorsProp, node.init);
					}
				}
			},
		};
	},
});

export default rule;
