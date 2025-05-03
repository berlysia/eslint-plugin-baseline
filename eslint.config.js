import { globalIgnores } from "eslint/config";
import berlysia from "@berlysia/eslint-config";

export default berlysia(
	{
		tsConfigPath: "./tsconfig.json",
	},
	{
		linterOptions: {
			reportUnusedDisableDirectives: "off",
		},
		rules: {
			"max-depth": "off",
			"no-lonely-if": "off",
			"no-template-curly-in-string": "off",
			"@typescript-eslint/class-methods-use-this": "off",
			"@typescript-eslint/init-declarations": "off",
		},
	},
	globalIgnores([".tshy-build"]),
	{
		files: ["scripts/**/*.ts", "scripts/**/*.js"],
		rules: {
			"unicorn/no-process-exit": "off",
		},
	},
);
