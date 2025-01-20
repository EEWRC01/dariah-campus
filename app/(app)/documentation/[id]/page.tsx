import type { Metadata, ResolvingMetadata } from "next";
import { getLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { MainContent } from "@/components/main-content";
import { PageLead } from "@/components/page-lead";
import { PageTitle } from "@/components/page-title";
import { createCollectionResource } from "@/lib/keystatic/resources";

interface DocumentationPageProps {
	params: Promise<{
		id: string;
	}>;
}

export const dynamicParams = false;

export async function generateStaticParams(): Promise<
	Array<Pick<Awaited<DocumentationPageProps["params"]>, "id">>
> {
	const locale = await getLocale();

	const ids = await createCollectionResource("documentation", locale).list();

	return ids.map((id) => {
		return { id };
	});
}

export async function generateMetadata(
	props: Readonly<DocumentationPageProps>,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const { params } = props;

	const locale = await getLocale();

	const { id: _id } = await params;
	const id = decodeURIComponent(_id);

	const entry = await createCollectionResource("documentation", locale).read(id);
	const { title } = entry.data;

	const metadata: Metadata = {
		title,
	};

	return metadata;
}

export default async function DocumentationPage(
	props: Readonly<DocumentationPageProps>,
): Promise<ReactNode> {
	const { params } = props;

	const locale = await getLocale();

	const { id: _id } = await params;
	const id = decodeURIComponent(_id);

	const entry = await createCollectionResource("documentation", locale).read(id);
	const { content, lead, title } = entry.data;
	const { default: Content } = await entry.compile(content);

	return (
		<MainContent className="mx-auto grid w-full max-w-screen-lg content-start space-y-24 px-4 py-8 xs:px-8 xs:py-16 md:py-24">
			<div className="grid gap-y-4">
				<PageTitle>{title}</PageTitle>
				<PageLead>{lead}</PageLead>
			</div>
			<div className="prose">
				<Content />
			</div>
		</MainContent>
	);
}
