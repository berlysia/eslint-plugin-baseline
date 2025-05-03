/* eslint-disable no-bitwise -- for TypeScript flag calcuration */
import type { TSESTree } from "@typescript-eslint/typescript-estree";
import type { RuleContext, Scope } from "@typescript-eslint/utils/ts-eslint";
import { getParserServices } from "@typescript-eslint/utils/eslint-utils";
import ts from "typescript";
import type { BaselineRuleConfig } from "../../types.ts";
import { createIsTargetType } from "../createIsTargetType.ts";
import { createMessageData } from "../ruleFactory.ts";
import type { RuleModuleSeed } from "../ruleFactory.ts";

/**
 * 呼び出し式の親クラス定義を見つける
 */
export function findParentClass(
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
 * Checks if a node is of the expected type based on its literal value
 */
function isNodeTypeInLiterally(
	node: TSESTree.Expression,
	expectedType: string,
): boolean {
	if (node.type === "Literal") {
		if (expectedType === "string" && typeof node.value === "string") {
			return true;
		}
		if (expectedType === "number" && typeof node.value === "number") {
			return true;
		}
		if (expectedType === "boolean" && typeof node.value === "boolean") {
			return true;
		}
		if (expectedType === "regexp" && node.value instanceof RegExp) {
			return true;
		}
	}
	if (node.type === "ObjectExpression" && expectedType === "object") {
		return true;
	}
	if (node.type === "ArrayExpression" && expectedType === "array") {
		return true;
	}
	return false;
}

export function createSharedValidator<
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

	/**
	 * 引数が存在するかをチェック
	 */
	function argumentExists(
		args: readonly TSESTree.CallExpressionArgument[],
		argumentIndex: number,
	): boolean {
		const spreadIndex = args.findIndex((arg) => arg.type === "SpreadElement");

		// スプレッド引数がない場合は単純に長さをチェック
		if (spreadIndex === -1) {
			return args.length > argumentIndex;
		}

		// スプレッド前に既に十分な引数がある場合
		if (spreadIndex > argumentIndex) {
			return true;
		}

		// スプレッド要素の中身を検証する必要がある
		const targetIndexInSpread = argumentIndex - spreadIndex;
		const spreadArg = (args[spreadIndex] as TSESTree.SpreadElement).argument;

		// 型情報を取得
		const tsNode = services.esTreeNodeToTSNodeMap.get(spreadArg);
		if (!tsNode) return false;

		const type = typeChecker.getTypeAtLocation(tsNode);
		if (!type) return false;

		// タプル型の場合は要素数をチェック
		if (typeChecker.isTupleType(type)) {
			const typeArguments = typeChecker.getTypeArguments(
				type as ts.TypeReference,
			);
			return typeArguments.length > targetIndexInSpread;
		}

		// 配列型の場合は長さを確定できないため、存在する可能性があるものとして扱う
		return true;
	}

	/**
	 * 引数の型をチェック
	 */
	function isArgumentOfType(
		args: readonly TSESTree.CallExpressionArgument[],
		argumentIndex: number,
		expectedType: string,
	): boolean {
		const spreadIndex = args.findIndex((arg) => arg.type === "SpreadElement");

		// スプレッド引数がない、またはスプレッド前に目的の引数がある場合
		if (spreadIndex === -1 || spreadIndex > argumentIndex) {
			const arg = args[argumentIndex] as TSESTree.Expression;
			return checkNodeType(arg, expectedType);
		}

		// スプレッド要素内の引数を検証
		const targetIndexInSpread = argumentIndex - spreadIndex;
		const spreadArg = (args[spreadIndex] as TSESTree.SpreadElement).argument;

		// 型情報を取得
		const tsNode = services.esTreeNodeToTSNodeMap.get(spreadArg);
		if (!tsNode) return false;

		const type = typeChecker.getTypeAtLocation(tsNode);
		if (!type) return false;

		// タプル型の場合は特定の要素の型をチェック
		if (typeChecker.isTupleType(type)) {
			const typeArguments = typeChecker.getTypeArguments(
				type as ts.TypeReference,
			);
			if (typeArguments.length <= targetIndexInSpread) {
				return false;
			}

			const elementType = typeArguments[targetIndexInSpread];
			return checkTSType(elementType, expectedType);
		}

		return false;
	}

	/**
	 * 引数が特定のパターンにマッチするかチェック
	 */
	function isArgumentMatchPattern(
		args: readonly TSESTree.CallExpressionArgument[],
		argumentIndex: number,
		pattern: RegExp | string,
	): boolean {
		if (!argumentExists(args, argumentIndex)) {
			return false;
		}

		const spreadIndex = args.findIndex((arg) => arg.type === "SpreadElement");

		// スプレッド引数がない、またはスプレッド前に目的の引数がある場合
		if (spreadIndex === -1 || spreadIndex > argumentIndex) {
			const arg = args[argumentIndex] as TSESTree.Expression;

			// 文字列リテラルの場合はパターンマッチを実行
			if (arg.type === "Literal" && typeof arg.value === "string") {
				const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern);
				return regex.test(arg.value);
			}

			// テンプレートリテラルの場合
			if (arg.type === "TemplateLiteral" && arg.quasis.length === 1) {
				const value = arg.quasis[0].value.raw;
				const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern);
				return regex.test(value);
			}
		}

		// 現時点ではスプレッド引数内の文字列パターンマッチはサポートしない
		return false;
	}

	/**
	 * ノードの型をチェック
	 */
	function checkNodeType(
		node: TSESTree.Expression,
		expectedType: string,
	): boolean {
		return (
			isNodeTypeInLiterally(node, expectedType) ||
			isNodeTypeInTypeLevel(node, expectedType)
		);
	}

	function isNodeTypeInTypeLevel(
		node: TSESTree.Expression,
		expectedType: string,
	): boolean {
		const tsNode = services.esTreeNodeToTSNodeMap.get(node);
		if (!tsNode) return false;

		const type = typeChecker.getTypeAtLocation(tsNode);
		return checkTSType(type, expectedType);
	}

	/**
	 * TypeScriptの型をチェック
	 */
	function checkTSType(type: ts.Type, expectedType: string): boolean {
		if (!type) return false;

		if (expectedType === "string") {
			return typeChecker.isTypeAssignableTo(type, typeChecker.getStringType());
		}
		if (expectedType === "number") {
			return typeChecker.isTypeAssignableTo(type, typeChecker.getNumberType());
		}
		if (expectedType === "boolean") {
			return typeChecker.isTypeAssignableTo(type, typeChecker.getBooleanType());
		}
		if (expectedType === "object") {
			return (
				(type.flags & ts.TypeFlags.Object) !== 0 &&
				!typeChecker.isArrayLikeType(type)
			);
		}
		if (expectedType === "array") {
			return typeChecker.isArrayLikeType(type);
		}
		if (expectedType === "function") {
			return (
				(type.flags & ts.TypeFlags.Object) !== 0 &&
				((type as ts.ObjectType).objectFlags & ts.ObjectFlags.Anonymous) !==
					0 &&
				type.getCallSignatures().length > 0
			);
		}
		if (expectedType === "regexp") {
			return Boolean(
				(type.flags & ts.TypeFlags.Object) !== 0 &&
					type.symbol?.name === "RegExp",
			);
		}

		return false;
	}

	function isSpecificLiteral(
		node: TSESTree.Expression,
		literalValue: string | number,
	) {
		const tsNode = services.esTreeNodeToTSNodeMap.get(node);
		if (!tsNode) return false;

		const type = typeChecker.getTypeAtLocation(tsNode);

		if (!type) return false;

		if (type.isStringLiteral() && typeof literalValue === "string") {
			return type.value === literalValue;
		}
		if (type.isNumberLiteral() && typeof literalValue === "number") {
			return type.value === literalValue;
		}

		return false;
	}

	/**
	 * コンストラクタ/関数の直接呼び出しをチェック
	 * @param node 検証するノード (NewExpressionまたはCallExpression)
	 * @returns 対象の型のコンストラクタ/関数であればtrue
	 */
	function isTargetConstructor(
		node: TSESTree.NewExpression | TSESTree.CallExpression,
	): boolean {
		// 型情報を使った間接的な呼び出しでチェック
		return node.callee.type === "Identifier"
			? isGlobalType(node.callee) || validateConstructorType(node.callee)
			: validateConstructorType(node.callee);
	}

	function checkInstancePropertyAccess(
		memberExpression: TSESTree.MemberExpression,
	) {
		return validateInstanceType(memberExpression.object);
	}

	function checkStaticPropertyAccess(
		memberExpression: TSESTree.MemberExpression,
	) {
		return validateConstructorType(memberExpression.object);
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
		isArgumentOfType,
		isArgumentMatchPattern,
		argumentExists,
		hasTargetProperty,
		checkNodeType,
		checkTSType,
		isTargetConstructor,
		checkInstancePropertyAccess,
		checkStaticPropertyAccess,
		checkIsSpecificLiteral: isSpecificLiteral,
	};
}