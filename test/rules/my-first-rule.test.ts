import { RuleTester } from "eslint";
import rule from "../../src/rules/my-first-rule.ts";

const ruleTester = new RuleTester();
ruleTester.run("my-first-rule", rule, {
	valid: ["let a = 1;"],
	invalid: [
		{
			code: "console.log('Hello world');",
			errors: [{ message: "Unexpected console statement." }],
			output: "",
		},
	],
});
