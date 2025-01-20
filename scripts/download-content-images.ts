import "mdast-util-mdx-jsx";

import { createWriteStream, mkdirSync } from "node:fs";
import { mkdir, readdir, writeFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

import { isUrl, log } from "@acdh-oeaw/lib";
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
					const images: Array<[string, string, any]> = [];

					visit(tree, "image", (node) => {
						const url = node.url;
						const alt = node.alt;

						if (isUrl(url)) {
							const targetFolder = join(sourceFolder, entry.name, "images");
							mkdirSync(targetFolder, { recursive: true });
							const fileName = slugify(basename(new URL(url).pathname), {
								preserveCharacters: ["."],
							});
							const targetFilePath = join(targetFolder, fileName);

							images.push([url, targetFilePath, node]);

							node.url = `images/${fileName}`;
						}
					});

					for (let [url, targetFilePath, _node] of images) {
						console.log(targetFilePath);
						const response = await fetch(url);
						const inputStream = Readable.fromWeb(response.body);

						const mime = response.headers.get("content-type");
						if (!mime.startsWith("image/")) {
							throw new Error("Invalid mime type.");
						}
						if (!extname(targetFilePath).length) {
							targetFilePath = `${targetFilePath}.${mime.slice(6)}`;
							_node.url = `${_node.url}.${mime.slice(6)}`;
						}

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
