import { keyByToMap } from "@acdh-oeaw/lib";
import { compareDesc } from "date-fns";
import type { Metadata, ResolvingMetadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { MainContent } from "@/components/main-content";
import { PreviewCard } from "@/components/preview-card";
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
		createCollectionResource("resources-events", locale).all(),
		createCollectionResource("resources-external", locale).all(),
		createCollectionResource("resources-hosted", locale).all(),
		createCollectionResource("resources-pathfinders", locale).all(),
	]);

	const sortedResources = resources.flat().sort((a, z) => {
		return compareDesc(new Date(a.data["publication-date"]), new Date(z.data["publication-date"]));
	});

	const people = await createCollectionResource("people", locale).all();

	const peopleById = keyByToMap(people, (person) => {
		return person.id;
	});

	return (
		<MainContent>
			<section>
				<h1>{t("title")}</h1>
				<ul role="list">
					{sortedResources.map((resource) => {
						const { authors, locale, summary, title } = resource.data;

						const people = authors.map((id) => {
							const person = peopleById.get(id)!;
							return {
								id,
								name: person.data.name,
								image: person.data.image,
							};
						});

						const href = `/resources/${resource.collection.slice(10)}/${resource.id}`;

						return (
							<li key={resource.id}>
								<PreviewCard
									abstract={summary.content}
									href={href}
									locale={locale}
									people={people}
									title={summary.title || title}
								/>
							</li>
						);
					})}
				</ul>
			</section>
		</MainContent>
	);
}
