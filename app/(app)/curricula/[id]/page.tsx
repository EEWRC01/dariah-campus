import type { Metadata, ResolvingMetadata } from "next";
import { getLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { MainContent } from "@/components/main-content";
import { createCollectionResource } from "@/lib/keystatic/resources";

interface CurriculumPageProps {
	params: Promise<{
		id: string;
	}>;
}

export const dynamicParams = false;

export async function generateStaticParams(): Promise<
	Array<Pick<Awaited<CurriculumPageProps["params"]>, "id">>
> {
	const locale = await getLocale();

	const ids = await createCollectionResource("curricula", locale).list();

	return ids.map((id) => {
		return { id };
	});
}

export async function generateMetadata(
	props: Readonly<CurriculumPageProps>,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const { params } = props;

	const locale = await getLocale();

	const { id: _id } = await params;
	const id = decodeURIComponent(_id);

	const curriculum = await createCollectionResource("curricula", locale).read(id);
	const { title } = curriculum.data;

	const metadata: Metadata = {
		title,
	};

	return metadata;
}

export default async function CurriculumPage(
	props: Readonly<CurriculumPageProps>,
): Promise<ReactNode> {
	const { params } = props;

	const locale = await getLocale();

	const { id: _id } = await params;
	const id = decodeURIComponent(_id);

	const curriculum = await createCollectionResource("curricula", locale).read(id);
	const { content, title } = curriculum.data;
	const { default: Content } = await curriculum.compile(content);

	return (
		<MainContent>
			<section>
				<h1>{title}</h1>
			</section>
		</MainContent>
	);
}
