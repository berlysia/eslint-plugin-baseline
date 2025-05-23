import type { RuleContext } from "@typescript-eslint/utils/ts-eslint";
import type { TSESTree } from "@typescript-eslint/typescript-estree";
import type { BaselineRuleConfig } from "../../types.ts";
import type { RuleModuleSeed } from "../ruleFactory.ts";
import { createSharedValidator } from "./sharedValidator.ts";

export function createStaticMethodValidator({
	typeName,
	constructorTypeName,
	methodName,
}: {
	typeName: string;
	constructorTypeName: string;
	methodName: string;
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
