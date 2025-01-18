import type { Metadata, ResolvingMetadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { MainContent } from "@/components/main-content";
import { createCollectionResource } from "@/lib/keystatic/resources";

interface SourcesPageProps extends EmptyObject {}

export async function generateMetadata(
	_props: Readonly<SourcesPageProps>,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const t = await getTranslations("SourcesPage");

	const metadata: Metadata = {
		title: t("meta.title"),
	};

	return metadata;
}

export default async function SourcesPage(_props: Readonly<SourcesPageProps>): Promise<ReactNode> {
	const locale = await getLocale();
	const t = await getTranslations("SourcesPage");

	const sources = await createCollectionResource("sources", locale).all();

	const sortedSources = sources.sort((a, z) => {
		return a.data.name.localeCompare(z.data.name);
	});

	return (
		<MainContent>
			<section>
				<h1>{t("title")}</h1>
				<ul
					className="grid grid-cols-[repeat(auto-fill,minmax(min(24rem,100%),1fr))] gap-8"
					role="list"
				>
					{sortedSources.map((source) => {
						const { content, image, name } = source.data;

						const href = `/sources/${source.id}`;

						return (
							<li key={source.id}>
								<pre>{JSON.stringify(source, null, 2)}</pre>
							</li>
						);
					})}
				</ul>
			</section>
		</MainContent>
	);
}
