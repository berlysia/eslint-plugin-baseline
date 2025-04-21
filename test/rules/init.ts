import { describe, it, after } from "node:test";
import { RuleTester } from "eslint";
import { RuleTester as TSRuleTester } from "@typescript-eslint/rule-tester";

RuleTester.describe = describe;
TSRuleTester.describe = describe;
RuleTester.it = it;
TSRuleTester.it = it;
TSRuleTester.afterAll = after;

// TypeScriptのParser設定を有効化
TSRuleTester.setDefaultConfig({
	languageOptions: {
		parserOptions: {
			projectService: {
				allowDefaultProject: ["*.ts*"],
			},
			tsconfigRootDir: process.cwd(),
		},
	},
});
