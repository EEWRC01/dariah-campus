import "mdast-util-mdx-jsx";

import { createWriteStream, mkdirSync } from "node:fs";
import { mkdir, readdir, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

import { assert, isUrl, log } from "@acdh-oeaw/lib";
import slugify from "@sindresorhus/slugify";
import withFrontmatter from "remark-frontmatter";
import withGfm from "remark-gfm";
import withMdx from "remark-mdx";
import fromMarkdown from "remark-parse";
import toMarkdown from "remark-stringify";
import { read } from "to-vfile";
import { unified } from "unified";
import { visit } from "unist-util-visit";

async function download() {
	const sourceFolder = join(process.cwd(), "content-source", "posts");

	for (const entry of await readdir(sourceFolder, { withFileTypes: true })) {
		const filePath = join(sourceFolder, entry.name, "index.mdx");
		await mkdir(join(sourceFolder, entry.name, "images"), { recursive: true });

		const vfile = await read(filePath);

		const processor = unified()
			.use(withFrontmatter)
			.use(fromMarkdown)
			.use(withMdx)
			.use(withGfm)
			.use(() => {
				return async function transform(tree) {
					const promises: Array<[string, string]> = [];

					visit(tree, "mdxJsxFlowElement", (node) => {
						if (node.name === "Figure") {
							// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
							const urlAttr = node.attributes.find((a) => {
								// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
								return a.name === "src";
							});

							// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
							const url = urlAttr?.value;
							assert(url);

							// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
							if (isUrl(url)) {
								const targetFolder = join(sourceFolder, entry.name, "images");
								mkdirSync(targetFolder, { recursive: true });
								const fileName = slugify(basename(new URL(url).pathname));
								const targetFilePath = join(targetFolder, fileName);

								promises.push([url, targetFilePath]);

								urlAttr.value = `images/${fileName}`;
							}
						}
					});

					for (const [url, targetFilePath] of promises) {
						console.log(targetFilePath);
						const response = await fetch(url);
						const inputStream = Readable.fromWeb(response.body);
						const outputStream = createWriteStream(targetFilePath);
						await pipeline(inputStream, outputStream);
					}
				};
			})
			.use(toMarkdown, {
				bullet: "*",
				emphasis: "*",
				rule: "-",
				strong: "*",
			});

		await processor.process(vfile);

		await writeFile(filePath, String(vfile), { encoding: "utf-8" });
	}
}

download()
	.then(() => {
		log.success("Done.");
	})
	.catch((e) => {
		log.error("Failed.\n", String(e));
	});
