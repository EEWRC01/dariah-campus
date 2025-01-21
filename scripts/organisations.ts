import "mdast-util-mdx-jsx";

import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { log } from "@acdh-oeaw/lib";
import * as YAML from "yaml";

async function save() {
	const map = new Map();

	const sourceFolder = join(process.cwd(), "content-source", "organisations");

	for (const entry of await readdir(sourceFolder, { withFileTypes: true })) {
		if (!entry.isFile()) continue;

		const filePath = join(sourceFolder, entry.name);
		const fileContent = await readFile(filePath, { encoding: "utf-8" });
		const data = YAML.parse(fileContent);

		const org = {
			name: data.name,
			url: data.url,
			logo: data.logo ? join(sourceFolder, data.logo) : undefined,
		};

		map.set(entry.name, org);
	}

	await writeFile("organisations.json", JSON.stringify(Array.from(map.entries())), {
		encoding: "utf-8",
	});
}

save()
	.then(() => {
		log.success("Done.");
	})
	.catch((e: unknown) => {
		log.error("Failed.\n", String(e));
	});
