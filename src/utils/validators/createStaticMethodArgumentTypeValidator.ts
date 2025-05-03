import type { RuleContext } from "@typescript-eslint/utils/ts-eslint";
import type { TSESTree } from "@typescript-eslint/typescript-estree";
import type { BaselineRuleConfig } from "../../types.ts";
import type { RuleModuleSeed } from "../ruleFactory.ts";
import { createSharedValidator } from "./sharedValidator.ts";

/**
 * スタティックメソッドの引数の型を検証するバリデータを作成
 */
export function createStaticMethodArgumentTypeValidator({
	typeName,
	constructorTypeName,
	methodName,
	argumentIndex,
	expectedType,
}: {
	typeName: string;
	constructorTypeName: string;
	methodName: string;
	argumentIndex: number;
	expectedType: string;
}) {
	return function create<
		MessageIds extends string,
		Options extends readonly unknown[],
	>(
		context: RuleContext<MessageIds, Options>,
		seed: RuleModuleSeed,
		config: BaselineRuleConfig,
	) {
		const sharedValidator = createSharedValidator(
			typeName,
			constructorTypeName,
			context,
			seed,
			config,
		);

		return {
			"CallExpression[callee.type='MemberExpression']"(
				node: TSESTree.CallExpression & {
					callee: TSESTree.MemberExpression;
				},
			) {
				const { callee } = node;
				if (
					callee.property.type === "Identifier" &&
					callee.property.name === methodName &&
					sharedValidator.validateConstructorType(callee.object) &&
					sharedValidator.isArgumentOfType(
						node.arguments,
						argumentIndex,
						expectedType,
					)
				) {
					sharedValidator.report(node);
				}
			},
		};
	};
}
