import "mdast-util-mdx-jsx";

import { readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { log } from "@acdh-oeaw/lib";
import { read } from "to-vfile";
import { matter } from "vfile-matter";

async function save() {
	const map = new Map();

	const sourceFolder = join(process.cwd(), "content-source", "posts");

	for (const entry of await readdir(sourceFolder, { withFileTypes: true })) {
		const filePath = join(sourceFolder, entry.name, "index.mdx");
		const vfile = await read(filePath);
		matter(vfile, { strip: true });
		const metadata = vfile.data.matter as any;
		const uuid = metadata.uuid;
		const type =
			metadata.remote?.date && metadata.remote.publisher && metadata.remote.url
				? "external"
				: metadata.type === "pathfinder"
					? "pathfinders"
					: "hosted";

		map.set(uuid, { name: entry.name, type });
	}

	await writeFile("uuid.json", JSON.stringify(Array.from(map.entries())), { encoding: "utf-8" });
}

save()
	.then(() => {
		log.success("Done.");
	})
	.catch((e: unknown) => {
		log.error("Failed.\n", String(e));
	});
