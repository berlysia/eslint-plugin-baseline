
import "./init.ts";
import { RuleTester } from "@typescript-eslint/rule-tester";
import rule, {
  seed,
} from "../../src/rules/javascript.builtins.Array.some.ts";
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
      code: "[1, 2, 3].some(x => x > 2)",
      options: [{ asOf: "2025-01-01", support: "widely" }],
    },
    {
      code: "const arr = ['a', 'b', 'c']; arr.some(item => item === 'b')",
      options: [{ asOf: "2025-01-01", support: "widely" }],
    },
    {
      code: "const nums: number[] = [1, 2, 3]; nums.some(num => num % 2 === 0)",
      options: [{ asOf: "2025-01-01", support: "widely" }],
    },
    {
      code: "myString.some(x => x)", // Not an array method call
      options: [{ asOf: "2025-01-01", support: "widely" }],
    },
  ],
  invalid: [
    {
      code: "[1, 2, 3].some(x => x > 2)",
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
      code: "const arr = [1, 2, 3]; arr.some(predicate)",
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
      code: "new Array(5).some((_, i) => i > 3)",
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
