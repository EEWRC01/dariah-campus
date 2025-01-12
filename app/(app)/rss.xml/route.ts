import { getLocale } from "next-intl/server";

import { createFeed } from "@/lib/create-feed";

export async function GET(request: Request): Promise<Response> {
	const locale = await getLocale();

	const feed = await createFeed(locale);

	return new Response(feed, { headers: { "content-type": "application/xml" } });
}
