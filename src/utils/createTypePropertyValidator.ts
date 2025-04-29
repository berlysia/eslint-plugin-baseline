import type { TSESTree } from "@typescript-eslint/typescript-estree";
import type { RuleContext, Scope } from "@typescript-eslint/utils/ts-eslint";
import { getParserServices } from "@typescript-eslint/utils/eslint-utils";
import type ts from "typescript";
import type { BaselineRuleConfig } from "../types.ts";
import { createIsTargetType } from "./createIsTargetType.ts";
import { createMessageData } from "./ruleFactory.ts";
import type { RuleModuleSeed } from "./ruleFactory.ts";

export type ValidatorOptions =
	| {
			type: "ArgumentProperty";
			argumentIndex: number;
			optionProperty: string;
	  }
	| {
			type: "StaticMethod";
			methodName: string;
	  }
	| {
			type: "InstanceMethod";
			methodName: string;
	  }
	| {
			type: "InstanceProperty";
			propertyName: string;
	  }
	| {
			type: "StaticProperty";
			propertyName: string;
	  };

/**
 * 呼び出し式の親クラス定義を見つける
 */
function findParentClass(
	node: TSESTree.Node,
): TSESTree.ClassDeclaration | TSESTree.ClassExpression | null {
	let current = node.parent;
	while (current) {
		if (
			current.type === "ClassDeclaration" ||
			current.type === "ClassExpression"
		) {
			return current;
		}
		current = current.parent;
	}
	return null;
}

function createSharedValidator<
	MessageIds extends string,
	Options extends readonly unknown[],
