import { computeBaseline } from "compute-baseline";
import type { TSESTree } from "@typescript-eslint/typescript-estree";
import { ensureConfig } from "../config.ts";
import type { BaselineRuleConfig } from "../types.ts";
import checkIsAvailable from "../utils/checkIsAvailable.ts";
import { createRule, createSeed } from "../utils/ruleFactory.ts";
import { createTypePropertyValidator } from "../utils/createTypePropertyValidator.ts";

// 型名をパラメータとして定義
const TYPE_NAME = "ArrayBuffer";
const CONSTRUCTOR_TYPE_NAME = "ArrayBufferConstructor";
const ARGUMENT_INDEX = 1;
const OPTION_PROPERTY = "maxByteLength";

export const seed = createSeed({
	concern: `ArrayBuffer.maxByteLength_option`,
	compatKeys: [
		`javascript.builtins.ArrayBuffer.ArrayBuffer.maxByteLength_option`,
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

		if (isAvailable) {
			return {};
		}

		// バッファ型検証用のユーティリティをファクトリ関数から作成
		const validator = createTypePropertyValidator(
			TYPE_NAME,
			CONSTRUCTOR_TYPE_NAME,
			ARGUMENT_INDEX,
			OPTION_PROPERTY,
		)(context, seed, config, isAvailable);

		return {
			// TypeNameコンストラクタの呼び出し
			NewExpression(node: TSESTree.NewExpression) {
				// callee、引数、レポート対象のノードを検証
				if (
					!validator.validateConstructorCall(node.callee, node.arguments, node)
				) {
					return;
				}

				// インスタンス型をチェック（継承クラスの場合も検出するため）
				if (validator.validateType(node, false)) {
					validator.checkAndReportIfUnavailable(node);
				}
			},

			// TypeNameのサブクラスのコンストラクタからのsuper呼び出し
			"CallExpression[callee.type='Super']"(node: TSESTree.CallExpression) {
				// 対象プロパティ機能を使用していない場合はスキップ
				if (!validator.isUsingTargetFeature(node.arguments)) {
					return;
				}

				const classNode = validator.findParentClass(node);
				if (!classNode?.superClass) {
					return;
				}

				// 親クラスが対象型かをチェック
				if (validator.isTypeReference(classNode.superClass)) {
					validator.checkAndReportIfUnavailable(node);
					return;
				}

				// 型情報を使用した追加チェック
				if (validator.validateType(classNode.superClass, true)) {
					validator.checkAndReportIfUnavailable(node);
				}
			},
		};
	},
});

export default rule;
