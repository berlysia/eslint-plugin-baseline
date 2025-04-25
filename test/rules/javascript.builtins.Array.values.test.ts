
import rule, {
  seed,
} from "../../src/rules/javascript.builtins.Array.values.ts";
import createSimpleRuleTest from "./utils/createSimpleRuleTest.ts";

createSimpleRuleTest({
  rule,
  seed,
  codes: [
    // Basic usage of values() method
    "const arr = [1, 2, 3]; const iterator = arr.values();",
    // Iterating using for...of
    "const arr = ['a', 'b', 'c']; for (const value of arr.values()) { console.log(value); }",
    // Using next() method on the iterator
    "const arr = [1, 2, 3]; const iterator = arr.values(); iterator.next();",
    // Using with sparse arrays
    "const sparseArr = [,,,]; const iterator = sparseArr.values();",
    // Using explicitly with Array.prototype
    "Array.prototype.values.call([1, 2, 3]);",
  ],
  validOnlyCodes: [
    // Regular array access without values()
    "const arr = [1, 2, 3]; arr[0];",
    // Using other array methods
    "const arr = [1, 2, 3]; arr.forEach(item => console.log(item));",
    // Object with a similar method but not an array
    "const obj = { values: () => [1, 2, 3] }; obj.values();",
  ],
  validOption: {
    asOf: "2020-11-10",
    support: "widely",
  },
  invalidOption: {
    asOf: "2018-05-08", // Before the newly available date
    support: "widely",
  },
});
