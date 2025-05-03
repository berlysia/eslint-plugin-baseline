import type { RuleContext } from "@typescript-eslint/utils/ts-eslint";
import type { TSESTree } from "@typescript-eslint/typescript-estree";
import type { BaselineRuleConfig } from "../../types.ts";
import type { RuleModuleSeed } from "../ruleFactory.ts";
import { createSharedValidator, findParentClass } from "./sharedValidator.ts";

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
