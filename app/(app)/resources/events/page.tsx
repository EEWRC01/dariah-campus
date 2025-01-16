import type { Metadata, ResolvingMetadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { MainContent } from "@/components/main-content";
import { createCollectionResource } from "@/lib/keystatic/resources";

interface EventsPageProps extends EmptyObject {}

export async function generateMetadata(
	_props: Readonly<EventsPageProps>,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const t = await getTranslations("EventsPage");

	const metadata: Metadata = {
		title: t("meta.title"),
	};

	return metadata;
}

export default async function EventsPage(_props: Readonly<EventsPageProps>): Promise<ReactNode> {
	const locale = await getLocale();
	const t = await getTranslations("EventsPage");

	const events = await createCollectionResource("events", locale).all();

	return (
		<MainContent>
			<section>
				<h1>{t("title")}</h1>
			</section>
		</MainContent>
	);
}
