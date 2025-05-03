import type { RuleContext } from "@typescript-eslint/utils/ts-eslint";
import type { TSESTree } from "@typescript-eslint/typescript-estree";
import type { BaselineRuleConfig } from "../../types.ts";
import type { RuleModuleSeed } from "../ruleFactory.ts";
import { createPropertyValidator } from "./createPropertyValidator.ts";
import { PROPERTY_ACCESS_TYPE } from "./propertyAccessType.ts";

/**
 * スタティックプロパティのアクセスを検証するバリデータ
 */
export function createStaticPropertyValidator(options: {
	typeName: string;
	constructorTypeName: string;
	propertyName: string;
}) {
	return createPropertyValidator({
		...options,
		accessType: PROPERTY_ACCESS_TYPE.Static,
	});
}
