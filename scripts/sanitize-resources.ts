import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { log } from "@acdh-oeaw/lib";

async function sanitize() {
	const sourceFolder = join(process.cwd(), "content-source", "posts");

	for (const entry of await readdir(sourceFolder, { withFileTypes: true })) {
		const filePath = join(sourceFolder, entry.name, "index.mdx");

		let fileContent = await readFile(filePath, { encoding: "utf-8" });
		fileContent = fileContent.replaceAll(/[‘’]/g, "'").replace(/\xa0/g, " ");

		await writeFile(filePath, fileContent, { encoding: "utf-8" });
	}
}

sanitize()
	.then(() => {
		log.success("Done.");
	})
	.catch(() => {
		log.error("Failed.");
	});
