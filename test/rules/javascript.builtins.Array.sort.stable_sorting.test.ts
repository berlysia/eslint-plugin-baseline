
import "./init.ts";
import { RuleTester } from "@typescript-eslint/rule-tester";
import rule, {
  seed,
} from "../../src/rules/javascript.builtins.Array.sort.stable_sorting.ts";
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
      code: `
        const arr = [1, 2, 3, 4];
        arr.sort();
      `,
      options: [{ asOf: "2025-01-01", support: "widely" }],
    },
    {
      code: `
        const objects = [{ value: 1 }, { value: 2 }];
        objects.sort((a, b) => a.value - b.value);
      `,
      options: [{ asOf: "2025-01-01", support: "widely" }],
    },
    {
      code: `
        const someArray: Array<number> = [5, 3, 1];
        someArray.sort();
      `,
      options: [{ asOf: "2025-01-01", support: "widely" }],
    },
    {
      code: `
        [1, 2, 3].sort();
      `,
      options: [{ asOf: "2025-01-01", support: "widely" }],
    },
    {
      code: `
        const notArray = {
          sort() {}
        };
        notArray.sort();
      `,
      options: [{ asOf: "2017-01-01", support: "widely" }],
    },
  ],
  invalid: [
    {
      code: `
        const arr = [1, 2, 3, 4];
        arr.sort();
      `,
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
      code: `
        const objects = [{ value: 1 }, { value: 2 }];
        objects.sort((a, b) => a.value - b.value);
      `,
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
      code: `
        const someArray: Array<number> = [5, 3, 1];
        someArray.sort();
      `,
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
      code: `
        [1, 2, 3].sort();
      `,
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
