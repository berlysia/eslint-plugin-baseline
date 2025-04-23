import rule, {
	seed,
} from "../../src/rules/javascript.builtins.AggregateError.errors.ts";
import createSimpleRuleTest from "./utils/createSimpleRuleTest.ts";

createSimpleRuleTest({
	rule,
	seed,
	codes: [
		`const err = new AggregateError([]); const errors = err.errors;`,
		`const createError = () => new AggregateError([]);
				const err = createError();
				const errors = err.errors;`,
		`class CustomError extends AggregateError {
			constructor() {
				super([]);
			}
		}
		const err = new CustomError();
		const errors = err.errors;`,
		`class CustomError extends AggregateError {
			getErrors() {
				return this.errors;
			}
		}
		const err = new CustomError([]);
		err.getErrors();`,
		`const err = new AggregateError([]);
		const { errors } = err;`,
		`function processError(err: Error | AggregateError) {
			if (err instanceof AggregateError) {
				return err.errors;
			}
			return [];
		}`,
	],
	validOnlyCodes: [
		`const obj = { errors: [] };
		const errors = obj.errors;`,
	],
	validOption: {
		asOf: "2025-01-01",
		support: "widely",
	},
	invalidOption: {
		asOf: "2020-01-01",
		support: "widely",
	},
});
