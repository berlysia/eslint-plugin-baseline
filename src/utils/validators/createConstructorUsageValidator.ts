import type { RuleContext } from "@typescript-eslint/utils/ts-eslint";
import type { TSESTree } from "@typescript-eslint/typescript-estree";
import type { BaselineRuleConfig } from "../../types.ts";
import type { RuleModuleSeed } from "../ruleFactory.ts";
import { createSharedValidator } from "./sharedValidator.ts";

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
