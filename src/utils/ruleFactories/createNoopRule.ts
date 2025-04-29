import { createSeed, createRule } from "../ruleFactory.ts";
import type { ObjectMethodRuleConfig } from "./createMethodExistenceRule.ts";

export interface NoopRuleConfig {
	/**
	 * compatKey（ "javascript.builtins.Array.map" など）
	 */
	compatKey: string;
	/**
	 * 完全なメソッド名（例："Array.prototype.map"または"Array.from"）
	 */
	concern: string;
	/**
	 * MDNのドキュメントURL
	 */
	mdnUrl?: string;
	/**
	 * 仕様書のURL
	 */
	specUrl?: string;
	/**
	 * 機能が最初に利用可能になった日付
	 */
	newlyAvailableAt?: string;
	/**
	 * 機能が広く利用可能になった日付
	 */
	widelyAvailableAt?: string;
}
export function createNoopRule(config: ObjectMethodRuleConfig) {
	const seed = createSeed({
		concern: config.concern,
		compatKeys: [`${config.compatKey}`],
		mdnUrl: config.mdnUrl,
		specUrl: config.specUrl,
		newlyAvailableAt: config.newlyAvailableAt,
		widelyAvailableAt: config.widelyAvailableAt,
	});

	return {
		seed,
		rule: createRule(seed, {
			create(_context) {
				return {};
			},
		}),
	};
}
