import fsp from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";

const { values: args } = parseArgs({
	options: {
		ruleName: {
			type: "string",
			short: "r",
		},
	},
});
const ruleName = args.ruleName;
if (!ruleName) {
	throw new Error("Rule name is required");
}
const ruleDir = path.join(process.cwd(), "./src/rules");
const seedDir = path.join(process.cwd(), "./src/generated");
const rulePath = path.join(ruleDir, `${ruleName}.ts`);
const seedPath = path.join(seedDir, `${ruleName}.json`);

const seedFile = await fsp.readFile(seedPath, "utf-8");
const seed = JSON.parse(seedFile);

const codeForBuiltins = `
import { computeBaseline } from "compute-baseline";
import { ensureConfig } from "../config.ts";
import type { BaselineRuleConfig } from "../types.ts";
import checkIsAvailable from "../utils/checkIsAvailable.ts";
import {
  createMessageData,
  createRule,
  createSeed,
} from "../utils/ruleFactory.ts";
import { getParserServices } from "@typescript-eslint/utils/eslint-utils";
import * as ts from "typescript";
import type { TSESTree } from "@typescript-eslint/typescript-estree";
import { createIsTargetType } from "../utils/createIsTargetType.ts";

export const seed = createSeed({
  concern: "FIXME",
  compatKeys: [${JSON.stringify(ruleName)}],
  mdnUrl: "${seed.bcd.mdn_url}",
  specUrl: "${seed.bcd.spec_url}",  
	newlyAvailableAt: "${seed.baseline.baseline_low_date}",;
	widelyAvailableAt: "${seed.baseline.baseline_high_date}",;
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

    const isTargetType = createIsTargetType(typeChecker, "FIXME");

    return {
      
    };
  },
});

export default rule;
`;

if (ruleName.startsWith("javascript.builtins.")) {
	await fsp.writeFile(rulePath, codeForBuiltins, "utf-8");
	console.log(`Rule ${ruleName} scaffold generated at ${rulePath}`);
}
