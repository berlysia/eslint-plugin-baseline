import "./init.ts";
import { RuleTester } from "@typescript-eslint/rule-tester";
import rule, {
	seed,
} from "../../src/rules/javascript.builtins.AggregateError.errors.ts";
import { createMessageData } from "../../src/utils/ruleFactory.ts";

const tester = new RuleTester();

tester.run(seed.concern, rule, {
	valid: [
		// 基本的なケース - 新しい日付での利用
		{
			code: "const err = new AggregateError([]); const errors = err.errors;",
			options: [{ asOf: "2025-01-01", support: "widely" }],
		},
		// 型情報を使用したケース - 変数経由
		{
			code: `
                const createError = () => new AggregateError([]);
                const err = createError();
                const errors = err.errors;
            `,
			options: [{ asOf: "2025-01-01", support: "widely" }],
		},
		// 継承したクラスでの利用
		{
			code: `
                class CustomError extends AggregateError {
                    constructor() {
                        super([]);
                    }
                }
                const err = new CustomError();
                const errors = err.errors;
            `,
			options: [{ asOf: "2025-01-01", support: "widely" }],
		},
		// 継承したクラスのメソッド内での利用
		{
			code: `
                class CustomError extends AggregateError {
                    getErrors() {
                        return this.errors;
                    }
                }
                const err = new CustomError([]);
                err.getErrors();
            `,
			options: [{ asOf: "2025-01-01", support: "widely" }],
		},
		// 他のオブジェクトの errors プロパティへのアクセス（誤検知防止）
		{
			code: `
                const obj = { errors: [] };
                const errors = obj.errors;
            `,
			options: [{ asOf: "2020-01-01", support: "widely" }],
		},
		// Optional Chainingでのアクセス - 新しい日付
		{
			code: `
                const err = new AggregateError([]);
                const errors = err?.errors;
            `,
			options: [{ asOf: "2025-01-01", support: "widely" }],
		},
		// Union型での利用 - 新しい日付
		{
			code: `
                function processError(err: Error | AggregateError) {
                    if (err instanceof AggregateError) {
                        return err.errors;
                    }
                    return [];
                }
            `,
			options: [{ asOf: "2025-01-01", support: "widely" }],
		},
		// インターフェース継承での利用 - 新しい日付
		{
			code: `
                interface CustomAggregateError extends AggregateError {}
                const err: CustomAggregateError = new AggregateError([]);
                const errors = err.errors;
            `,
			options: [{ asOf: "2025-01-01", support: "widely" }],
		},
		// 分割代入 - 新しい日付
		{
			code: `
                const err = new AggregateError([]);
                const { errors } = err;
            `,
			options: [{ asOf: "2025-01-01", support: "widely" }],
		},
	],
	invalid: [
		// 基本的なケース - 古い日付での利用
		{
			code: "const err = new AggregateError([]); const errors = err.errors;",
			options: [{ asOf: "2020-01-01", support: "widely" }],
			errors: [
				{
					messageId: "notAvailable",
					data: createMessageData(seed, {
						asOf: "2020-01-01",
						support: "widely",
					}).notAvailable,
				},
			],
		},
		// 型情報を使用したケース - メソッド内での利用
		{
			code: `
                function processError(err: AggregateError) {
                    return err.errors;
                }
                const error = new AggregateError([]);
                processError(error);
            `,
			options: [{ asOf: "2020-01-01", support: "widely" }],
			errors: [
				{
					messageId: "notAvailable",
					data: createMessageData(seed, {
						asOf: "2020-01-01",
						support: "widely",
					}).notAvailable,
				},
			],
		},
		// 継承したクラスでの利用
		{
			code: `
                class CustomError extends AggregateError {
                    constructor() {
                        super([]);
                    }
                }
                const err = new CustomError();
                const errors = err.errors;
            `,
			options: [{ asOf: "2020-01-01", support: "widely" }],
			errors: [
				{
					messageId: "notAvailable",
					data: createMessageData(seed, {
						asOf: "2020-01-01",
						support: "widely",
					}).notAvailable,
				},
			],
		},
		// 継承したクラスのメソッド内での利用
		{
			code: `
                class CustomError extends AggregateError {
                    getErrors() {
                        return this.errors;
                    }
                }
                const err = new CustomError([]);
                err.getErrors();
            `,
			options: [{ asOf: "2020-01-01", support: "widely" }],
			errors: [
				{
					messageId: "notAvailable",
					data: createMessageData(seed, {
						asOf: "2020-01-01",
						support: "widely",
					}).notAvailable,
				},
			],
		},
		// Optional Chainingでのアクセス - 古い日付
		{
			code: `
                const err = new AggregateError([]);
                const errors = err?.errors;
            `,
			options: [{ asOf: "2020-01-01", support: "widely" }],
			errors: [
				{
					messageId: "notAvailable",
					data: createMessageData(seed, {
						asOf: "2020-01-01",
						support: "widely",
					}).notAvailable,
				},
			],
		},
		// Union型での利用 - 古い日付
		{
			code: `
                function processError(err: Error | AggregateError) {
                    if (err instanceof AggregateError) {
                        return err.errors;
                    }
                    return [];
                }
            `,
			options: [{ asOf: "2020-01-01", support: "widely" }],
			errors: [
				{
					messageId: "notAvailable",
					data: createMessageData(seed, {
						asOf: "2020-01-01",
						support: "widely",
					}).notAvailable,
				},
			],
		},
		// インターフェース継承での利用 - 古い日付
		{
			code: `
                interface CustomAggregateError extends AggregateError {}
                const err: CustomAggregateError = new AggregateError([]);
                const errors = err.errors;
            `,
			options: [{ asOf: "2020-01-01", support: "widely" }],
			errors: [
				{
					messageId: "notAvailable",
					data: createMessageData(seed, {
						asOf: "2020-01-01",
						support: "widely",
					}).notAvailable,
				},
			],
		},
		// 分割代入 - 古い日付
		{
			code: `
                const err = new AggregateError([]);
                const { errors } = err;
            `,
			options: [{ asOf: "2020-01-01", support: "widely" }],
			errors: [
				{
					messageId: "notAvailable",
					data: createMessageData(seed, {
						asOf: "2020-01-01",
						support: "widely",
					}).notAvailable,
				},
			],
		},
	],
});
