import { assert, log } from "@acdh-oeaw/lib";
import { Client } from "typesense";

import { env } from "@/config/env.config";
import { defaultLocale } from "@/config/i18n.config";
import { createCollectionResource } from "@/lib/keystatic/resources";

async function seed() {
	const apiKey = env.TYPESENSE_ADMIN_API_KEY;
	assert(apiKey, "Missing TYPESENSE_ADMIN_API_KEY environment variable.");

	const client = new Client({
		apiKey,
		connectionTimeoutSeconds: 3,
		nodes: [
			{
				host: env.NEXT_PUBLIC_TYPESENSE_HOST,
				port: env.NEXT_PUBLIC_TYPESENSE_PORT,
				protocol: env.NEXT_PUBLIC_TYPESENSE_PROTOCOL,
			},
		],
	});

	const collection = env.NEXT_PUBLIC_TYPESENSE_COLLECTION;

	const locale = defaultLocale;

	const events = await createCollectionResource("resources-events", locale).all();
	const externalResources = await createCollectionResource("resources-external", locale).all();
	const hostedResources = await createCollectionResource("resources-hosted", locale).all();
	const pathfinders = await createCollectionResource("resources-pathfinders", locale).all();
	const curricula = await createCollectionResource("curricula", locale).all();

	function createResource(input: {
		id: string;
		collection: string;
		data: {
			title: string;
			locale: string;
			"publication-date": string;
			summary: { title: string; content: string };
			tags: Array<string>;
		};
	}) {
		return {
			id: input.id,
			collection: input.collection,
			title: input.data.summary.title || input.data.title,
			locale: input.data.locale,
			"publication-date": input.data["publication-date"],
			summary: input.data.summary.content,
			tags: input.data.tags,
		};
	}

	await client.collections(collection).documents().import(events.map(createResource));
	await client.collections(collection).documents().import(externalResources.map(createResource));
	await client.collections(collection).documents().import(hostedResources.map(createResource));
	await client.collections(collection).documents().import(pathfinders.map(createResource));
	await client.collections(collection).documents().import(curricula.map(createResource));
}

seed()
	.then(() => {
		log.success("Successfully seeded typesense collection.");
	})
	.catch((error: unknown) => {
		log.error("Failed to seed typesense collection.\n", String(error));
	});
