import { computeBaseline } from "compute-baseline";
import { getParserServices } from "@typescript-eslint/utils/eslint-utils";
import type { TSESTree } from "@typescript-eslint/typescript-estree";
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
	concern: "AggregateError serialization",
	compatKeys: ["javascript.builtins.AggregateError.serializable_object"],
	mdnUrl: "https://developer.mozilla.org/docs/Glossary/Serializable_object",
	specUrl: undefined,
	newlyAvailableAt: "2023-09-18",
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

		const isTargetType = createIsTargetType(typeChecker, "AggregateError");

		function checkType(node: TSESTree.Node) {
			const tsNode = services.esTreeNodeToTSNodeMap.get(node);
			const type = typeChecker.getTypeAtLocation(tsNode);
			return isTargetType(type);
		}

		function checkAndReport(node: TSESTree.Node, objectNode: TSESTree.Node) {
			if (checkType(objectNode)) {
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

		function checkRecursively(node: TSESTree.Node) {
			switch (node.type) {
				case "NewExpression": {
					const tsNode = services.esTreeNodeToTSNodeMap.get(node);
					const type = typeChecker.getTypeAtLocation(tsNode);
					if (isTargetType(type)) {
						checkAndReport(node, node);
					}

					break;
				}
				case "ObjectExpression": {
					for (const prop of node.properties) {
						if (prop.type === "Property") {
							const value = prop.value;
							if (value.type === "NewExpression") {
								const tsNode = services.esTreeNodeToTSNodeMap.get(value);
								const type = typeChecker.getTypeAtLocation(tsNode);
								if (isTargetType(type)) {
									checkAndReport(node, value);
								}
							} else {
								checkRecursively(value);
							}
						}
					}

					break;
				}
				case "ArrayExpression": {
					for (const element of node.elements) {
						if (element) {
							if (element.type === "NewExpression") {
								const tsNode = services.esTreeNodeToTSNodeMap.get(element);
								const type = typeChecker.getTypeAtLocation(tsNode);
								if (isTargetType(type)) {
									checkAndReport(node, element);
								}
							} else {
								checkRecursively(element);
							}
						}
					}

					break;
				}
				case "Identifier": {
					checkAndReport(node, node);

					break;
				}
				// No default
			}
		}

		return {
			CallExpression(node) {
				if (
					node.callee.type === "MemberExpression" &&
					node.callee.object.type === "Identifier" &&
					node.callee.object.name === "JSON" &&
					node.callee.property.type === "Identifier" &&
					node.callee.property.name === "stringify"
				) {
					const [arg] = node.arguments;
					if (!arg) return;

					checkRecursively(arg);
				}
			},
		};
	},
});

export default rule;
