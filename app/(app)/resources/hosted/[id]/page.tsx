import { keyByToMap } from "@acdh-oeaw/lib";
import type { Metadata, ResolvingMetadata } from "next";
import { getLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { MainContent } from "@/components/main-content";
import { createCollectionResource } from "@/lib/keystatic/resources";

interface HostedResourcePageProps {
	params: Promise<{
		id: string;
	}>;
}

export const dynamicParams = false;

export async function generateStaticParams(): Promise<
	Array<Pick<Awaited<HostedResourcePageProps["params"]>, "id">>
> {
	const locale = await getLocale();

	const ids = await createCollectionResource("resources-hosted", locale).list();

	return ids.map((id) => {
		return { id };
	});
}

export async function generateMetadata(
	props: Readonly<HostedResourcePageProps>,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const { params } = props;

	const locale = await getLocale();

	const { id: _id } = await params;
	const id = decodeURIComponent(_id);

	const resource = await createCollectionResource("resources-hosted", locale).read(id);
	const { title } = resource.data;

	const metadata: Metadata = {
		title,
	};

	return metadata;
}

export default async function HostedResourcePage(
	props: Readonly<HostedResourcePageProps>,
): Promise<ReactNode> {
	const { params } = props;

	const locale = await getLocale();

	const { id: _id } = await params;
	const id = decodeURIComponent(_id);

	const resource = await createCollectionResource("resources-hosted", locale).read(id);
	const { content, title } = resource.data;
	const { default: Content } = await resource.compile(content);

	const people = await createCollectionResource("people", locale).all();
	const tags = await createCollectionResource("tags", locale).all();

	const peopleById = keyByToMap(people, (person) => {
		return person.id;
	});
	const tagsById = keyByToMap(tags, (tag) => {
		return tag.id;
	});

	return (
		<MainContent>
			<section>
				<h1>{title}</h1>
			</section>
		</MainContent>
	);
}
