import type { RuleContext } from "@typescript-eslint/utils/ts-eslint";
import type { TSESTree } from "@typescript-eslint/typescript-estree";
import type { BaselineRuleConfig } from "../../types.ts";
import type { RuleModuleSeed } from "../ruleFactory.ts";
import { createSharedValidator } from "./sharedValidator.ts";

/**
 * インスタンスメソッドの引数のプロパティを検証するバリデータを作成
 */

export function createInstanceMethodArgumentPropertyValidator({
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
					(sharedValidator.validateInstanceType(callee.object) ||
						(callee.object.type === "MemberExpression" &&
							callee.object.property.type === "Identifier" &&
							callee.object.property.name === "prototype" &&
							sharedValidator.validateConstructorType(callee.object.object))) &&
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
 * インスタンスメソッドの引数の型を検証するバリデータを作成
 */

export function createInstanceMethodArgumentTypeValidator({
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
					(sharedValidator.validateInstanceType(callee.object) ||
						(callee.object.type === "MemberExpression" &&
							callee.object.property.type === "Identifier" &&
							callee.object.property.name === "prototype" &&
							sharedValidator.validateConstructorType(callee.object.object))) &&
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
 * インスタンスメソッドの引数がパターンにマッチするかを検証するバリデータを作成
 */

export function createInstanceMethodArgumentPatternValidator({
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
					(sharedValidator.validateInstanceType(callee.object) ||
						(callee.object.type === "MemberExpression" &&
							callee.object.property.type === "Identifier" &&
							callee.object.property.name === "prototype" &&
							sharedValidator.validateConstructorType(callee.object.object))) &&
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

export function createInstanceMethodValidator({
	typeName,
	constructorTypeName,
	methodName,
}: {
	typeName: string;
	constructorTypeName: string;
	methodName: string;
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
			MemberExpression(node: TSESTree.MemberExpression) {
				if (
					node.property.type === "Identifier" &&
					node.property.name === methodName &&
					(sharedValidator.validateInstanceType(node.object) ||
						(node.object.type === "MemberExpression" &&
							node.object.property.type === "Identifier" &&
							node.object.property.name === "prototype" &&
							sharedValidator.validateConstructorType(node.object.object)))
				) {
					sharedValidator.report(node);
				}
			},
		};
	};
}

export function createInstancePropertyValidator({
	typeName,
	constructorTypeName,
	propertyName,
}: {
	typeName: string;
	constructorTypeName: string;
	propertyName: string;
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
			MemberExpression(node: TSESTree.MemberExpression) {
				if (
					node.property.type === "Identifier" &&
					node.property.name === propertyName &&
					sharedValidator.validateInstanceType(node.object)
				) {
					sharedValidator.report(node);
				}
			},
		};
	};
}

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

				// ${Constructor}.prototype.${methodName}.[call|apply](...args)
				if (
					callee.property.type === "Identifier" &&
					(callee.property.name === "call" ||
						callee.property.name === "apply") &&
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
			},
		};
	};
}
