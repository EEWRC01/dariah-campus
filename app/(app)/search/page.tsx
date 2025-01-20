import { keyByToMap } from "@acdh-oeaw/lib";
import type { Metadata, ResolvingMetadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { Providers } from "@/app/(app)/search/_components/providers";
import { SearchFacets } from "@/app/(app)/search/_components/search-facets";
import { SearchResults } from "@/app/(app)/search/_components/search-results";
import { MainContent } from "@/components/main-content";
import { PageTitle } from "@/components/page-title";
import { createCollectionResource } from "@/lib/keystatic/resources";

interface SearchPageProps extends EmptyObject {}

export async function generateMetadata(
	_props: Readonly<SearchPageProps>,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const t = await getTranslations("SearchPage");

	const metadata: Metadata = {
		title: t("meta.title"),
	};

	return metadata;
}

export default async function SearchPage(_props: Readonly<SearchPageProps>): Promise<ReactNode> {
	const locale = await getLocale();
	const t = await getTranslations("SearchPage");

	const tags = await createCollectionResource("tags", locale).all();

	const tagsById = keyByToMap(tags, (tag) => {
		return tag.id;
	});

	return (
		<Providers>
			<MainContent className="mx-auto grid w-full max-w-screen-xl content-start space-y-24 px-4 py-8 xs:px-8 xs:py-16 md:py-24">
				<div className="grid gap-y-4">
					<PageTitle>{t("title")}</PageTitle>
				</div>

				<div className="grid grid-cols-[320px_1fr] gap-8">
					<aside className="grid content-start gap-y-8">
						<h2 className="text-2xl font-bold">{t("search-filter")}</h2>

						<div className="grid gap-y-1.5">
							<h3 className="text-sm font-bold uppercase tracking-widest text-neutral-600">
								{t("locale")}
							</h3>
							<SearchFacets attribute="locale" />
						</div>

						<div className="grid gap-y-1.5">
							<h3 className="text-sm font-bold uppercase tracking-widest text-neutral-600">
								{t("tags")}
							</h3>
							<SearchFacets attribute="tags" />
						</div>
					</aside>

					<section>
						<SearchResults />
					</section>
				</div>
			</MainContent>
		</Providers>
	);
}
