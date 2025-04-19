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
	concern: "AggregateError constructor",
	compatKeys: ["javascript.builtins.AggregateError.AggregateError"],
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

		const isTargetType = createIsTargetType(
			typeChecker,
			"AggregateErrorConstructor",
		);

		return {
			NewExpression(node) {
				const tsNode = services.esTreeNodeToTSNodeMap.get(node.callee);
				const type = typeChecker.getTypeAtLocation(tsNode);

				if (isTargetType(type)) {
					const isAvailable = checkIsAvailable(config, baseline);

					if (!isAvailable) {
						context.report({
							messageId: "notAvailable",
							node,
							data: createMessageData(seed, config).notAvailable,
						});
					}
				}
			},
			"ClassExpression, ClassDeclaration"(
				node: TSESTree.ClassExpression | TSESTree.ClassDeclaration,
			) {
				if (node.superClass) {
					const tsNode = services.esTreeNodeToTSNodeMap.get(node.superClass);
					const type = typeChecker.getTypeAtLocation(tsNode);

					if (isTargetType(type)) {
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
