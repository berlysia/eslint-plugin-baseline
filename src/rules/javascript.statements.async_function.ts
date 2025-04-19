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
	concern: "AsyncFunction statement",
	compatKeys: ["javascript.statements.async_function"],
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
			FunctionDeclaration(node) {
				if (!node.async) {
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
