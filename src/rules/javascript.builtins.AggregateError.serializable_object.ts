import { computeBaseline } from "compute-baseline";
import { ensureConfig } from "../config.ts";
import type { BaselineRuleConfig } from "../types.ts";
import checkIsAvailable from "../utils/checkIsAvailable.ts";
import {
	createMessageData,
	createRule,
	createSeed,
} from "../utils/ruleFactory.ts";

export const seed = createSeed({
	concern: "AggregateError serialization",
	compatKeys: ["javascript.builtins.AggregateError.serializable_object"],
});

const rule = createRule(seed, {
	create(context) {
		const options = context.options[0] || {};
		const config: BaselineRuleConfig = ensureConfig(options);

		const baseline = computeBaseline({
			compatKeys: seed.compatKeys,
			checkAncestors: true,
		});

		return {
			CallExpression(node) {
				if (
					node.callee.type !== "MemberExpression" ||
					node.callee.property.type !== "Identifier" ||
					node.callee.property.name !== "stringify"
				) {
					return;
				}

				if (
					node.callee.object.type !== "Identifier" ||
					node.callee.object.name !== "JSON"
				) {
					return;
				}

				// Check if any argument contains AggregateError
				const hasAggregateError = node.arguments.some((arg) => {
					if (arg.type === "NewExpression") {
						return (
							arg.callee.type === "Identifier" &&
							arg.callee.name === "AggregateError"
						);
					}
					return false;
				});

				if (!hasAggregateError) {
					return;
				}

				const isAvailable = checkIsAvailable(config, baseline);

				if (!isAvailable) {
					context.report({
						messageId: "notAvailable",
						node,
						data: createMessageData(seed, config).notAvailable,
					});
				}
			},
		};
	},
});

export default rule;
