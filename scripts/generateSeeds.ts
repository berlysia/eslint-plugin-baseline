import fsp from "node:fs/promises";
import bcd from "@mdn/browser-compat-data" with { type: "json" };
import type { CompatStatement, Identifier } from "@mdn/browser-compat-data";
import { computeBaseline } from "compute-baseline";

function getKeysWithoutCompat(obj: object) {
	const keys = Object.keys(obj);
	const nonCompatKeys = keys.filter((key) => key !== "__compat");
	return nonCompatKeys;
}

type CompatEntry = {
	name: string;
	keys: string[];
	value: CompatStatement;
};

function* recursiveKeys(obj: Identifier, prefix = ""): Generator<CompatEntry> {
	for (const [key, value] of Object.entries(obj)) {
		if (key === "__compat") {
			continue;
		}
		const newKey = prefix ? `${prefix}.${key}` : key;
		if (typeof value === "object" && value !== null) {
			if (
				"__compat" in value &&
				value.__compat &&
				!getKeysWithoutCompat(value).includes(key)
			) {
				yield {
					name: newKey,
					keys: getKeysWithoutCompat(value),
					value: value.__compat,
				};
			}
			yield* recursiveKeys(value as Identifier, newKey);
		}
	}
}

function* iterateBCD(givenBcd: typeof bcd) {
	for (const [key, value] of Object.entries(givenBcd)) {
		yield* recursiveKeys(value, key);
	}
}

/* eslint-disable no-void, promise/prefer-await-to-then, promise/catch-or-return -- promise tool */
class AsyncQueueWithConcurrency {
	#queue: Array<() => Promise<void>> = [];
	#runningSet = new Set<Promise<void>>();
	#concurrency: number;
	#awaiterSet = new Set<PromiseWithResolvers<void>>();

	constructor(concurrency: number) {
		this.#concurrency = concurrency;
	}
	#kickWork() {
		while (
			this.#runningSet.size < this.#concurrency &&
			this.#queue.length > 0
		) {
			const work = this.#queue.shift();
			if (work) {
				const promise = work();
				this.#runningSet.add(promise);
				promise
					.finally(() => {
						this.#runningSet.delete(promise);
						this.#checkWork();
					})
					.catch(console.error);
			}
		}
	}
	#checkWork() {
		if (this.#queue.length === 0 && this.#runningSet.size === 0) {
			for (const deferred of this.#awaiterSet) {
				deferred.resolve();
			}
			this.#awaiterSet.clear();
		} else {
			this.#kickWork();
		}
	}

	add<T>(fn: () => Promise<T>): Promise<T> {
		const promise = new Promise<T>((resolve, reject) => {
			this.#queue.push(async function wrapped() {
				try {
					const result = await fn();
					resolve(result);
				} catch (error) {
					reject(error);
				}
			});
		});
		this.#kickWork();

		return promise;
	}

	wait(): Promise<void> {
		// eslint-disable-next-line @typescript-eslint/no-invalid-void-type -- this pattern requires it
		const deferred = Promise.withResolvers<void>();
		this.#awaiterSet.add(deferred);
		deferred.promise.catch(console.error).finally(() => {
			this.#awaiterSet.delete(deferred);
		});
		return deferred.promise;
	}

	run() {
		this.#kickWork();
	}
}
/* eslint-enable no-void, promise/prefer-await-to-then, promise/catch-or-return */

async function main() {
	// ensure empty `bcdKeys.ts` file
	await fsp.rm("src/generated", { recursive: true, force: true });
	await fsp.mkdir("src/generated", { recursive: true });
	const tags = new Map<string, string[]>();

	const queue = new AsyncQueueWithConcurrency(4);

	for (const value of iterateBCD(bcd).filter((x) =>
		/* x.name.startsWith("api.") || */ x.name.startsWith("javascript."),
	)) {
		queue.add(async () => {
			const baseline = computeBaseline({
				compatKeys: [value.name],
				checkAncestors: true,
			});
			fsp.writeFile(
				`src/generated/${value.name}.json`,
				JSON.stringify(
					{ bcd: value.value, baseline: JSON.parse(baseline.toJSON()) },
					null,
					2,
				),
			);
		});
		for (const tag of value.value.tags ?? []) {
			if (tags.has(tag)) {
				tags.get(tag)?.push(value.name);
			} else {
				tags.set(tag, [value.name]);
			}
		}
	}

	// wait for all tasks to finish
	await queue.wait();

	// write tags to `bcdTags.ts`
	const tagEntries = [...tags.entries()];
	const tagEntriesString = tagEntries
		.map(([key, value]) => `${JSON.stringify(key)}: ${JSON.stringify(value)}`)
		.join(",\n");
	const tagEntriesObject = `export const bcdTags = {\n${tagEntriesString}\n};\n`;
	await fsp.writeFile("src/generated/bcdTags.ts", tagEntriesObject);
}

await main();
