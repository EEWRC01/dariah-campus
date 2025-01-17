import type { Metadata, ResolvingMetadata } from "next";
import { getLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { MainContent } from "@/components/main-content";
import { createCollectionResource } from "@/lib/keystatic/resources";

interface EventPageProps {
	params: Promise<{
		id: string;
	}>;
}

export const dynamicParams = false;

export async function generateStaticParams(): Promise<
	Array<Pick<Awaited<EventPageProps["params"]>, "id">>
> {
	const locale = await getLocale();

	const ids = await createCollectionResource("resources-events", locale).list();

	return ids.map((id) => {
		return { id };
	});
}

export async function generateMetadata(
	props: Readonly<EventPageProps>,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const { params } = props;

	const locale = await getLocale();

	const { id: _id } = await params;
	const id = decodeURIComponent(_id);

	const event = await createCollectionResource("resources-events", locale).read(id);
	const { title } = event.data;

	const metadata: Metadata = {
		title,
	};

	return metadata;
}

export default async function EventPage(props: Readonly<EventPageProps>): Promise<ReactNode> {
	const { params } = props;

	const locale = await getLocale();

	const { id: _id } = await params;
	const id = decodeURIComponent(_id);

	const event = await createCollectionResource("resources-events", locale).read(id);
	const { content, title } = event.data;
	const { default: Content } = await event.compile(content);

	return (
		<MainContent>
			<section>
				<h1>{title}</h1>
			</section>
		</MainContent>
	);
}
