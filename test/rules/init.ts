import { RuleTester } from "eslint";
import { RuleTester as TSRuleTester } from "@typescript-eslint/rule-tester";
import { describe, it, after } from "node:test";

RuleTester.describe = TSRuleTester.describe = describe;
RuleTester.it = TSRuleTester.it = it;
TSRuleTester.afterAll = after;
