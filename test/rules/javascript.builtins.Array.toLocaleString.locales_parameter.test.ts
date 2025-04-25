
import "./utils/init.ts";
import { RuleTester } from "@typescript-eslint/rule-tester";
import rule, {
  seed,
} from "../../src/rules/javascript.builtins.Array.toLocaleString.locales_parameter.ts";
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
      code: "const arr = [1, 2, 3]; arr.toLocaleString('en-US');",
      options: [{ asOf: "2025-01-01", support: "widely" }],
    },
    {
      code: "const arr = [1, 2, 3]; arr.toLocaleString(['en-US', 'ja-JP']);",
      options: [{ asOf: "2025-01-01", support: "widely" }],
    },
    {
      code: "const myArray = new Array(10); myArray.toLocaleString('en-US');",
      options: [{ asOf: "2025-01-01", support: "widely" }],
    },
    {
      code: "Array.prototype.toLocaleString.call([1, 2, 3], 'en-US');",
      options: [{ asOf: "2025-01-01", support: "widely" }],
    },
    {
      code: "const arr = [1, 2, 3]; arr.toLocaleString();", // without locales parameter - should be valid
      options: [{ asOf: "2017-01-01", support: "widely" }],
    },
    {
      code: "const obj = { toLocaleString: (locale) => 'value' }; obj.toLocaleString('en-US');", // not an Array
      options: [{ asOf: "2017-01-01", support: "widely" }],
    },
  ],
  invalid: [
    {
      code: "const arr = [1, 2, 3]; arr.toLocaleString('en-US');",
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
      code: "const arr = [1, 2, 3]; arr.toLocaleString(['en-US', 'ja-JP']);",
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
      code: "const prices = [7, 500, 8123, 12]; prices.toLocaleString('ja-JP', { style: 'currency', currency: 'JPY' });",
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
