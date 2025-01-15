/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import "mdast-util-mdx-jsx";

import { copyFile, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { extname, join, relative } from "node:path";

import { assert, log } from "@acdh-oeaw/lib";
import { typographyConfig } from "@acdh-oeaw/mdx-lib";
import slugify from "@sindresorhus/slugify";
import withGfm from "remark-gfm";
import withMdx from "remark-mdx";
import fromMarkdown from "remark-parse";
import withTypographicQuotes from "remark-smartypants";
import toMarkdown from "remark-stringify";
import { read } from "to-vfile";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import { matter } from "vfile-matter";
import * as YAML from "yaml";

import { contentTypes, type SocialMediaKind } from "@/lib/keystatic/options";

const publicFolder = join(process.cwd(), "public");
const sourceFolder = join(process.cwd(), "content-source");
const contentFolder = join(process.cwd(), "content");

function sanitize(input: string) {
	return slugify(input);
}

interface PersonSource {
	avatar?: string;
	description?: string;
	email?: string;
	firstName: string;
	lastName: string;
	orcid?: string;
	twitter?: string;
	website?: string;
}

interface Person {
	image: string;
	name: string;
	social: Array<{ kind: SocialMediaKind; href: string }>;
}

interface ResourceSource {
	title: string;
	shortTitle?: string;
	lang: "en" | "de" | "sv";
	/** publication date */
	date: string;
	version: string;
	// FIXME: WHY ARE THERE STILL RESOURCES WITHOUT AUTHORS
	authors?: Array<string>;
	editors?: Array<string>;
	contributors?: Array<string>;
	tags: Array<string>;
	/** sources */
	categories: Array<string>;
	featuredImage?: string;
	abstract: string;
	domain: "Social Sciences and Humanities";
	targetGroup: "Domain researchers";
	/** content type */
	type: string;
	remote?: {
		date: string;
		url?: string;
		publisher?: string;
	};
	licence: "ccby-4.0";
	toc?: boolean;
	draft?: boolean;
}

interface HostedResource {
	title: string;
	locale: "en" | "de" | "sv";
	"publication-date": string;
	version: string;
	authors: Array<string>;
	editors: Array<string>;
	contributors: Array<string>;
	tags: Array<string>;
	sources: Array<string>;
	"featured-image"?: string;
	license: "cc-by-4.0";
	"table-of-contents": boolean;
	summary: {
		/** short title */
		title?: string;
		content: string;
	};
	"content-type": string;
}

interface ExternalResource {
	title: string;
	locale: "en" | "de" | "sv";
	"publication-date": string;
	version: string;
	authors: Array<string>;
	editors: Array<string>;
	contributors: Array<string>;
	tags: Array<string>;
	sources: Array<string>;
	"featured-image"?: string;
	license: "cc-by-4.0";
	"table-of-contents": boolean;
	summary: {
		/** short title */
		title?: string;
		content: string;
	};
	remote: {
		"publication-date": string;
		url: string;
		publisher: string;
	};
	"content-type": string;
}

interface SourceSource {
	description?: string;
	image?: string;
	name: string;
}

interface Source {
	name: string;
	image: string;
}

interface TagSource {
	description?: string;
	name: string;
}

interface Tag {
	name: string;
}

async function migratePeople() {
	try {
		const people = new Map<string, string>(
			// @ts-expect-error It's fine.
			(await import("../people.json", { with: { type: "json" } })).default,
		);
		return people;
	} catch {
		/** noop */
	}

	const dataFolderPath = join(sourceFolder, "people");
	const collectionFolder = join(contentFolder, "en", "people");

	/** Map legacy identifiers to new ones. */
	const map = new Map<string, string>();

	for (const entry of await readdir(dataFolderPath, { withFileTypes: true })) {
		if (!entry.isFile()) continue;

		const filePath = join(dataFolderPath, entry.name);
		const fileContent = await readFile(filePath, { encoding: "utf-8" });
		const metadata = YAML.parse(fileContent) as PersonSource;

		const sanitizedFileName = sanitize([metadata.lastName, metadata.firstName].join("-"))
			.replace(/\s+/, "-")
			.toLowerCase();
		const outputFolderPath = join(collectionFolder, sanitizedFileName);
		const outputFilePath = join(outputFolderPath, "index.mdx");
		await mkdir(outputFolderPath, { recursive: true });

		map.set(entry.name.slice(0, -extname(entry.name).length), sanitizedFileName);

		const frontmatter: Person = {
			name: [metadata.firstName, metadata.lastName].join(" "),
			image: "/assets/images/default-avatar.svg",
			social: [],
		};

		if (metadata.email) {
			frontmatter.social.push({ kind: "email", href: metadata.email });
		}
		if (metadata.orcid) {
			frontmatter.social.push({ kind: "orcid", href: metadata.orcid });
		}
		if (metadata.twitter) {
			frontmatter.social.push({ kind: "twitter", href: metadata.twitter });
		}
		if (metadata.website) {
			frontmatter.social.push({ kind: "website", href: metadata.website });
		}

		if (metadata.avatar) {
			if (metadata.avatar.startsWith("http")) {
				log.warn(`Received avatar url: ${metadata.avatar} for ${entry.name}.`);
			} else {
				const imageFilePath = join(dataFolderPath, metadata.avatar);
				const imageExtension = extname(imageFilePath);

				const outputImageFolder = join(
					publicFolder,
					"assets",
					"content",
					"assets",
					"en",
					"people",
					sanitizedFileName,
				);
				await mkdir(outputImageFolder, { recursive: true });
				const outputImageFilePath = join(outputImageFolder, `image${imageExtension}`);
				await copyFile(imageFilePath, outputImageFilePath);
				frontmatter.image = `/${relative(publicFolder, outputImageFilePath)}`;
			}
		}

		const content = metadata.description;

		const output = `---\n${YAML.stringify(frontmatter)}---\n${content ?? ""}`;

		await writeFile(outputFilePath, output, { encoding: "utf-8" });
	}

	await writeFile("people.json", JSON.stringify(Array.from(map.entries())), { encoding: "utf-8" });

	return map;
}

async function migrateTags() {
	try {
		const tags = new Map<string, string>(
			// @ts-expect-error It's fine.
			(await import("../tags.json", { with: { type: "json" } })).default,
		);
		return tags;
	} catch {
		/** noop */
	}

	const dataFolderPath = join(sourceFolder, "tags");
	const collectionFolder = join(contentFolder, "en", "tags");

	/** Map legacy identifiers to new ones. */
	const map = new Map<string, string>();

	for (const entry of await readdir(dataFolderPath, { withFileTypes: true })) {
		if (!entry.isFile()) continue;

		const filePath = join(dataFolderPath, entry.name);
		const fileContent = await readFile(filePath, { encoding: "utf-8" });
		const metadata = YAML.parse(fileContent) as TagSource;

		const sanitizedFileName = sanitize(metadata.name).replace(/\s+/, "-").toLowerCase();
		const outputFolderPath = join(collectionFolder, sanitizedFileName);
		const outputFilePath = join(outputFolderPath, "index.mdx");
		await mkdir(outputFolderPath, { recursive: true });

		map.set(entry.name.slice(0, -extname(entry.name).length), sanitizedFileName);

		const frontmatter: Tag = {
			name: metadata.name,
		};

		const content = metadata.description;

		const output = `---\n${YAML.stringify(frontmatter)}---\n${content ?? ""}`;

		await writeFile(outputFilePath, output, { encoding: "utf-8" });
	}

	await writeFile("tags.json", JSON.stringify(Array.from(map.entries())), { encoding: "utf-8" });

	return map;
}

async function migrateSources() {
	try {
		const sources = new Map<string, string>(
			// @ts-expect-error It's fine.
			(await import("../sources.json", { with: { type: "json" } })).default,
		);
		return sources;
	} catch {
		/** noop */
	}

	const dataFolderPath = join(sourceFolder, "categories");
	const collectionFolder = join(contentFolder, "en", "sources");

	/** Map legacy identifiers to new ones. */
	const map = new Map<string, string>();

	for (const entry of await readdir(dataFolderPath, { withFileTypes: true })) {
		if (!entry.isFile()) continue;

		const filePath = join(dataFolderPath, entry.name);
		const fileContent = await readFile(filePath, { encoding: "utf-8" });
		const metadata = YAML.parse(fileContent) as SourceSource;

		const sanitizedFileName = sanitize(metadata.name).replace(/\s+/, "-").toLowerCase();
		const outputFolderPath = join(collectionFolder, sanitizedFileName);
		const outputFilePath = join(outputFolderPath, "index.mdx");
		await mkdir(outputFolderPath, { recursive: true });

		map.set(entry.name.slice(0, -extname(entry.name).length), sanitizedFileName);

		const frontmatter: Source = {
			name: metadata.name,
			image: "/assets/images/default-source.svg",
		};

		if (metadata.image) {
			const imageFilePath = join(dataFolderPath, metadata.image);
			const imageExtension = extname(imageFilePath);

			const outputImageFolder = join(
				publicFolder,
				"assets",
				"content",
				"assets",
				"en",
				"sources",
				sanitizedFileName,
			);
			await mkdir(outputImageFolder, { recursive: true });
			const outputImageFilePath = join(outputImageFolder, `image${imageExtension}`);
			await copyFile(imageFilePath, outputImageFilePath);
			frontmatter.image = `/${relative(publicFolder, outputImageFilePath)}`;
		}

		const content = metadata.description;

		const output = `---\n${YAML.stringify(frontmatter)}---\n${content ?? ""}`;

		await writeFile(outputFilePath, output, { encoding: "utf-8" });
	}

	await writeFile("sources.json", JSON.stringify(Array.from(map.entries())), { encoding: "utf-8" });

	return map;
}

async function migrateResources(
	people: Map<string, string>,
	tags: Map<string, string>,
	sources: Map<string, string>,
) {
	try {
		const resources = new Map<string, string>(
			// @ts-expect-error It's fine.
			(await import("../resources.json", { with: { type: "json" } })).default,
		);
		return resources;
	} catch {
		/** noop */
	}

	const dataFolderPath = join(sourceFolder, "posts");

	const externalResourcesFolder = join(contentFolder, "en", "resources", "external");
	const hostedResourcesFolder = join(contentFolder, "en", "resources", "hosted");

	/** Map legacy identifiers to new ones. */
	const map = new Map<string, { collection: "hosted" | "external"; id: string }>();

	for (const entry of await readdir(dataFolderPath, { withFileTypes: true })) {
		if (!entry.isDirectory()) continue;

		const slug = entry.name;
		const folder = join(dataFolderPath, entry.name);
		const filePath = join(folder, "index.mdx");

		const vfile = await read(filePath);
		matter(vfile, { strip: true });
		const metadata = vfile.data.matter as ResourceSource;

		const isRemote = metadata.remote?.date && metadata.remote.publisher && metadata.remote.url;

		const outputSlug = sanitize(slug);
		const outputFolder = isRemote
			? join(externalResourcesFolder, outputSlug)
			: join(hostedResourcesFolder, outputSlug);
		await mkdir(outputFolder, { recursive: true });
		const outputFilePath = join(outputFolder, "index.mdx");

		//

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		assert(metadata.licence === "ccby-4.0", `Invalid license: ${metadata.licence}`);
		assert(
			contentTypes.find((t) => {
				return t.value === metadata.type;
			}),
			`Invalid content type: ${metadata.type}`,
		);

		if (metadata.authors == null || metadata.authors.length === 0) {
			log.warn(`No authors for ${entry.name}`);
		}

		const frontmatter: HostedResource = {
			title: metadata.title.trim(),
			locale: metadata.lang,
			"publication-date": metadata.date,
			version: metadata.version,
			authors:
				metadata.authors?.map((id) => {
					const _id = people.get(id);
					assert(_id, `Missing person id for ${id}`);
					return _id;
				}) ?? [],
			editors:
				metadata.editors?.map((id) => {
					const _id = people.get(id);
					assert(_id, `Missing person id for ${id}`);
					return _id;
				}) ?? [],
			contributors:
				metadata.contributors?.map((id) => {
					const _id = people.get(id);
					assert(_id, `Missing person id for ${id}`);
					return _id;
				}) ?? [],
			tags: metadata.tags.map((id) => {
				const _id = tags.get(id);
				assert(_id, `Missing tag id for ${id}`);
				return _id;
			}),
			sources: metadata.categories.map((id) => {
				const _id = sources.get(id);
				assert(_id, `Missing source id for ${id}`);
				return _id;
			}),
			"featured-image": undefined,
			license: "cc-by-4.0",
			"table-of-contents": Boolean(metadata.toc),
			summary: {
				title: metadata.shortTitle,
				content: metadata.abstract.trim(),
			},
			"content-type": metadata.type,
		};

		if (isRemote) {
			assert(metadata.remote);
			assert(metadata.remote.date);
			assert(metadata.remote.url);
			assert(metadata.remote.publisher);

			(frontmatter as ExternalResource).remote = {
				"publication-date": metadata.remote.date,
				url: metadata.remote.url,
				publisher: metadata.remote.publisher,
			};
		}

		if (metadata.featuredImage) {
			const imageFilePath = join(folder, metadata.featuredImage);
			const outputImageFolder = join(
				publicFolder,
				"assets",
				"content",
				"assets",
				"en",
				"resources",
				isRemote ? "external" : "hosted",
				outputSlug,
			);
			await mkdir(outputImageFolder, { recursive: true });
			const outputImageFilePath = join(
				outputImageFolder,
				`featured-image${extname(imageFilePath)}`,
			);
			await copyFile(imageFilePath, outputImageFilePath);
			frontmatter["featured-image"] = `/${relative(publicFolder, outputImageFilePath)}`;
		}

		//

		const processor = unified()
			.use(fromMarkdown)
			.use(withGfm)
			.use(withMdx)
			.use(withTypographicQuotes, typographyConfig[metadata.lang === "de" ? "de" : "en"])
			.use(() => {
				return function transform(tree) {
					visit(tree, "mdxJsxTextElement", (node) => {
						switch (node.name) {
							case "a": {
								break;
							}

							case "code": {
								break;
							}

							case "Download": {
								break;
							}

							case "li": {
								break;
							}

							case "Quiz.Question": {
								break;
							}

							case "span": {
								break;
							}

							case "ul": {
								break;
							}
						}
					});

					visit(tree, "mdxJsxFlowElement", (node) => {
						switch (node.name) {
							case "a": {
								break;
							}

							case "code": {
								break;
							}

							case "Download": {
								break;
							}

							case "Embed": {
								break;
							}

							case "ExternalResource": {
								break;
							}

							case "Figure": {
								break;
							}

							case "figure": {
								break;
							}

							case "figcaption": {
								break;
							}

							case "Flex": {
								break;
							}

							case "Grid": {
								break;
							}

							case "img": {
								break;
							}

							case "Panel": {
								break;
							}

							case "p": {
								break;
							}

							case "Quiz": {
								break;
							}

							case "Quiz.Card": {
								break;
							}

							case "Quiz.Message": {
								break;
							}

							case "Quiz.MultipleChoice": {
								break;
							}

							case "Quiz.MultipleChoice.Option": {
								break;
							}

							case "Quiz.Question": {
								break;
							}

							case "Quiz.TextInput": {
								break;
							}

							case "SideNote": {
								break;
							}

							case "table": {
								break;
							}

							case "tbody": {
								break;
							}

							case "td": {
								break;
							}

							case "thead": {
								break;
							}

							case "th": {
								break;
							}

							case "tr": {
								break;
							}

							case "Tab": {
								break;
							}

							case "Tabs": {
								break;
							}

							case "Video": {
								break;
							}

							case "VideoCard": {
								break;
							}

							case "YouTube": {
								break;
							}
						}
					});
				};
			})
			.use(toMarkdown);
		const out = await processor.process(vfile);
		const content = String(out);

		//

		const output = `---\n${YAML.stringify(frontmatter)}---\n${content}`;

		await writeFile(outputFilePath, output, { encoding: "utf-8" });
	}

	await writeFile("resources.json", JSON.stringify(Array.from(map.entries())), {
		encoding: "utf-8",
	});

	return map;
}

async function migrate() {
	const people = await migratePeople();
	const tags = await migrateTags();
	const sources = await migrateSources();
	const resources = await migrateResources(people, tags, sources);
}

migrate()
	.then(() => {
		log.success("Successfully migrated content.");
	})
	.catch((error: unknown) => {
		log.error("Failed to migrate content.\n", String(error));
	});
