import { assert, log } from "@acdh-oeaw/lib";
import { Client, Errors } from "typesense";
import type { CollectionCreateSchema } from "typesense/lib/Typesense/Collections";

import { env } from "@/config/env.config";

async function create() {
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

	const schema: CollectionCreateSchema = {
		name: collection,
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
}

create()
	.then(() => {
		log.success("Successfully created typesense collection.");
	})
	.catch((error: unknown) => {
		log.error("Failed to create typesense collection.\n", String(error));
	});
