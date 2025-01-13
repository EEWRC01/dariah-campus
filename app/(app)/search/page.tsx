import type { Metadata, ResolvingMetadata } from "next";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { Providers } from "@/app/(app)/search/_components/providers";
import { MainContent } from "@/components/main-content";

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
	const t = await getTranslations("SearchPage");

	return (
		<Providers>
			<MainContent>
				<section>
					<h1>{t("title")}</h1>
				</section>
			</MainContent>
		</Providers>
	);
}
