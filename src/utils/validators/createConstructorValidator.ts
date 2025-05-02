import type { RuleContext } from "@typescript-eslint/utils/ts-eslint";
import type { TSESTree } from "@typescript-eslint/typescript-estree";
import type { BaselineRuleConfig } from "../../types.ts";
import type { RuleModuleSeed } from "../ruleFactory.ts";
import { createSharedValidator, findParentClass } from "./sharedValidator.ts";

export function createConstructorArgumentPropertyValidator({
	typeName,
	constructorTypeName,
	argumentIndex,
	optionProperty,
}: {
	typeName: string;
	constructorTypeName: string;
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
			NewExpression(node: TSESTree.NewExpression) {
				if (
					sharedValidator.isArgumentHasTheProperty(
						node.arguments,
						argumentIndex,
						optionProperty,
					) &&
					(sharedValidator.isGlobalType(node.callee) ||
						sharedValidator.validateConstructorType(node.callee) ||
						sharedValidator.validateInstanceType(node))
				) {
					sharedValidator.report(node);
				}
			},

			"CallExpression[callee.type='Super']"(node: TSESTree.CallExpression) {
				const classNode = findParentClass(node);
				if (!classNode?.superClass) {
					throw new TypeError("invariant: classNode.superClass is null");
				}

				if (
					sharedValidator.isArgumentHasTheProperty(
						node.arguments,
						argumentIndex,
						optionProperty,
					) &&
					(sharedValidator.isGlobalType(classNode.superClass) ||
						sharedValidator.validateConstructorType(classNode.superClass))
				) {
					sharedValidator.report(node);
				}
			},
		};
	};
}

export function createConstructorArgumentExistsValidator({
	typeName,
	constructorTypeName,
	argumentIndex,
}: {
	typeName: string;
	constructorTypeName: string;
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
			NewExpression(node: TSESTree.NewExpression) {
				if (
					sharedValidator.argumentExists(node.arguments, argumentIndex) &&
					(sharedValidator.isGlobalType(node.callee) ||
						sharedValidator.validateConstructorType(node.callee) ||
						sharedValidator.validateInstanceType(node))
				) {
					sharedValidator.report(node);
				}
			},

			"CallExpression[callee.type='Super']"(node: TSESTree.CallExpression) {
				const classNode = findParentClass(node);
				if (!classNode?.superClass) {
					throw new TypeError("invariant: classNode.superClass is null");
				}

				if (
					sharedValidator.argumentExists(node.arguments, argumentIndex) &&
					(sharedValidator.isGlobalType(classNode.superClass) ||
						sharedValidator.validateConstructorType(classNode.superClass))
				) {
					sharedValidator.report(node);
				}
			},
		};
	};
}

export function createConstructorArgumentTypeValidator({
	typeName,
	constructorTypeName,
	argumentIndex,
	expectedType,
}: {
	typeName: string;
	constructorTypeName: string;
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
			NewExpression(node: TSESTree.NewExpression) {
				if (
					sharedValidator.isArgumentOfType(
						node.arguments,
						argumentIndex,
						expectedType,
					) &&
					(sharedValidator.isGlobalType(node.callee) ||
						sharedValidator.validateConstructorType(node.callee) ||
						sharedValidator.validateInstanceType(node))
				) {
					sharedValidator.report(node);
				}
			},

			"CallExpression[callee.type='Super']"(node: TSESTree.CallExpression) {
				const classNode = findParentClass(node);
				if (!classNode?.superClass) {
					throw new TypeError("invariant: classNode.superClass is null");
				}

				if (
					sharedValidator.isArgumentOfType(
						node.arguments,
						argumentIndex,
						expectedType,
					) &&
					(sharedValidator.isGlobalType(classNode.superClass) ||
						sharedValidator.validateConstructorType(classNode.superClass))
				) {
					sharedValidator.report(node);
				}
			},
		};
	};
}

export function createConstructorArgumentPatternValidator({
	typeName,
	constructorTypeName,
	argumentIndex,
	pattern,
}: {
	typeName: string;
	constructorTypeName: string;
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
			NewExpression(node: TSESTree.NewExpression) {
				if (
					sharedValidator.isArgumentMatchPattern(
						node.arguments,
						argumentIndex,
						pattern,
					) &&
					(sharedValidator.isGlobalType(node.callee) ||
						sharedValidator.validateConstructorType(node.callee) ||
						sharedValidator.validateInstanceType(node))
				) {
					sharedValidator.report(node);
				}
			},

			"CallExpression[callee.type='Super']"(node: TSESTree.CallExpression) {
				const classNode = findParentClass(node);
				if (!classNode?.superClass) {
					throw new TypeError("invariant: classNode.superClass is null");
				}

				if (
					sharedValidator.isArgumentMatchPattern(
						node.arguments,
						argumentIndex,
						pattern,
					) &&
					(sharedValidator.isGlobalType(classNode.superClass) ||
						sharedValidator.validateConstructorType(classNode.superClass))
				) {
					sharedValidator.report(node);
				}
			},
		};
	};
}

/**
 * コンストラクタ自体の使用を検知するバリデータを作成
 * このバリデータはnew Array()やArray()のような呼び出しを検出します
 */
export function createConstructorUsageValidator({
	typeName,
	constructorTypeName,
	detectWithoutNew = false,
}: {
	typeName: string;
	constructorTypeName: string;
	detectWithoutNew?: boolean;
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
			// new演算子を使用したコンストラクタ呼び出し
			NewExpression(node: TSESTree.NewExpression) {
				if (sharedValidator.isTargetConstructor(node)) {
					sharedValidator.report(node);
				}
			},

			// 関数として呼び出し (Array() のような形式)
			CallExpression(node: TSESTree.CallExpression) {
				if (detectWithoutNew && sharedValidator.isTargetConstructor(node)) {
					sharedValidator.report(node);
				}
			},

			// クラスでextendsされている場合
			"ClassDeclaration, ClassExpression"(
				node: TSESTree.ClassDeclaration | TSESTree.ClassExpression,
			) {
				if (
					node.superClass &&
					sharedValidator.validateConstructorType(node.superClass)
				) {
					sharedValidator.report(node);
				}
			},
		};
	};
}
