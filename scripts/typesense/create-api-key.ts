import { assert, log } from "@acdh-oeaw/lib";
import { Client } from "typesense";
import type { KeyCreateSchema } from "typesense/lib/Typesense/Key";

import { env } from "@/config/env.config";

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

	const schema: KeyCreateSchema = {
		actions: ["documents:search"],
		collections: [env.NEXT_PUBLIC_TYPESENSE_COLLECTION],
		description: `Search-only api key for ${collection}.`,
	};

	const response = await client.keys().create(schema);

	return response.value!;
}

seed()
	.then((searchApiKey) => {
		log.success(`Successfully created typesense search api key: ${searchApiKey}.`);
	})
	.catch((error: unknown) => {
		log.error("Failed to create typesense search api key.\n", String(error));
	});
