// src/generatedにあってsrc/rules配下にないファイル名を一つ返す

import fsp from "node:fs/promises";
import path from "node:path";
import { transformRuleName } from "./utils.ts";

const srcDir = path.join(process.cwd(), "./src");
const rulesDir = path.join(srcDir, "rules");
const generatedDir = path.join(srcDir, "generated");
const rules = await fsp.readdir(rulesDir);
const generated = await fsp.readdir(generatedDir);
const ruleNames = new Set(rules.map((rule) => path.basename(rule, ".ts")));
const generatedNames = generated
	.filter((x) => x.endsWith(".json"))
	.map((rule) => path.basename(rule, ".json"));

const unimplementedRuleNames = generatedNames.filter(
	(name) => !ruleNames.has(transformRuleName(name)),
);

if (unimplementedRuleNames.length === 0) {
	throw new Error("No unimplemented rules found");
}

const unimplementedRuleName = unimplementedRuleNames[0];
const unimplementedRuleSeedPath = path.join(
	generatedDir,
	`${unimplementedRuleName}.json`,
);
const transformedRuleName = transformRuleName(unimplementedRuleName);
const rulePathToBeImplemented = path.join(
	rulesDir,
	`${transformedRuleName}.ts`,
);

console.log({
	ruleName: unimplementedRuleName,
	seedPath: unimplementedRuleSeedPath,
	rulePath: rulePathToBeImplemented,
});
