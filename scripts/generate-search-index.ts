import { assert, log } from "@acdh-oeaw/lib";
import { Client, Errors } from "typesense";
import type { CollectionCreateSchema } from "typesense/lib/Typesense/Collections";

import { env } from "@/config/env.config";
import { defaultLocale } from "@/config/i18n.config";
import { createCollectionResource } from "@/lib/keystatic/resources";

async function generate() {
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

	const schema: CollectionCreateSchema = {
		name: env.NEXT_PUBLIC_TYPESENSE_COLLECTION,
		fields: [
			{ name: "title", type: "string", sort: true },
			{ name: "locale", type: "string", facet: true },
			{ name: "tags", type: "string[]", facet: true },
		],
		default_sorting_field: "title",
	};

	try {
		await client.collections(schema.name).delete();
	} catch (error) {
		if (!(error instanceof Errors.ObjectNotFound)) {
			throw error;
		}
	}

	await client.collections().create(schema);

	const locale = defaultLocale;

	const tags = await createCollectionResource("tags", locale).all();

	const events = await createCollectionResource("resources-events", locale).all();
	const externalResources = await createCollectionResource("resources-external", locale).all();
	const hostedResources = await createCollectionResource("resources-hosted", locale).all();
	const pathfinders = await createCollectionResource("resources-pathfinders", locale).all();

	const curricula = await createCollectionResource("curricula", locale).all();
}

generate()
	.then(() => {
		log.success("Successfully generated search index.");
	})
	.catch((error: unknown) => {
		log.error("Failed to generate search index.\n", String(error));
	});
