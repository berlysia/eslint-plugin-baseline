import { computeBaseline } from "compute-baseline";
import type { TSESTree } from "@typescript-eslint/typescript-estree";
import { getParserServices } from "@typescript-eslint/utils/eslint-utils";
import type ts from "typescript";
import { ensureConfig } from "../config.ts";
import type { BaselineRuleConfig } from "../types.ts";
import checkIsAvailable from "../utils/checkIsAvailable.ts";
import {
	createMessageData,
	createRule,
	createSeed,
} from "../utils/ruleFactory.ts";
import { createIsTargetType } from "../utils/createIsTargetType.ts";

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

export const seed = createSeed({
	concern: "ArrayBuffer.maxByteLength_option",
	compatKeys: [
		"javascript.builtins.ArrayBuffer.ArrayBuffer.maxByteLength_option",
	],
	mdnUrl: undefined,
	specUrl:
		"https://tc39.es/ecma262/multipage/structured-data.html#sec-arraybuffer-constructor",
	newlyAvailableAt: "2024-07-09",
	widelyAvailableAt: undefined,
});

const rule = createRule(seed, {
	create(context) {
		const options = context.options[0] || {};
		const config: BaselineRuleConfig = ensureConfig(options);

		const baseline = computeBaseline({
			compatKeys: seed.compatKeys,
			checkAncestors: true,
		});

		// 設定に基づいて利用可能かどうかを判定
		const isAvailable = checkIsAvailable(config, baseline);

		const services = getParserServices(context);
		const typeChecker = services.program.getTypeChecker();

		/**
		 * オブジェクトリテラルがmaxByteLengthプロパティを持つかチェック
		 */
		function hasMaxByteLengthPropertyInLiteral(
			node: TSESTree.ObjectExpression,
		): boolean {
			return node.properties.some((prop) => {
				if (
					prop.type === "Property" &&
					prop.key.type === "Identifier" &&
					prop.key.name === "maxByteLength"
				) {
					return true;
				}

				// スプレッド構文をチェック
				if (prop.type === "SpreadElement") {
					const spreadArg = prop.argument;

					// スプレッド内のオブジェクトリテラルを再帰的にチェック
					if (spreadArg.type === "ObjectExpression") {
						return hasMaxByteLengthPropertyInLiteral(spreadArg);
					}

					// 変数が参照されている場合は型情報をチェック
					return hasMaxByteLengthPropertyInType(spreadArg);
				}

				return false;
			});
		}

		/**
		 * オブジェクトが型情報からmaxByteLengthプロパティを持つかチェック
		 */
		function hasMaxByteLengthPropertyInType(
			node: TSESTree.Expression,
		): boolean {
			const tsNode = services.esTreeNodeToTSNodeMap.get(node);
			if (!tsNode) return false;

			const type = typeChecker.getTypeAtLocation(tsNode);
			if (!type) return false;

			// プロパティシンボルを取得
			const properties = typeChecker.getPropertiesOfType(type);
			if (!properties) return false;

			// maxByteLengthプロパティが存在するか確認
			return properties.some((property) => property.name === "maxByteLength");
		}

		/**
		 * オブジェクトがmaxByteLengthプロパティを持つかチェック（リテラルと型情報の両方）
		 */
		function hasMaxByteLengthProperty(
			node: TSESTree.Expression | TSESTree.SpreadElement,
		): boolean {
			if (!node) return false;

			if (node.type === "ObjectExpression") {
				return hasMaxByteLengthPropertyInLiteral(node);
			}

			if (node.type === "SpreadElement") {
				return hasMaxByteLengthProperty(node.argument);
			}

			return hasMaxByteLengthPropertyInType(node);
		}

		// ArrayBufferコンストラクタ型の検出
		const isArrayBufferConstructorType = createIsTargetType(
			typeChecker,
			"ArrayBufferConstructor",
		);

		// ArrayBufferインスタンス型の検出
		const isArrayBufferInstanceType = createIsTargetType(
			typeChecker,
			"ArrayBuffer",
		);

		/**
		 * 指定されたノードに対してmaxByteLength機能が利用可能かチェックし、
		 * 利用できない場合はエラーを報告する
		 */
		function checkAndReportIfUnavailable(node: TSESTree.Node): void {
			// isAvailableはルールの初期化時に判定される
			if (!isAvailable) {
				context.report({
					messageId: "notAvailable",
					node,
					data: createMessageData(seed, config).notAvailable,
				});
			}
		}

		/**
		 * NewExpressionのcalleeがArrayBufferを参照しているかどうかをチェック
		 */
		function isArrayBufferReference(node: TSESTree.Expression): boolean {
			// 1. 直接的なIdentifierとしてのArrayBuffer
			if (node.type === "Identifier" && node.name === "ArrayBuffer") {
				// ローカルでArrayBufferが上書きされているかチェック
				const scope = context.sourceCode.getScope(node);
				const arrayBufferVar = scope.variables.find(
					(v) => v.name === "ArrayBuffer",
				);

				// ローカルスコープで定義されていなければグローバルのArrayBuffer
				if (!(arrayBufferVar && arrayBufferVar.defs.length > 0)) {
					return false;
				}

				// 定義されているならば、そのシンボルが本物のArrayBufferかどうかを 2. で検証する
			}

			// 2. 型情報を使用したチェック
			const tsNode = services.esTreeNodeToTSNodeMap.get(node);
			if (!tsNode) return false;

			const type = typeChecker.getTypeAtLocation(tsNode);
			return isArrayBufferConstructorType(type);
		}

		/**
		 * 引数がmaxByteLength機能を使用しているかチェック
		 * @param args 関数または構築子の引数
		 * @returns maxByteLength機能を使用している場合はtrue
		 */
		function isUsingMaxByteLengthFeature(args: TSESTree.Expression[]): boolean {
			// 引数が2つ未満の場合はmaxByteLengthを使用していないと判断
			if (args.length < 2) {
				return false;
			}

			// 第2引数がmaxByteLengthプロパティを持っているか確認
			return hasMaxByteLengthProperty(args[1]);
		}

		/**
		 * 型チェッカーを使用してArrayBuffer型かどうかを検証
		 * @param node 検証するノード
		 * @param isConstructorCheck コンストラクタ型をチェックするかインスタンス型をチェックするか
		 * @returns ArrayBuffer型の場合はtrue
		 */
		function validateArrayBufferType(
			node: TSESTree.Expression,
			isConstructorCheck: boolean = true,
		): boolean {
			const tsNode = services.esTreeNodeToTSNodeMap.get(node);
			if (!tsNode) return false;

			const type = typeChecker.getTypeAtLocation(tsNode);

			return isConstructorCheck
				? isArrayBufferConstructorType(type)
				: isArrayBufferInstanceType(type);
		}

		/**
		 * ArrayBufferコンストラクタの呼び出しを検証
		 * @param callee 呼び出し対象
		 * @param args 引数
		 * @param node 報告対象ノード
		 * @returns 処理を続行する必要がなければfalse
		 */
		function validateArrayBufferCall(
			callee: TSESTree.Expression,
			args: TSESTree.Expression[],
			node: TSESTree.Node,
		): boolean {
			// maxByteLength機能を使用していない場合はスキップ
			if (!isUsingMaxByteLengthFeature(args)) {
				return false;
			}

			// 直接ArrayBufferを参照しているかチェック
			if (isArrayBufferReference(callee)) {
				checkAndReportIfUnavailable(node);
				return false;
			}

			// 型情報を使用した追加チェック
			if (validateArrayBufferType(callee, true)) {
				checkAndReportIfUnavailable(node);
				return false;
			}

			return true;
		}

		return {
			// ArrayBufferコンストラクタの呼び出し
			NewExpression(node: TSESTree.NewExpression) {
				// callee、引数、レポート対象のノードを検証
				if (!validateArrayBufferCall(node.callee, node.arguments, node)) {
					return;
				}

				// インスタンス型をチェック（ArrayBufferの継承クラスの場合も検出するため）
				if (validateArrayBufferType(node, false)) {
					checkAndReportIfUnavailable(node);
				}
			},

			// ArrayBufferのサブクラスのコンストラクタからのsuper呼び出し
			"CallExpression[callee.type='Super']"(node: TSESTree.CallExpression) {
				// maxByteLength機能を使用していない場合はスキップ
				if (!isUsingMaxByteLengthFeature(node.arguments)) {
					return;
				}

				const classNode = findParentClass(node);
				if (!classNode?.superClass) {
					return;
				}

				// 親クラスがArrayBufferかをチェック
				if (isArrayBufferReference(classNode.superClass)) {
					checkAndReportIfUnavailable(node);
					return;
				}

				// 型情報を使用した追加チェック
				if (validateArrayBufferType(classNode.superClass, true)) {
					checkAndReportIfUnavailable(node);
				}
			},
		};
	},
});

export default rule;
