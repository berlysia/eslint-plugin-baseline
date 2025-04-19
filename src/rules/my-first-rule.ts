import type { RuleDefinition } from "@eslint/core";

const rule: RuleDefinition = {
	meta: {
		type: "problem",
		docs: {
			description:
				"Optional Chaining が各主要ブラウザで指定されたBaseline（limited/newly/widely）を満たしているかチェックするルール",
			category: "Best Practices",
			recommended: false,
			url: "https://github.com/mdn/browser-compat-data", // 詳細情報はこちら
		},
		schema: [
			{
				type: "object",
				properties: {
					browsers: {
						type: "array",
						items: { type: "string" },
						default: ["chrome", "firefox", "safari", "edge"],
					},
					baseline: {
						type: "string",
						enum: ["limited", "newly", "widely"],
						default: "widely",
					},
				},
				additionalProperties: false,
			},
		],
		messages: {
			unsupportedFeature:
				"Optional Chaining は指定された Baseline ({{baseline}}) を満たしていません。",
		},
	},

	create(context) {
		const options = context.options[0] || {};
		const browsers = options.browsers || [
			"chrome",
			"firefox",
			"safari",
			"edge",
		];
		const baseline = options.baseline || "widely";

		/**
		 * mdn-browser-compat-data の optional chaining の互換性情報を利用して、
		 * 対象ブラウザすべてでサポートされているかを確認する。
		 * ※ここではシンプルに、各ブラウザに対して version_added が truthy であればサポートと判定しています。
		 *
		 * 実際のBaseline判定では、例えばサポート開始からの経過期間など追加の条件を付与することが考えられます。
		 *
		 * @returns {boolean} 全ての対象ブラウザでサポートされていれば true
		 */
		function isOptionalChainingSupported() {
			// mdn-browser-compat-data 内の optional chaining の互換性データ
			const supportData = bcd.javascript.operators["optional-chaining"].support;
			return browsers.every((browser) => {
				const data = supportData[browser];
				if (!data) {
					// 情報が無い場合はサポート外と判断
					return false;
				}
				// data はオブジェクトまたは配列の場合があるため、配列化してチェック
				const supports = Array.isArray(data) ? data : [data];
				// どれか1件でも version_added が truthy であれば「サポート済み」とみなす
				return supports.some(
					(entry) => entry.version_added && entry.version_added !== false,
				);
			});
		}

		/**
		 * OptionalChainingExpression ノードを検出した際に、互換性チェックを行う
		 */
		function checkOptionalChaining(node) {
			if (!isOptionalChainingSupported()) {
				context.report({
					node,
					messageId: "unsupportedFeature",
					data: { baseline },
				});
			}
		}

		return {
			// @typescript-eslint/parser などを利用している場合、OptionalChainingExpression ノードが検出されます
			OptionalChainingExpression: checkOptionalChaining,
		};
	},
};

export default rule;
