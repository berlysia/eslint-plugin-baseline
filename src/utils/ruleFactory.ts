import type { Rule } from "eslint";

type RuleModuleSeed = {
	concern: string;
	compatKeys: [string, ...string[]];
};

export function createSeed(args: RuleModuleSeed): RuleModuleSeed {
	return args;
}

export function createMeta(params: RuleModuleSeed) {
	return {
		type: "problem",
		docs: {
			description: `Ensure ${params.concern} property is supported based on specified baseline`,
			category: "Possible Errors",
			recommended: true,
		},
		messages: {
			notAvailable:
				"The {{concern}} is not available as of {{asOf}} for {{supportLevel}} support.",
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
	} as const satisfies Rule.RuleModule["meta"];
}

export function createMessageData(
	params: RuleModuleSeed,
	config: { asOf: string; support: string },
): Record<
	keyof ReturnType<typeof createMeta>["messages"],
	Record<string, string>
> {
	return {
		notAvailable: {
			concern: params.concern,
			asOf: config.asOf,
			supportLevel: config.support,
		},
	} as const;
}
