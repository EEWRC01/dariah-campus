import { copyFile, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { extname, join, relative } from "node:path";

import { log } from "@acdh-oeaw/lib";
import * as YAML from "yaml";

import type { SocialMediaKind } from "@/lib/keystatic/options";

const publicFolder = join(process.cwd(), "public");
const sourceFolder = join(process.cwd(), "content-source");
const contentFolder = join(process.cwd(), "content");

function sanitize(input: string) {
	return input.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
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

		map.set(entry.name, sanitizedFileName);

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

		map.set(entry.name, sanitizedFileName);

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

		map.set(entry.name, sanitizedFileName);

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

async function migrate() {
	// const people = await migratePeople();
	const people = new Map<string, string>(
		// @ts-expect-error It's fine.
		(await import("../people.json", { with: { type: "json" } })).default,
	);

	// const tags = await migrateTags();
	const tags = new Map<string, string>(
		// @ts-expect-error It's fine.
		(await import("../tags.json", { with: { type: "json" } })).default,
	);

	const sources = await migrateSources();
	// const sources = new Map<string, string>(
	// 	// @ts-expect-error It's fine.
	// 	(await import("../sources.json", { with: { type: "json" } })).default,
	// );
}

migrate()
	.then(() => {
		log.success("Successfully migrated content.");
	})
	.catch((error: unknown) => {
		log.error("Failed to migrate content.\n", String(error));
	});
