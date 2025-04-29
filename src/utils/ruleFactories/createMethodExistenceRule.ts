import { createRuleV2, createSeed } from "../ruleFactory.ts";
import { createInstanceMethodValidator } from "../validators/createInstanceMethodValidator.ts";
import { createStaticMethodValidator } from "../validators/createStaticMethodValidator.ts";
import type { NoopRuleConfig } from "./createNoopRule.ts";

export interface ObjectMethodRuleConfig extends NoopRuleConfig {
	/**
	 * オブジェクトの種類（"Array", "String", "Map"など）
	 */
	objectTypeName: string;
	/**
	 * コンストラクタの型名（"ArrayConstructor", "MapConstructor"など）
	 */
	objectTypeConstructorName?: string;
	/**
	 * メソッド名（"map", "filter", "from"など）
	 */
	methodName: string;
}

/**
 * インスタンスメソッド（例：Array.prototype.map）用のルールを作成する関数
 */
export function createInstanceMethodExistenceRule(
	config: ObjectMethodRuleConfig,
) {
	const objectTypeConstructorName =
		config.objectTypeConstructorName ?? `${config.objectTypeName}Constructor`;

	const seed = createSeed({
		concern: config.concern,
		compatKeys: [`${config.compatKey}`],
		mdnUrl: config.mdnUrl,
		specUrl: config.specUrl,
		newlyAvailableAt: config.newlyAvailableAt,
		widelyAvailableAt: config.widelyAvailableAt,
	});

	const createValidator = createInstanceMethodValidator(
		config.objectTypeName,
		objectTypeConstructorName,
		config.methodName,
	);

	const rule = createRuleV2(seed, createValidator);

	return { seed, rule };
}

/**
 * スタティックメソッド（例：Array.from）用のルールを作成する関数
 */
export function createStaticMethodExistenceRule(
	config: ObjectMethodRuleConfig,
) {
	const objectTypeConstructorName =
		config.objectTypeConstructorName ?? `${config.objectTypeName}Constructor`;

	const seed = createSeed({
		concern: config.concern,
		compatKeys: [`${config.compatKey}`],
		mdnUrl: config.mdnUrl,
		specUrl: config.specUrl,
		newlyAvailableAt: config.newlyAvailableAt,
		widelyAvailableAt: config.widelyAvailableAt,
	});

	const createValidator = createStaticMethodValidator(
		config.objectTypeName,
		objectTypeConstructorName,
		config.methodName,
	);

	const rule = createRuleV2(seed, createValidator);

	return { seed, rule };
}
