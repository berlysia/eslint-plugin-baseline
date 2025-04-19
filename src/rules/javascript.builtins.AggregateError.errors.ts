import type { Rule } from "eslint";
import { computeBaseline } from "compute-baseline";
import { ensureConfig } from "../config.ts";
import type { BaselineRuleConfig } from "../types.ts";
import checkIsAvailable from "../utils/checkIsAvailable.ts";
import {
	createMessageData,
	createMeta,
	createSeed,
} from "../utils/ruleFactory.ts";

const seed = createSeed({
	concern: "AggregateError.errors",
	compatKeys: ["javascript.builtins.AggregateError.errors"],
});

const rule: Rule.RuleModule = {
	meta: createMeta(seed),

	create(context) {
		const options = context.options[0] || {};
		const config: BaselineRuleConfig = ensureConfig(options);

		const baseline = computeBaseline({
			compatKeys: seed.compatKeys,
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
							data: createMessageData(seed, config).notAvailable,
						});
					}
				}
			},
		};
	},
};

export default rule;
