import type { RuleContext } from "@typescript-eslint/utils/ts-eslint";
import type { TSESTree } from "@typescript-eslint/typescript-estree";
import type { BaselineRuleConfig } from "../../types.ts";
import type { RuleModuleSeed } from "../ruleFactory.ts";
import { createSharedValidator } from "./sharedValidator.ts";

/**
 * インスタンスメソッドの引数の存在を検証するバリデータを作成
 */
export function createInstanceMethodArgumentExistsValidator({
	typeName,
	constructorTypeName,
	methodName,
	argumentIndex,
}: {
	typeName: string;
	constructorTypeName: string;
	methodName: string;
	argumentIndex: number;
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
				// ${instance}.${methodName}(...args)
				if (
					callee.property.type === "Identifier" &&
					callee.property.name === methodName &&
					sharedValidator.validateInstanceType(callee.object) &&
					sharedValidator.argumentExists(node.arguments, argumentIndex)
				) {
					sharedValidator.report(node);
				}

				// ${Constructor}.prototype.${methodName}.call(this, ...args)
				if (
					callee.property.type === "Identifier" &&
					callee.property.name === "call" &&
					callee.object.type === "MemberExpression" &&
					callee.object.property.type === "Identifier" &&
					callee.object.property.name === methodName &&
					callee.object.object.type === "MemberExpression" &&
					callee.object.object.property.type === "Identifier" &&
					callee.object.object.property.name === "prototype" &&
					sharedValidator.validateConstructorType(
						callee.object.object.object,
					) &&
					sharedValidator.argumentExists(node.arguments, argumentIndex + 1)
				) {
					sharedValidator.report(node);
				}

				// FIXME: ${Constructor}.prototype.${methodName}.apply(this, args)
			},
		};
	};
}
