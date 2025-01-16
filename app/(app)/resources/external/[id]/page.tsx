import type { Metadata, ResolvingMetadata } from "next";
import { getLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { MainContent } from "@/components/main-content";
import { createCollectionResource } from "@/lib/keystatic/resources";

interface ExternalResourcePageProps {
	params: Promise<{
		id: string;
	}>;
}

export const dynamicParams = false;

export async function generateStaticParams(): Promise<
	Array<Pick<Awaited<ExternalResourcePageProps["params"]>, "id">>
> {
	const locale = await getLocale();

	const ids = await createCollectionResource("resources-external", locale).list();

	return ids.map((id) => {
		return { id };
	});
}

export async function generateMetadata(
	props: Readonly<ExternalResourcePageProps>,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const { params } = props;

	const locale = await getLocale();

	const { id: _id } = await params;
	const id = decodeURIComponent(_id);

	const resource = await createCollectionResource("resources-external", locale).read(id);
	const { title } = resource.data;

	const metadata: Metadata = {
		title,
	};

	return metadata;
}

export default async function ExternalResourcePage(
	props: Readonly<ExternalResourcePageProps>,
): Promise<ReactNode> {
	const { params } = props;

	const locale = await getLocale();

	const { id: _id } = await params;
	const id = decodeURIComponent(_id);

	const resource = await createCollectionResource("resources-external", locale).read(id);
	const { content, title } = resource.data;
	const { default: Content } = await resource.compile(content);

	return (
		<MainContent>
			<section>
				<h1>{title}</h1>
			</section>
		</MainContent>
	);
}
