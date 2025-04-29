import { createConstructorArgumentPropertyValidator } from "../validators/createConstructorValidator.ts";
import { createSeed, createRuleV2 } from "../ruleFactory.ts";
import type { NoopRuleConfig } from "./createNoopRule.ts";

export interface ArgumentPropertyRuleConfig extends NoopRuleConfig {
	/**
	 * オブジェクトの種類（"Array", "String", "Map"など）
	 */
	objectTypeName: string;
	/**
	 * コンストラクタの型名（"ArrayConstructor", "MapConstructor"など）
	 */
	objectTypeConstructorName?: string;
	/**
	 * 引数のインデックス
	 */
	argumentIndex: number;
	/**
	 * メソッド名（"map", "filter", "from"など）
	 */
	propertyName: string;
}

export function createConstructorArgumentPropertyRule(
	config: ArgumentPropertyRuleConfig,
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

	const createValidator = createConstructorArgumentPropertyValidator({
		typeName: config.objectTypeName,
		constructorTypeName: objectTypeConstructorName,
		argumentIndex: config.argumentIndex,
		optionProperty: config.propertyName,
	});

	const rule = createRuleV2(seed, createValidator);

	return { seed, rule };
}
