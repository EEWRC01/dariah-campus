import { copyFileSync, mkdirSync } from "node:fs";
import { copyFile, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { basename, extname, join, relative } from "node:path";

import { assert, isUrl, log } from "@acdh-oeaw/lib";
// import { typographyConfig } from "@acdh-oeaw/mdx-lib";
import slugify from "@sindresorhus/slugify";
import { valueToEstree } from "estree-util-value-to-estree";
import type { Root } from "mdast";
import type { MdxJsxAttribute, MdxJsxFlowElement, MdxJsxTextElement } from "mdast-util-mdx-jsx";
import withGfm from "remark-gfm";
import withMdx from "remark-mdx";
import fromMarkdown from "remark-parse";
// import withTypographicQuotes from "remark-smartypants";
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

interface CurriculumSource {
	title: string;
	shortTitle: string;
	lang: "en" | "de" | "sv";
	date: string;
	version: string;
	editors?: Array<string>;
	tags: Array<string>;
	resources: Array<string>;
	abstract: string;
	featuredImage?: string;
}

interface Curriculum {
	title: string;
	locale: "en" | "de" | "sv";
	"publication-date": string;
	version: string;
	editors: Array<string>;
	tags: Array<string>;
	resources: Array<{ discriminant: "hosted-resources" | "external-resources"; value: string }>;
	"featured-image"?: string;
	summary: {
		/** short title */
		title?: string;
		content: string;
	};
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
	social: Array<{ discriminant: SocialMediaKind; value: string }>;
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

interface PathfinderResource {
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
			const email = metadata.email.replace("[AT]", "@").replace("[DOT]", ".");
			assert(/.+?@.+?/.exec(email), `Invalid email: ${entry.name}`);
			frontmatter.social.push({ discriminant: "email", value: email });
		}
		if (metadata.orcid) {
			if (!isUrl(metadata.orcid)) {
				metadata.orcid = new URL(metadata.orcid, "https://orcid.org").toString();
			}
			assert(isUrl(metadata.orcid), `ORCID not URL: ${entry.name}`);
			frontmatter.social.push({ discriminant: "orcid", value: metadata.orcid });
		}
		if (metadata.twitter) {
			if (!isUrl(metadata.twitter)) {
				metadata.twitter = new URL(metadata.twitter.replace(/^@/, ""), "https://x.com").toString();
			}
			assert(isUrl(metadata.twitter), `Twitter not URL: ${entry.name}`);
			frontmatter.social.push({ discriminant: "twitter", value: metadata.twitter });
		}
		if (metadata.website) {
			assert(isUrl(metadata.website), `Website not URL: ${entry.name}`);
			frontmatter.social.push({ discriminant: "website", value: metadata.website });
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
		const resources = new Map<
			string,
			{ collection: "hosted" | "external" | "pathfinders"; id: string }
		>(
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
	const pathfinderResourcesFolder = join(contentFolder, "en", "resources", "pathfinders");

	/** Map legacy identifiers to new ones. */
	const map = new Map<string, { collection: "hosted" | "external" | "pathfinders"; id: string }>();

	for (const entry of await readdir(dataFolderPath, { withFileTypes: true })) {
		if (!entry.isDirectory()) continue;

		const slug = entry.name;
		const folder = join(dataFolderPath, entry.name);
		const filePath = join(folder, "index.mdx");

		const vfile = await read(filePath);
		matter(vfile, { strip: true });
		const metadata = vfile.data.matter as ResourceSource;

		const resourceType =
			metadata.remote?.date && metadata.remote.publisher && metadata.remote.url
				? "external"
				: metadata.type === "pathfinder"
					? "pathfinders"
					: "hosted";

		const outputSlug = sanitize(slug);
		const outputFolder =
			resourceType === "external"
				? join(externalResourcesFolder, outputSlug)
				: resourceType === "pathfinders"
					? join(pathfinderResourcesFolder, outputSlug)
					: join(hostedResourcesFolder, outputSlug);
		await mkdir(outputFolder, { recursive: true });
		const outputFilePath = join(outputFolder, "index.mdx");

		map.set(entry.name, { id: outputSlug, collection: resourceType });

		//

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		assert(metadata.licence === "ccby-4.0", `Invalid license: ${metadata.licence}`);
		assert(
			metadata.type === "pathfinder" ||
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
			"publication-date": new Intl.DateTimeFormat("en-ca").format(new Date(metadata.date)),
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

		if (resourceType === "pathfinders") {
			// @ts-expect-error It's fine.
			delete frontmatter["content-type"];
		}

		if (resourceType === "external") {
			assert(metadata.remote);
			assert(metadata.remote.date);
			assert(metadata.remote.url);
			assert(metadata.remote.publisher);

			(frontmatter as ExternalResource).remote = {
				"publication-date": new Intl.DateTimeFormat("en-ca").format(new Date(metadata.remote.date)),
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
				resourceType,
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
			// .use(withTypographicQuotes, typographyConfig[metadata.lang === "de" ? "de" : "en"])
			.use(() => {
				return function transform(tree: Root) {
					visit(tree, "mdxJsxTextElement", (node, index, parent) => {
						assert(index != null);
						assert(parent != null);

						assert(node.name != null);

						switch (node.name) {
							case "a": {
								throw new Error("Unexpected <a> element .");
							}

							case "code": {
								throw new Error("Unexpected <code> element .");
							}

							case "Download": {
								const url = node.attributes.find((attribute) => {
									return (attribute as MdxJsxAttribute).name === "url";
								})?.value as string | undefined;

								const title = node.attributes.find((attribute) => {
									return (attribute as MdxJsxAttribute).name === "title";
								})?.value as string | undefined;

								assert(url, `Missing url attribute on <Download> (${entry.name}).`);
								assert(title, `Missing title attribute on <Download> (${entry.name}).`);

								const sourceFilePath = join(folder, url);
								const targetFolderPath = join(
									publicFolder,
									"assets",
									"content",
									"downloads",
									"en",
									"resources",
									resourceType,
									outputSlug,
								);
								mkdirSync(targetFolderPath, { recursive: true });
								const targetFilePath = join(targetFolderPath, slugify(url));
								copyFileSync(sourceFilePath, targetFilePath);

								const link = {
									discriminant: "download",
									value: `/${relative(publicFolder, targetFilePath)}`,
								};

								const newNode: MdxJsxTextElement = {
									type: "mdxJsxTextElement",
									name: "Link",
									attributes: [
										{
											type: "mdxJsxAttribute",
											name: "link",
											value: {
												type: "mdxJsxAttributeValueExpression",
												value: JSON.stringify(link),
												data: {
													estree: {
														type: "Program",
														body: [
															{
																type: "ExpressionStatement",
																expression: valueToEstree(link),
															},
														],
														sourceType: "module",
														comments: [],
													},
												},
											},
										},
									],
									children: [{ type: "text", value: title }],
								};

								parent.children.splice(index, 1, newNode);

								break;
							}

							case "li": {
								break;
							}

							case "Quiz.Question": {
								break;
							}

							case "span": {
								throw new Error("Unexpected <span> element .");
							}

							case "ul": {
								log.warn(`Unexpected <ul> in content: ${entry.name}`);
								break;
							}
						}
					});

					visit(tree, "mdxJsxFlowElement", (node, index, parent) => {
						assert(index != null);
						assert(parent != null);

						assert(node.name != null);

						switch (node.name) {
							case "a": {
								throw new Error("Unexpected <a> element .");
							}

							case "code": {
								throw new Error("Unexpected <code> element .");
							}

							case "Download": {
								const url = node.attributes.find((attribute) => {
									return (attribute as MdxJsxAttribute).name === "url";
								})?.value as string | undefined;

								const title = node.attributes.find((attribute) => {
									return (attribute as MdxJsxAttribute).name === "title";
								})?.value as string | undefined;

								assert(url, `Missing url attribute on <Download> (${entry.name}).`);
								assert(title, `Missing title attribute on <Download> (${entry.name}).`);

								const sourceFilePath = join(folder, url);
								const targetFolderPath = join(
									publicFolder,
									"assets",
									"content",
									"downloads",
									"en",
									"resources",
									resourceType,
									outputSlug,
								);
								mkdirSync(targetFolderPath, { recursive: true });
								const targetFilePath = join(targetFolderPath, slugify(url));
								copyFileSync(sourceFilePath, targetFilePath);

								const link = {
									discriminant: "download",
									value: `/${relative(publicFolder, targetFilePath)}`,
								};

								const newNode: MdxJsxTextElement = {
									type: "mdxJsxTextElement",
									name: "Link",
									attributes: [
										{
											type: "mdxJsxAttribute",
											name: "link",
											value: {
												type: "mdxJsxAttributeValueExpression",
												value: JSON.stringify(link),
												data: {
													estree: {
														type: "Program",
														body: [
															{
																type: "ExpressionStatement",
																expression: valueToEstree(link),
															},
														],
														sourceType: "module",
														comments: [],
													},
												},
											},
										},
									],
									children: [{ type: "text", value: title }],
								};

								parent.children.splice(index, 1, newNode);

								break;
							}

							case "Embed": {
								const url = node.attributes.find((attribute) => {
									return (attribute as MdxJsxAttribute).name === "src";
								})?.value as string | undefined;

								const title = node.attributes.find((attribute) => {
									return (attribute as MdxJsxAttribute).name === "title";
								})?.value as string | undefined;

								assert(url, "Missing src attribute on <Embed>");

								const attributes: Array<MdxJsxAttribute> = [
									{ type: "mdxJsxAttribute", name: "src", value: url },
								];
								if (title) {
									attributes.push({ type: "mdxJsxAttribute", name: "title", value: title });
								}

								const newNode: MdxJsxFlowElement = {
									type: "mdxJsxFlowElement",
									name: "Embed",
									attributes,
									children: node.children ?? [],
								};

								parent.children.splice(index, 1, newNode);

								break;
							}

							case "ExternalResource": {
								const title = node.attributes.find((a) => {
									return a.name === "title";
								})?.value;
								const subtitle = node.attributes.find((a) => {
									return a.name === "subtitle";
								})?.value;
								const url = node.attributes.find((a) => {
									return a.name === "url";
								})?.value;

								assert(title);
								assert(subtitle);
								assert(url);

								const newNode: MdxJsxFlowElement = {
									type: "mdxJsxFlowElement",
									name: "ExternalResource",
									attributes: [
										{ type: "mdxJsxAttribute", name: "title", value: title },
										{ type: "mdxJsxAttribute", name: "subtitle", value: subtitle },
										{ type: "mdxJsxAttribute", name: "url", value: url },
									],
									children: [],
								};

								parent.children.splice(index, 1, newNode);

								break;
							}

							case "Figure": {
								let src = node.attributes.find((attribute) => {
									return (attribute as MdxJsxAttribute).name === "src";
								})?.value as string | undefined;

								const alt = node.attributes.find((attribute) => {
									return (attribute as MdxJsxAttribute).name === "alt";
								})?.value as string | undefined;

								assert(src, "Missing src attribute on <Figure>");

								const targetFolder = join(
									publicFolder,
									"assets",
									"content",
									"assets",
									"en",
									"resources",
									resourceType,
									outputSlug,
								);
								mkdirSync(targetFolder, { recursive: true });

								if (isUrl(src)) {
									throw new Error(`Unsupported image url: ${src}`);
									// await pipeline(fetch(src), createWriteStream(targetFilePath));
								} else {
									const sourceFilePath = join(folder, src);

									const targetFilePath = join(targetFolder, slugify(basename(sourceFilePath)));
									copyFileSync(sourceFilePath, targetFilePath);
									src = `/${relative(publicFolder, targetFilePath)}`;
								}

								const attributes: Array<MdxJsxAttribute> = [
									{ type: "mdxJsxAttribute", name: "src", value: src },
								];
								if (alt) {
									attributes.push({ type: "mdxJsxAttribute", name: "alt", value: alt });
								}

								const newNode: MdxJsxFlowElement = {
									type: "mdxJsxFlowElement",
									name: "Embed",
									attributes,

									children: node.children ?? [],
								};

								parent.children.splice(index, 1, newNode);

								break;
							}

							case "figure": {
								throw new Error("Unexpected <figure> element .");
							}

							case "figcaption": {
								throw new Error("Unexpected <figcaption> element .");
							}

							case "Flex": {
								break;
							}

							case "Grid": {
								break;
							}

							case "img": {
								throw new Error("Unexpected <img> element .");
							}

							case "Panel": {
								break;
							}

							case "p": {
								throw new Error("Unexpected <p> element .");
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
								const type = node.attributes.find((a) => {
									return a.name === "type";
								})?.value;
								const title = node.attributes.find((a) => {
									return a.name === "title";
								})?.value;

								assert(type, "Missing type");

								const calloutKinds = {
									danger: "caution",
									important: "important",
									info: "note",
									tip: "tip",
									warning: "warning",
								};

								const attributes: Array<MdxJsxAttribute> = [
									{ type: "mdxJsxAttribute", name: "kind", value: calloutKinds[type] },
								];

								if (title) {
									attributes.push({ type: "mdxJsxAttribute", name: "title", value: title });
								}

								const newNode: MdxJsxFlowElement = {
									type: "mdxJsxFlowElement",
									name: "Callout",
									attributes,
									children: node.children,
								};

								parent.children.splice(index, 1, newNode);

								break;
							}

							case "table": {
								throw new Error("Unexpected <table> element.");
							}

							case "tbody": {
								throw new Error("Unexpected <tbody> element.");
							}

							case "td": {
								throw new Error("Unexpected <td> element.");
							}

							case "thead": {
								throw new Error("Unexpected <thead> element.");
							}

							case "th": {
								throw new Error("Unexpected <th> element.");
							}

							case "tr": {
								throw new Error("Unexpected <tr> element.");
							}

							case "Tab": {
								break;
							}

							case "Tabs": {
								break;
							}

							case "Video": {
								const provider = node.attributes.find((a) => {
									return a.name === "provider";
								})?.value;
								const id = node.attributes.find((a) => {
									return a.name === "id";
								})?.value;
								const caption = node.attributes.find((a) => {
									return a.name === "caption";
								})?.value;
								const startTime = node.attributes.find((a) => {
									return a.name === "startTime";
								})?.value;

								const attributes: Array<MdxJsxAttribute> = [
									{ type: "mdxJsxAttribute", name: "provider", value: provider ?? "youtube" },
									{ type: "mdxJsxAttribute", name: "id", value: id },
								];

								if (startTime) {
									attributes.push({
										type: "mdxJsxAttribute",
										name: "startTime",
										value: {
											type: "mdxJsxAttributeValueExpression",
											value: String(startTime),
											data: {
												estree: {
													type: "Program",
													sourceType: "module",
													comments: [],
													body: [
														{
															type: "ExpressionStatement",
															expression: { type: "Literal", value: Number(startTime) },
														},
													],
												},
											},
										},
									});
								}

								if (caption && node.children.length) {
									throw new Error(`Both caption and children: ${entry.name}`);
								}

								const newNode: MdxJsxFlowElement = {
									type: "mdxJsxFlowElement",
									name: "Video",
									attributes,
									children: caption ? [{ type: "text", value: caption }] : (node.children ?? []),
								};

								parent.children.splice(index, 1, newNode);

								break;
							}

							case "VideoCard": {
								// <VideoCard provider="youtube" id="2DqkFEjoHXc" title="The ELDAH consent form wizard" subtitle="Click here to view" image="images/ytthumbnailiv.jpg" />

								const provider = node.attributes.find((a) => {
									return a.name === "provider";
								})?.value;
								const id = node.attributes.find((a) => {
									return a.name === "id";
								})?.value;
								const title = node.attributes.find((a) => {
									return a.name === "title";
								})?.value;
								const subtitle = node.attributes.find((a) => {
									return a.name === "subtitle";
								})?.value;
								const image = node.attributes.find((a) => {
									return a.name === "image";
								})?.value;
								const startTime = node.attributes.find((a) => {
									return a.name === "startTime";
								})?.value;

								assert(id, `Missing videocard id: ${entry.name}`);
								assert(title, `Missing videocard title: ${entry.name}`);
								assert(image, `Missing videocard image: ${entry.name}`);

								const imageSourcePath = join(folder, image);
								const targetFolder = join(
									publicFolder,
									"assets",
									"content",
									"assets",
									"en",
									"resources",
									resourceType,
									outputSlug,
								);
								mkdirSync(targetFolder, { recursive: true });
								const targetFilePath = join(targetFolder, slugify(basename(imageSourcePath)));
								copyFileSync(imageSourcePath, targetFilePath);

								const attributes: Array<MdxJsxAttribute> = [
									{ type: "mdxJsxAttribute", name: "provider", value: provider ?? "youtube" },
									{ type: "mdxJsxAttribute", name: "id", value: id },
									{ type: "mdxJsxAttribute", name: "title", value: title },
									{
										type: "mdxJsxAttribute",
										name: "image",
										value: `/${relative(publicFolder, targetFilePath)}`,
									},
								];

								if (subtitle) {
									attributes.push({ type: "mdxJsxAttribute", name: "subtitle", value: subtitle });
								}
								if (startTime) {
									attributes.push({
										type: "mdxJsxAttribute",
										name: "startTime",
										value: {
											type: "mdxJsxAttributeValueExpression",
											value: String(startTime),
											data: {
												estree: {
													type: "Program",
													sourceType: "module",
													comments: [],
													body: [
														{
															type: "ExpressionStatement",
															expression: { type: "Literal", value: Number(startTime) },
														},
													],
												},
											},
										},
									});
								}

								if (node.children.length) {
									throw new Error(`children: ${entry.name}`);
								}

								const newNode: MdxJsxFlowElement = {
									type: "mdxJsxFlowElement",
									name: "VideoCard",
									attributes,
									children: [],
								};

								parent.children.splice(index, 1, newNode);

								break;
							}

							case "YouTube": {
								const id = node.attributes.find((a) => {
									return a.name === "id";
								})?.value;
								const caption = node.attributes.find((a) => {
									return a.name === "caption";
								})?.value;
								const startTime = node.attributes.find((a) => {
									return a.name === "startTime";
								})?.value;

								const attributes: Array<MdxJsxAttribute> = [
									{ type: "mdxJsxAttribute", name: "provider", value: "youtube" },
									{ type: "mdxJsxAttribute", name: "id", value: id },
								];

								if (startTime) {
									attributes.push({
										type: "mdxJsxAttribute",
										name: "startTime",
										value: {
											type: "mdxJsxAttributeValueExpression",
											value: String(startTime),
											data: {
												estree: {
													type: "Program",
													sourceType: "module",
													comments: [],
													body: [
														{
															type: "ExpressionStatement",
															expression: { type: "Literal", value: Number(startTime) },
														},
													],
												},
											},
										},
									});
								}

								const newNode: MdxJsxFlowElement = {
									type: "mdxJsxFlowElement",
									name: "Video",
									attributes,
									children: caption ? [{ type: "text", value: caption }] : [],
								};

								parent.children.splice(index, 1, newNode);

								break;
							}
						}
					});

					visit(tree, "link", (node) => {
						const url = node.url;

						if (!url.startsWith("http")) {
							console.log(node);
						}
					});

					visit(tree, "image", (node) => {
						const src = node.url;
						const alt = node.alt;

						if (!src.startsWith("images")) {
							// console.log(node);
						}
					});
				};
			})
			.use(toMarkdown, {
				bullet: "*",
				emphasis: "*",
				rule: "-",
				strong: "*",
			});
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

async function migrateCurricula(
	people: Map<string, string>,
	tags: Map<string, string>,
	sources: Map<string, string>,
	resources: Map<string, { collection: "hosted" | "external" | "pathfinders"; id: string }>,
) {
	try {
		const curricula = new Map<string, string>(
			// @ts-expect-error It's fine.
			(await import("../curricula.json", { with: { type: "json" } })).default,
		);
		return curricula;
	} catch {
		/** noop */
	}

	const dataFolderPath = join(sourceFolder, "courses");

	const collectionFolder = join(contentFolder, "en", "curricula");

	const map = new Map<string, string>();

	for (const entry of await readdir(dataFolderPath, { withFileTypes: true })) {
		if (!entry.isDirectory()) continue;

		const slug = entry.name;
		const folder = join(dataFolderPath, slug);
		const filePath = join(folder, "index.mdx");

		const vfile = await read(filePath);
		matter(vfile, { strip: true });
		const metadata = vfile.data.matter as CurriculumSource;

		const outputSlug = sanitize(slug);
		const outputFolder = join(collectionFolder, outputSlug);
		await mkdir(outputFolder, { recursive: true });
		const outputFilePath = join(outputFolder, "index.mdx");

		const frontmatter: Curriculum = {
			title: metadata.title.trim(),
			locale: metadata.lang,
			"publication-date": metadata.date,
			version: metadata.version,
			editors:
				metadata.editors?.map((id) => {
					const _id = people.get(id);
					assert(_id, `Missing person id for ${id}`);
					return _id;
				}) ?? [],
			tags: metadata.tags.map((id) => {
				const _id = tags.get(id);
				assert(_id, `Missing tag id for ${id}`);
				return _id;
			}),
			resources: metadata.resources.map((id) => {
				const _id = id.slice(0, -"/index".length);
				const r = resources.get(_id);
				assert(r, `Missing resource id for ${_id}`);
				return {
					discriminant: r.collection === "external" ? "external-resources" : "hosted-resources",
					value: r.id,
				};
			}),
			"featured-image": undefined,
			summary: {
				title: metadata.shortTitle,
				content: metadata.abstract.trim(),
			},
		};

		//

		if (metadata.featuredImage) {
			const imageFilePath = join(folder, metadata.featuredImage);
			const outputImageFolder = join(
				publicFolder,
				"assets",
				"content",
				"assets",
				"en",
				"curricula",
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
			// .use(withTypographicQuotes, typographyConfig[metadata.lang === "de" ? "de" : "en"])
			.use(toMarkdown, {
				bullet: "*",
				emphasis: "*",
				rule: "-",
				strong: "*",
			});
		const out = await processor.process(vfile);
		const content = String(out);

		//

		const output = `---\n${YAML.stringify(frontmatter)}---\n${content}`;

		await writeFile(outputFilePath, output, { encoding: "utf-8" });
	}

	await writeFile("curricula.json", JSON.stringify(Array.from(map.entries())), {
		encoding: "utf-8",
	});

	return map;
}

async function migrate() {
	const people = await migratePeople();
	const tags = await migrateTags();
	const sources = await migrateSources();
	const resources = await migrateResources(people, tags, sources);
	const curricula = await migrateCurricula(people, tags, sources, resources);
}

migrate()
	.then(() => {
		log.success("Successfully migrated content.");
	})
	.catch((error: unknown) => {
		log.error("Failed to migrate content.\n", String(error));
	});