>(
	typeName: string,
	constructorTypeName: string,
	context: RuleContext<MessageIds, Options>,
	seed: RuleModuleSeed,
	config: BaselineRuleConfig,
) {
	const services = getParserServices(context);
	const typeChecker = services.program.getTypeChecker();

	// 対象のコンストラクタ型の検出
	const isTargetConstructorType = createIsTargetType(
		typeChecker,
		constructorTypeName,
	);

	// 対象のインスタンス型の検出
	const isTargetInstanceType = createIsTargetType(typeChecker, typeName);

	/**
	 * 指定されたノードに対して機能が利用可能かチェックし、
	 * 利用できない場合はエラーを報告する
	 */
	function report(node: TSESTree.Node): void {
		context.report({
			messageId: "notAvailable" as MessageIds,
			node,
			data: createMessageData(seed, config).notAvailable,
		});
	}

	function isGlobalType(node: TSESTree.Expression): boolean {
		if (node.type !== "Identifier" || node.name !== typeName) {
			return false;
		}

		// ローカルで対象型が上書きされているかチェック
		const scope = context.sourceCode.getScope(node);
		let typeVar = null;
		let currentScope: Scope.Scope | null = scope;

		while (currentScope) {
			typeVar = currentScope.set.get(typeName);
			if (typeVar) {
				break;
			}
			currentScope = currentScope.upper;
		}

		// ローカルスコープで定義されていなければグローバルの対象型
		return !(typeVar && typeVar.defs.length > 0);
	}

	/**
	 * 型チェッカーを使用して対象型かどうかを検証
	 * @param node 検証するノード
	 * @param isConstructorCheck コンストラクタ型をチェックするかインスタンス型をチェックするか
	 * @returns 対象型の場合はtrue
	 */
	function validateType(
		node: TSESTree.Expression,
		isConstructorCheck = true,
	): boolean {
		const tsNode = services.esTreeNodeToTSNodeMap.get(node);
		if (!tsNode) return false;

		const type = typeChecker.getTypeAtLocation(tsNode);

		return isConstructorCheck
			? isTargetConstructorType(type)
			: isTargetInstanceType(type);
	}

	function validateInstanceType(node: TSESTree.Expression): boolean {
		return validateType(node, false);
	}

	function validateConstructorType(node: TSESTree.Expression): boolean {
		return validateType(node, true);
	}

	/**
	 * オブジェクトリテラルが特定のプロパティを持つかチェック
	 */
	function hasTargetPropertyInLiteral(
		node: TSESTree.ObjectExpression,
		optionProperty: string,
	): boolean {
		return node.properties.some((prop) => {
			if (
				prop.type === "Property" &&
				prop.key.type === "Identifier" &&
				prop.key.name === optionProperty
			) {
				return true;
			}

			// スプレッド構文をチェック
			if (prop.type === "SpreadElement") {
				const spreadArg = prop.argument;

				// スプレッド内のオブジェクトリテラルを再帰的にチェック
				if (spreadArg.type === "ObjectExpression") {
					return hasTargetPropertyInLiteral(spreadArg, optionProperty);
				}

				// 変数が参照されている場合は型情報をチェック
				return hasTargetPropertyInTypeNode(spreadArg, optionProperty);
			}

			return false;
		});
	}

	/**
	 * オブジェクトが型情報から特定のプロパティを持つかチェック
	 */
	function hasTargetPropertyInTypeNode(
		node: TSESTree.Expression,
		optionProperty: string,
	): boolean {
		const tsNode = services.esTreeNodeToTSNodeMap.get(node);
		if (!tsNode) return false;

		const type = typeChecker.getTypeAtLocation(tsNode);
		if (!type) return false;

		return hasTargetPropertyInType(type, optionProperty);
	}

	/**
	 * 型情報から特定のプロパティを持つかチェック
	 */
	function hasTargetPropertyInType(
		type: ts.Type,
		optionProperty: string,
	): boolean {
		// プロパティシンボルを取得
		const properties = typeChecker.getPropertiesOfType(type);
		if (!properties) return false;

		// 対象プロパティが存在するか確認
		return properties.some(
			(property) =>
				property.name === optionProperty || property.name === optionProperty,
		);
	}

	/**
	 * オブジェクトが特定のプロパティを持つかチェック（リテラルと型情報の両方）
	 */
	function hasTargetProperty(
		node: TSESTree.Expression,
		optionProperty: string,
	): boolean {
		if (!node) return false;

		if (node.type === "ObjectExpression") {
			return hasTargetPropertyInLiteral(node, optionProperty);
		}

		return hasTargetPropertyInTypeNode(node, optionProperty);
	}

	function isArgumentHasTheProperty(
		args: readonly TSESTree.CallExpressionArgument[],
		argumentIndex: number,
		optionProperty: string,
	): boolean {
		const spreadIndex = args.findIndex((arg) => arg.type === "SpreadElement");

		if (spreadIndex === -1) {
			// 引数が期待位置未満の場合は対象プロパティを使用していないと判断
			if (args.length < argumentIndex + 1) {
				return false;
			}

			// argumentIndex番目の引数が対象プロパティを持っているか確認
			return hasTargetProperty(
				args[argumentIndex] as TSESTree.Expression,
				optionProperty,
			);
		}

		if (spreadIndex > argumentIndex) {
			// argumentIndex番目の引数が対象プロパティを持っているか確認
			return hasTargetProperty(
				args[argumentIndex] as TSESTree.Expression,
				optionProperty,
			);
		}

		// 全体で argumentIndex+1 番目にあたる値を特定して、そのリテラルまたは型をチェックしたい
		// スプレッド要素がある場合は、スプレッド要素の前の引数を考慮する必要がある
		const targetIndexInSpread = argumentIndex - spreadIndex;

		if (targetIndexInSpread < 0) {
			throw new TypeError(
				`Invariant: targetIndex <= argumentIndex should be true -- argumentIndex: ${argumentIndex}, spreadIndex: ${spreadIndex}`,
			);
		}

		// spreadしているExpression
		const spreadArg = (args[spreadIndex] as TSESTree.SpreadElement).argument;

		// 型を取得
		const tsNode = services.esTreeNodeToTSNodeMap.get(spreadArg);
		if (!tsNode) {
			return false;
		}

		const type = typeChecker.getTypeAtLocation(tsNode);
		if (!type) {
			return false;
		}

		// ArrayLike、as constがついていればTupleとなるが、Tupleの時しか型を識別できない
		// ArrayLikeの場合でもUnionで取得できるが、順序がわからないので偽陽性を防ぐために実装しない
		if (!typeChecker.isTupleType(type)) {
			return false;
		}

		// タプルの要素数が期待する位置を含まなければならない
		const typeArguments = typeChecker.getTypeArguments(
			type as ts.TypeReference,
		);
		const tupleLength = typeArguments.length;

		if (tupleLength <= targetIndexInSpread) {
			return false;
		}

		// tupleTypeの要素を取得
		const elementType = typeArguments[targetIndexInSpread];
		if (!elementType) {
			return false;
		}

		return hasTargetPropertyInType(elementType, optionProperty);
	}

	return {
		services,
		typeChecker,
		isGlobalType,
		validateType,
		validateInstanceType,
		validateConstructorType,
		isArgumentHasTheProperty,
		findParentClass,
		report,
	};
}

export function createArgumentPropertyValidator({
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

export function createInstanceMethodValidator(
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

export function createInstancePropertyValidator(
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
					sharedValidator.validateInstanceType(node.object)
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
