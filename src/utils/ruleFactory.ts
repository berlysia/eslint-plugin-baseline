import { ESLintUtils } from "@typescript-eslint/utils";
import type {
	NamedCreateRuleMeta,
	RuleModule,
	RuleWithMetaAndName,
} from "@typescript-eslint/utils/eslint-utils";
import { defaultConfig } from "../config.ts";

export type RuleModuleSeed = {
	concern: string;
	compatKeys: [string, ...string[]];
	mdnUrl?: string;
	specUrl?: string;
	newlyAvailableAt?: string;
	widelyAvailableAt?: string;
};

type Docs = {
	mdnUrl?: string;
	specUrl?: string;
};

export function createSeed(args: RuleModuleSeed): RuleModuleSeed {
	return args;
}

export type RuleOptions = [{ asOf: string; support: "widely" | "newly" }];
export type MessageIds = "notAvailable";

export type Rule = RuleModule<MessageIds, RuleOptions, Docs>;

export function createMeta(params: RuleModuleSeed) {
	return {
		type: "problem",
		docs: {
			description: `Ensure ${params.concern} property is supported based on specified baseline`,
			mdnUrl: params.mdnUrl,
			specUrl: params.specUrl,
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
								pattern: String.raw`^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$`,
							},
						],
					},
					support: {
						type: "string",
						enum: ["widely", "newly"],
					},
				},
			},
		],
	} as const satisfies NamedCreateRuleMeta<MessageIds, Docs, RuleOptions>;
}

export function createMessageData(
	seed: RuleModuleSeed,
	config: { asOf: string; support: string },
): Record<
	keyof ReturnType<typeof createMeta>["messages"],
	Record<string, string>
> {
	return {
		notAvailable: {
			concern: seed.concern,
			asOf: config.asOf,
			supportLevel: config.support,
		},
	} as const;
}

const privateCreateRule = ESLintUtils.RuleCreator(
	(name: string) => `http://localhost:3000/rule/${name}`,
);

export function createRule(
	seed: RuleModuleSeed,
	args: Omit<
		RuleWithMetaAndName<RuleOptions, MessageIds, unknown>,
		"name" | "meta" | "defaultOptions"
	>,
) {
	return privateCreateRule<RuleOptions, MessageIds>({
		name: seed.concern,
		defaultOptions: [defaultConfig],
		meta: createMeta(seed),
		...args,
	});
}
