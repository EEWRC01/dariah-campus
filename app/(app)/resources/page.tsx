import type { Metadata, ResolvingMetadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { MainContent } from "@/components/main-content";
import { createCollectionResource } from "@/lib/keystatic/resources";

interface ResourcesPageProps extends EmptyObject {}

export async function generateMetadata(
	_props: Readonly<ResourcesPageProps>,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const t = await getTranslations("ResourcesPage");

	const metadata: Metadata = {
		title: t("meta.title"),
	};

	return metadata;
}

export default async function ResourcesPage(
	_props: Readonly<ResourcesPageProps>,
): Promise<ReactNode> {
	const locale = await getLocale();
	const t = await getTranslations("ResourcesPage");

	const resources = await Promise.all([
		createCollectionResource("resources-external", locale).all(),
		createCollectionResource("resources-hosted", locale).all(),
	]);

	return (
		<MainContent>
			<section>
				<h1>{t("title")}</h1>
				<pre>{JSON.stringify(resources, null, 2)}</pre>
			</section>
		</MainContent>
	);
}
