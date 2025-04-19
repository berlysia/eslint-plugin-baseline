import type { Rule } from "eslint";
import { computeBaseline } from "compute-baseline";
import { ensureConfig } from "../config.ts";
import type { BaselineRuleConfig } from "../types.ts";
import checkIsAvailable from "../utils/checkIsAvailable.ts";

export const baselineFeatures: Rule.RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description: "Ensure features are supported based on specified baseline",
			category: "Possible Errors",
			recommended: true,
		},
		messages: {
			notAvailable:
				"The feature is not available as of {{asOf}} for {{support}} support.",
		},
		schema: [
			{
				type: "object",
				properties: {
					asOf: {
						oneOf: [
							{
								type: "string",
								pattern: "^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$",
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
			compatKeys: ["javascript.statements.async_function"],
			checkAncestors: true,
		});

		return {
			FunctionDeclaration(node) {
				if (!node.async) {
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
