import "./init.ts";
import { RuleTester } from "@typescript-eslint/rule-tester";
import { createMessageData } from "../../../src/utils/ruleFactory.ts";
import type {
	Rule,
	RuleModuleSeed,
	RuleOptions,
} from "../../../src/utils/ruleFactory.ts";

export default function createSimpleRuleTest(option: {
	rule: Rule;
	seed: RuleModuleSeed;
	codes: string[];
	validOption: RuleOptions[0];
	invalidOption: RuleOptions[0];
}) {
	const tester = new RuleTester({
		languageOptions: {
			parserOptions: {
				projectService: {
					allowDefaultProject: ["*.ts*"],
				},
				tsconfigRootDir: process.cwd(),
			},
		},
	});

	tester.run(option.seed.concern, option.rule, {
		valid: option.codes.map((code) => ({
			options: [option.validOption],
			code,
		})),
		invalid: option.codes.map((code) => ({
			options: [option.invalidOption],
			code,
			errors: [
				{
					messageId: "notAvailable",
					data: createMessageData(option.seed, option.invalidOption)
						.notAvailable,
				},
			],
		})),
	});
}
