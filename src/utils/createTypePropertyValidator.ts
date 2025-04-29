import type { TSESTree } from "@typescript-eslint/typescript-estree";
import type { RuleContext, Scope } from "@typescript-eslint/utils/ts-eslint";
import { getParserServices } from "@typescript-eslint/utils/eslint-utils";
import type ts from "typescript";
import type { BaselineRuleConfig } from "../types.ts";
import { createIsTargetType } from "./createIsTargetType.ts";
import { createMessageData } from "./ruleFactory.ts";
import type { RuleModuleSeed } from "./ruleFactory.ts";

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

/**
 * 特定の型とそのプロパティについての検証機能を提供するファクトリ関数
 * @param typeName 検証対象の型名（例: "ArrayBuffer"）
 * @param constructorTypeName 検証対象のコンストラクタ型名（例: "ArrayBufferConstructor"）
 * @param argumentIndex 検証対象のオプションの引数内インデックス（例: 1）
 * @param optionProperty 検証対象のオプションプロパティ名（例: "maxByteLength"）
 */
export function createTypePropertyValidator(
	typeName: string,
	constructorTypeName: string,
	argumentIndex: number,
	optionProperty: string,
) {
	/**
	 * 検証機能の主要部分を提供する関数
	 */
	return function createValidator<
		MessageIds extends string,
		Options extends readonly unknown[],
	>(
		context: RuleContext<MessageIds, Options>,
		seed: RuleModuleSeed,
		config: BaselineRuleConfig,
		isAvailable: boolean,
	) {
		const services = getParserServices(context);
		const typeChecker = services.program.getTypeChecker();

		/**
		 * オブジェクトリテラルが特定のプロパティを持つかチェック
		 */
		function hasTargetPropertyInLiteral(
			node: TSESTree.ObjectExpression,
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
						return hasTargetPropertyInLiteral(spreadArg);
					}

					// 変数が参照されている場合は型情報をチェック
					return hasTargetPropertyInTypeNode(spreadArg);
				}

				return false;
			});
		}

		/**
		 * オブジェクトが型情報から特定のプロパティを持つかチェック
		 */
		function hasTargetPropertyInTypeNode(node: TSESTree.Expression): boolean {
			const tsNode = services.esTreeNodeToTSNodeMap.get(node);
			if (!tsNode) return false;

			const type = typeChecker.getTypeAtLocation(tsNode);
			if (!type) return false;

			return hasTargetPropertyInType(type);
		}

		/**
		 * 型情報から特定のプロパティを持つかチェック
		 */
		function hasTargetPropertyInType(type: ts.Type): boolean {
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
		function hasTargetProperty(node: TSESTree.Expression): boolean {
			if (!node) return false;

			if (node.type === "ObjectExpression") {
				return hasTargetPropertyInLiteral(node);
			}

			return hasTargetPropertyInTypeNode(node);
		}

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
		function checkAndReportIfUnavailable(node: TSESTree.Node): void {
			// isAvailableはルールの初期化時に判定される
			if (!isAvailable) {
				context.report({
					messageId: "notAvailable" as MessageIds,
					node,
					data: createMessageData(seed, config).notAvailable,
				});
			}
		}

		/**
		 * 対象型への参照を検証する
		 */
		function isTypeReference(node: TSESTree.Expression): boolean {
			// 1. 直接的なIdentifierとしての対象型
			if (node.type === "Identifier" && node.name === typeName) {
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
				if (!(typeVar && typeVar.defs.length > 0)) {
					return true;
				}

				// 定義されているならば、その型が本物かどうかを 2. で検証する
			}

			// 2. 型情報を使用したチェック
			const tsNode = services.esTreeNodeToTSNodeMap.get(node);
			if (!tsNode) return false;

			const type = typeChecker.getTypeAtLocation(tsNode);
			return isTargetConstructorType(type);
		}

		/**
		 * 引数が対象プロパティを使用しているかチェック
		 * @param args 関数または構築子の引数
		 * @returns 対象プロパティを使用している場合はtrue
		 */
		function isUsingTargetFeature(
			args: TSESTree.CallExpressionArgument[],
		): boolean {
			// スプレッド要素が何番目にあるか
			const spreadIndex = args.findIndex((arg) => arg.type === "SpreadElement");

			if (spreadIndex === -1) {
				// 引数が期待位置未満の場合は対象プロパティを使用していないと判断
				if (args.length < argumentIndex + 1) {
					return false;
				}

				// argumentIndex番目の引数が対象プロパティを持っているか確認
				return hasTargetProperty(args[argumentIndex] as TSESTree.Expression);
			}

			if (spreadIndex > argumentIndex) {
				// argumentIndex番目の引数が対象プロパティを持っているか確認
				return hasTargetProperty(args[argumentIndex] as TSESTree.Expression);
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

			return hasTargetPropertyInType(elementType);
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

		/**
		 * 対象型のコンストラクタの呼び出しを検証
		 * @param callee 呼び出し対象
		 * @param args 引数
		 * @param node 報告対象ノード
		 * @returns 処理を続行する必要がなければfalse
		 */
		function validateConstructorCall(
			callee: TSESTree.Expression,
			args: TSESTree.CallExpressionArgument[],
			node: TSESTree.Node,
		): boolean {
			// 対象プロパティを使用していない場合はスキップ
			if (!isUsingTargetFeature(args)) {
				return false;
			}

			// 直接対象型を参照しているかチェック
			if (isTypeReference(callee)) {
				checkAndReportIfUnavailable(node);
				return false;
			}

			// 型情報を使用した追加チェック
			if (validateType(callee, true)) {
				checkAndReportIfUnavailable(node);
				return false;
			}

			return true;
		}

		return {
			isTypeReference,
			hasTargetProperty,
			isUsingTargetFeature,
			validateType,
			validateConstructorCall,
			checkAndReportIfUnavailable,
			findParentClass,
		};
	};
}
