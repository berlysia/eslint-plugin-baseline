import type { Rule } from "eslint";
import { computeBaseline } from "compute-baseline";
import { ensureConfig } from "../config.ts";
import type { BaselineRuleConfig } from "../types.ts";
import checkIsAvailable from "../utils/checkIsAvailable.ts";

const rule: Rule.RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description:
				"Ensure AggregateError.errors property is supported based on specified baseline",
			category: "Possible Errors",
			recommended: true,
		},
		messages: {
			notAvailable:
				"The AggregateError.errors property is not available as of {{asOf}} for {{support}} support.",
		},
		schema: [
			{
				type: "object",
				properties: {
					asOf: {
						oneOf: [
							{
								type: "string",
								pattern:
									"^\\d{4}\\-(0?[1-9]|1[012])\\-(0?[1-9]|[12][0-9]|3[01])$",
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
			compatKeys: ["javascript.builtins.AggregateError.errors"],
			checkAncestors: true,
		});

		return {
			MemberExpression(node) {
				if (
					node.object.type === "Identifier" &&
					node.object.name === "AggregateError" &&
					node.property.type === "Identifier" &&
					node.property.name === "errors"
				) {
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
				}
			},
		};
	},
};

export default rule;
