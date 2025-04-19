import type { Rule } from "eslint";
import { computeBaseline } from "compute-baseline";
import { ensureConfig } from "../config.ts";
import type { BaselineRuleConfig } from "../types.ts";
import checkIsAvailable from "../utils/checkIsAvailable.ts";

const rule: Rule.RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description: "Ensure AggregateError constructor is supported based on specified baseline",
			category: "Possible Errors",
			recommended: true,
		},
		messages: {
			notAvailable:
				"The AggregateError constructor is not available as of {{asOf}} for {{support}} support.",
		},
		schema: [
			{
				type: "object",
				properties: {
					asOf: {
						oneOf: [
							{
								type: "string",
								pattern: "^\\d{4}\\-(0?[1-9]|1[012])\\-(0?[1-9]|[12][0-9]|3[01])$",
							},
							{},
						],
					},
					support: {
						enum: ["widely", "newly"],
					},
				},
			},
		],
	},

	create(context) {
		const options = context.options[0] || {};
		const config: BaselineRuleConfig = ensureConfig(options);

		const baseline = computeBaseline({
			compatKeys: ["javascript.builtins.AggregateError.AggregateError"],
			checkAncestors: true,
		});

		return {
			NewExpression(node) {
				if (
					node.callee.type !== "Identifier" ||
					node.callee.name !== "AggregateError"
				) {
					return;
				}

				const isAvailable = checkIsAvailable(config, baseline);

				if (!isAvailable) {
					context.report({
						messageId: "notAvailable",
						node,
						data: {
							asOf: config.asOf,
							support: config.support,
						},
					});
				}
			},
		};
	},
};

export default rule;