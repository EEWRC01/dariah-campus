import type { Metadata, ResolvingMetadata } from "next";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { MainContent } from "@/components/main-content";
import { CourseRegistry } from "@/app/(app)/course-registry/_components/course-registry";

interface CourseRegistryPageProps extends EmptyObject {}

export async function generateMetadata(
	_props: Readonly<CourseRegistryPageProps>,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const t = await getTranslations("CourseRegistryPage");

	const metadata: Metadata = {
		title: t("meta.title"),
	};

	return metadata;
}

export default async function CourseRegistryPage(
	_props: Readonly<CourseRegistryPageProps>,
): Promise<ReactNode> {
	const t = await getTranslations("CourseRegistryPage");

	return (
		<MainContent className="layout-grid content-start">
			<section className="layout-subgrid relative bg-fill-weaker py-16 xs:py-24">
				<h1>{t("title")}</h1>
			</section>

			<section>
				<CourseRegistry />
			</section>
		</MainContent>
	);
}
