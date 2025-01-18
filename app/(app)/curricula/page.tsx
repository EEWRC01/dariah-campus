import { keyByToMap } from "@acdh-oeaw/lib";
import { compareDesc } from "date-fns";
import type { Metadata, ResolvingMetadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { MainContent } from "@/components/main-content";
import { PreviewCard } from "@/components/preview-card";
import { createCollectionResource } from "@/lib/keystatic/resources";

interface CurriculaPageProps extends EmptyObject {}

export async function generateMetadata(
	_props: Readonly<CurriculaPageProps>,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const t = await getTranslations("CurriculaPage");

	const metadata: Metadata = {
		title: t("meta.title"),
	};

	return metadata;
}

export default async function CurriculaPage(
	_props: Readonly<CurriculaPageProps>,
): Promise<ReactNode> {
	const locale = await getLocale();
	const t = await getTranslations("CurriculaPage");

	const curricula = await createCollectionResource("curricula", locale).all();

	const sortedCurricula = curricula.sort((a, z) => {
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
				<ul
					className="grid grid-cols-[repeat(auto-fill,minmax(min(24rem,100%),1fr))] gap-8"
					role="list"
				>
					{sortedCurricula.map((curriculum) => {
						const { editors, locale, summary, title } = curriculum.data;

						const people = editors.map((id) => {
							const person = peopleById.get(id)!;
							return {
								id,
								name: person.data.name,
								image: person.data.image,
							};
						});

						const href = `/curricula/${curriculum.id}`;

						const kind = "event";

						return (
							<li key={curriculum.id}>
								<PreviewCard
									abstract={summary.content}
									href={href}
									kind={kind}
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
