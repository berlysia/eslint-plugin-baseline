import { computeBaseline } from "compute-baseline";
import { getParserServices } from "@typescript-eslint/utils/eslint-utils";
import type { TSESTree } from "@typescript-eslint/typescript-estree";
import { ensureConfig } from "../config.ts";
import type { BaselineRuleConfig } from "../types.ts";
import checkIsAvailable from "../utils/checkIsAvailable.ts";
import {
	createMessageData,
	createRule,
	createSeed,
} from "../utils/ruleFactory.ts";
import { createIsTargetType } from "../utils/createIsTargetType.ts";

export const seed = createSeed({
	concern: "ArrayBuffer[Symbol.species]の使用",
	compatKeys: ["javascript.builtins.ArrayBuffer.@@species"],
	mdnUrl:
		"https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer/Symbol.species",
	specUrl:
		"https://tc39.es/ecma262/multipage/structured-data.html#sec-get-arraybuffer-%symbol.species%",
	newlyAvailableAt: "2016-09-20",
	widelyAvailableAt: "2019-03-20",
});

const rule = createRule(seed, {
	create(context) {
		const options = context.options[0] || {};
		const config: BaselineRuleConfig = ensureConfig(options);

		const baseline = computeBaseline({
			compatKeys: seed.compatKeys,
			checkAncestors: true,
		});

		const services = getParserServices(context);
		const typeChecker = services.program.getTypeChecker();

		const isArrayBufferType = createIsTargetType(typeChecker, "ArrayBuffer");

		function checkAvailability(node: TSESTree.Node) {
			const isAvailable = checkIsAvailable(config, baseline);

			if (!isAvailable) {
				context.report({
					messageId: "notAvailable",
					node,
					data: createMessageData(seed, config).notAvailable,
				});
			}
		}

		return {
			// Symbol.speciesの直接アクセスを検出（例：ArrayBuffer[Symbol.species]）
			"MemberExpression[computed=true]"(node: TSESTree.MemberExpression) {
				// プロパティがSymbol.speciesかを確認
				if (
					node.property.type === "MemberExpression" &&
					node.property.object.type === "Identifier" &&
					node.property.object.name === "Symbol" &&
					node.property.property.type === "Identifier" &&
					node.property.property.name === "species"
				) {
					// オブジェクトがArrayBuffer型かの確認
					if (
						node.object.type === "Identifier" &&
						node.object.name === "ArrayBuffer"
					) {
						checkAvailability(node);
						return;
					}

					// 型情報を使用した確認
					const objectTsNode = services.esTreeNodeToTSNodeMap.get(node.object);
					const objectType = typeChecker.getTypeAtLocation(objectTsNode);

					if (isArrayBufferType(objectType)) {
						checkAvailability(node);
					}
				}
			},

			// クラス定義内での[Symbol.species]の使用を検出
			"MethodDefinition[computed=true]"(node: TSESTree.MethodDefinition) {
				// キーがSymbol.speciesかを確認
				if (
					node.key.type === "MemberExpression" &&
					node.key.object.type === "Identifier" &&
					node.key.object.name === "Symbol" &&
					node.key.property.type === "Identifier" &&
					node.key.property.name === "species"
				) {
					// 親クラスがArrayBufferかを確認
					let classNode = node.parent?.parent as
						| TSESTree.ClassDeclaration
						| TSESTree.ClassExpression;
					if (classNode?.superClass) {
						// 名前での確認
						if (
							classNode.superClass.type === "Identifier" &&
							classNode.superClass.name === "ArrayBuffer"
						) {
							checkAvailability(node);
							return;
						}

						// 型情報での確認
						const superClassTsNode = services.esTreeNodeToTSNodeMap.get(
							classNode.superClass,
						);
						const superClassType =
							typeChecker.getTypeAtLocation(superClassTsNode);

						if (isArrayBufferType(superClassType)) {
							checkAvailability(node);
						}
					}
				}
			},

			// ArrayBuffer継承クラスでのthis.constructorの使用検出
			"MemberExpression[property.name='constructor']"(
				node: TSESTree.MemberExpression,
			) {
				// this.constructorの形式を確認
				if (
					node.object.type === "ThisExpression" ||
					(node.object.type === "Identifier" && node.object.name === "this")
				) {
					// クラス内にあるかを確認
					let current: TSESTree.Node = node;
					while (current.parent) {
						if (
							current.parent.type === "ClassDeclaration" ||
							current.parent.type === "ClassExpression"
						) {
							const classNode = current.parent as
								| TSESTree.ClassDeclaration
								| TSESTree.ClassExpression;
							if (classNode.superClass) {
								// 名前による確認
								if (
									classNode.superClass.type === "Identifier" &&
									classNode.superClass.name === "ArrayBuffer"
								) {
									checkAvailability(node);
									return;
								}

								// 型情報による確認
								const superClassTsNode = services.esTreeNodeToTSNodeMap.get(
									classNode.superClass,
								);
								const superClassType =
									typeChecker.getTypeAtLocation(superClassTsNode);

								if (isArrayBufferType(superClassType)) {
									checkAvailability(node);
								}
								break;
							}
						}
						current = current.parent;
					}
				}
			},
		};
	},
});

export default rule;
