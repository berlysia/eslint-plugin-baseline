
import rule, { seed } from "../../src/rules/javascript.builtins.Array.splice.ts";
import createSimpleRuleTest from "./utils/createSimpleRuleTest.ts";

createSimpleRuleTest({
  rule,
  seed,
  codes: [
    "const arr = [1, 2, 3, 4]; arr.splice(1, 1);",
    "const arr = [1, 2, 3, 4]; arr.splice(1, 1, 5);",
    // Make sure the splice is correctly matched in AST:
    "const spliced = [1, 2, 3].splice(0, 3);",
  ],
  validOnlyCodes: [
    "function manipulateArray(arr) { arr.splice(0, 2, 'a', 'b'); return arr; }",
  ],
  validOption: {
    asOf: "2020-01-01",
    support: "widely",
  },
  invalidOption: {
    asOf: "2017-01-01",
    support: "widely",
  },
  invalidOnlyCodes: [
    "[1, 2, 3].splice(0); // Remove all elements",
  ],
});
