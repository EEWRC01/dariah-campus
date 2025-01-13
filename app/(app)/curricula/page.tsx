import type { Metadata, ResolvingMetadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { MainContent } from "@/components/main-content";
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

	return (
		<MainContent>
			<section>
				<h1>{t("title")}</h1>
			</section>
		</MainContent>
	);
}
