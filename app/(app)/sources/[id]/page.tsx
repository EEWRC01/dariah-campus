import type { Metadata, ResolvingMetadata } from "next";
import { getLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { MainContent } from "@/components/main-content";
import { createCollectionResource } from "@/lib/keystatic/resources";

interface SourcePageProps {
	params: Promise<{
		id: string;
	}>;
}

export const dynamicParams = false;

export async function generateStaticParams(): Promise<
	Array<Pick<Awaited<SourcePageProps["params"]>, "id">>
> {
	const locale = await getLocale();

	const ids = await createCollectionResource("sources", locale).list();

	return ids.map((id) => {
		return { id };
	});
}

export async function generateMetadata(
	props: Readonly<SourcePageProps>,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const { params } = props;

	const locale = await getLocale();

	const { id: _id } = await params;
	const id = decodeURIComponent(_id);

	const source = await createCollectionResource("sources", locale).read(id);
	const { name } = source.data;

	const metadata: Metadata = {
		title: name,
	};

	return metadata;
}

export default async function SourcePage(props: Readonly<SourcePageProps>): Promise<ReactNode> {
	const { params } = props;

	const locale = await getLocale();

	const { id: _id } = await params;
	const id = decodeURIComponent(_id);

	const source = await createCollectionResource("sources", locale).read(id);
	const { content, name } = source.data;
	const { default: Content } = await source.compile(content);

	return (
		<MainContent>
			<section>
				<h1>{name}</h1>
			</section>
		</MainContent>
	);
}
