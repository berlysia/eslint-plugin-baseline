import bcd, {
	type CompatStatement,
	type Identifier,
} from "@mdn/browser-compat-data" with { type: "json" };
import { computeBaseline } from "compute-baseline";
import fsp from "node:fs/promises";

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

class AsyncQueueWithConcurrency {
	#queue: (() => Promise<void>)[] = [];
	#runningSet: Set<Promise<void>> = new Set();
	#concurrency: number;
	#awaiterSet: Set<PromiseWithResolvers<void>> = new Set();

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
				promise.finally(() => {
					this.#runningSet.delete(promise);
					this.#checkWork();
				});
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
	#wrapWork<T>(
		fn: () => Promise<T>,
		resolve: (x: T) => void,
		reject: (e: unknown) => void,
	) {
		const wrapped = async () => {
			try {
				const result = await fn();
				resolve(result);
			} catch (e) {
				reject(e);
			}
		};
		return wrapped;
	}

	add<T>(fn: () => Promise<T>): Promise<T> {
		const promise = new Promise<T>((resolve, reject) => {
			this.#queue.push(this.#wrapWork(fn, resolve, reject));
		});
		this.#kickWork();

		return promise;
	}

	wait(): Promise<void> {
		const deferred = Promise.withResolvers<void>();
		this.#awaiterSet.add(deferred);
		deferred.promise.finally(() => {
			this.#awaiterSet.delete(deferred);
		});
		return deferred.promise;
	}

	run() {
		this.#kickWork();
	}
}

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
	const tagEntries = Array.from(tags.entries());
	const tagEntriesString = tagEntries
		.map(([key, value]) => `${JSON.stringify(key)}: ${JSON.stringify(value)}`)
		.join(",\n");
	const tagEntriesObject = `export const bcdTags = {\n${tagEntriesString}\n};\n`;
	await fsp.writeFile("src/generated/bcdTags.ts", tagEntriesObject);
}

void main().catch(console.error);
