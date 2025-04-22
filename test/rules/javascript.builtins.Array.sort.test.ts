
import "./init.ts";
import { RuleTester } from "@typescript-eslint/rule-tester";
import rule, {
  seed,
} from "../../src/rules/javascript.builtins.Array.sort.ts";
import { createMessageData } from "../../src/utils/ruleFactory.ts";

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

tester.run(seed.concern, rule, {
  valid: [
    {
      code: "const arr = [3, 1, 2]; arr.sort();",
      options: [{ asOf: "2025-01-01", support: "widely" }],
    },
    {
      code: "[5, 1, 4, 2, 3].sort((a, b) => a - b);",
      options: [{ asOf: "2025-01-01", support: "widely" }],
    },
    {
      code: "const sortedArray = someArray.filter(x => x > 0).sort();",
      options: [{ asOf: "2025-01-01", support: "widely" }],
    },
    {
      code: "array.slice().sort();", // chained sort
      options: [{ asOf: "2025-01-01", support: "widely" }],
    },
    {
      code: "new Array(5).fill(0).sort();", // instantiated array
      options: [{ asOf: "2025-01-01", support: "widely" }],
    },
  ],
  invalid: [
    {
      code: "const arr = [3, 1, 2]; arr.sort();",
      options: [{ asOf: "2017-01-01", support: "widely" }],
      errors: [
        {
          messageId: "notAvailable",
          data: createMessageData(seed, {
            asOf: "2017-01-01", 
            support: "widely",
          }).notAvailable,
        },
      ],
    },
    {
      code: "[5, 1, 4, 2, 3].sort((a, b) => a - b);",
      options: [{ asOf: "2017-01-01", support: "widely" }],
      errors: [
        {
          messageId: "notAvailable",
          data: createMessageData(seed, {
            asOf: "2017-01-01",
            support: "widely",
          }).notAvailable,
        },
      ],
    },
    {
      code: "function sortArray(array) { return array.sort(); }",
      options: [{ asOf: "2017-01-01", support: "widely" }],
      errors: [
        {
          messageId: "notAvailable",
          data: createMessageData(seed, {
            asOf: "2017-01-01",
            support: "widely",
          }).notAvailable,
        },
      ],
    },
  ],
});
