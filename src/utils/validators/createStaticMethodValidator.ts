import type { RuleContext } from "@typescript-eslint/utils/ts-eslint";
import type { TSESTree } from "@typescript-eslint/typescript-estree";
import type { BaselineRuleConfig } from "../../types.ts";
import type { RuleModuleSeed } from "../ruleFactory.ts";
import { createSharedValidator } from "./sharedValidator.ts";

export function createStaticMethodValidator(
	typeName: string,
	constructorTypeName: string,
	methodName: string,
) {
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
			MemberExpression(node: TSESTree.MemberExpression) {
				if (
					node.property.type === "Identifier" &&
					node.property.name === methodName &&
					sharedValidator.validateConstructorType(node.object)
				) {
					sharedValidator.report(node);
				}
			},
		};
	};
}
/**
 * スタティックメソッドの引数のプロパティを検証するバリデータを作成
 */

export function createStaticMethodArgumentPropertyValidator({
	typeName,
	constructorTypeName,
	methodName,
	argumentIndex,
	optionProperty,
}: {
	typeName: string;
	constructorTypeName: string;
	methodName: string;
	argumentIndex: number;
	optionProperty: string;
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
					sharedValidator.isArgumentHasTheProperty(
						node.arguments,
						argumentIndex,
						optionProperty,
					)
				) {
					sharedValidator.report(node);
				}
			},
		};
	};
}
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
/**
 * スタティックメソッドの引数がパターンにマッチするかを検証するバリデータを作成
 */

export function createStaticMethodArgumentPatternValidator({
	typeName,
	constructorTypeName,
	methodName,
	argumentIndex,
	pattern,
}: {
	typeName: string;
	constructorTypeName: string;
	methodName: string;
	argumentIndex: number;
	pattern: RegExp | string;
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
					sharedValidator.isArgumentMatchPattern(
						node.arguments,
						argumentIndex,
						pattern,
					)
				) {
					sharedValidator.report(node);
				}
			},
		};
	};
}

/**
 * スタティックメソッドの引数の存在を検証するバリデータを作成
 */
export function createStaticMethodArgumentExistsValidator({
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
				if (
					callee.property.type === "Identifier" &&
					callee.property.name === methodName &&
					sharedValidator.validateConstructorType(callee.object) &&
					sharedValidator.argumentExists(node.arguments, argumentIndex)
				) {
					sharedValidator.report(node);
				}
			},
		};
	};
}

export function createStaticPropertyValidator(
	typeName: string,
	constructorTypeName: string,
	propertyName: string,
) {
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
			MemberExpression(node: TSESTree.MemberExpression) {
				if (
					node.property.type === "Identifier" &&
					node.property.name === propertyName &&
					sharedValidator.validateConstructorType(node.object)
				) {
					sharedValidator.report(node);
				}
			},
		};
	};
}
