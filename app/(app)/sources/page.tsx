import type { Metadata, ResolvingMetadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { Card, CardContent, CardFooter, CardTitle } from "@/components/card";
import { Link } from "@/components/link";
import { MainContent } from "@/components/main-content";
import { PageTitle } from "@/components/page-title";
import { createCollectionResource } from "@/lib/keystatic/resources";

interface SourcesPageProps extends EmptyObject {}

export async function generateMetadata(
	_props: Readonly<SourcesPageProps>,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const t = await getTranslations("SourcesPage");

	const metadata: Metadata = {
		title: t("meta.title"),
	};

	return metadata;
}

export default async function SourcesPage(_props: Readonly<SourcesPageProps>): Promise<ReactNode> {
	const locale = await getLocale();
	const t = await getTranslations("SourcesPage");

	const sources = await createCollectionResource("sources", locale).all();

	const sortedSources = sources.sort((a, z) => {
		return a.data.name.localeCompare(z.data.name);
	});

	return (
		<MainContent className="mx-auto grid w-full max-w-screen-xl content-start space-y-24 px-4 py-8 xs:px-8 xs:py-16 md:py-24">
			<div>
				<PageTitle>{t("title")}</PageTitle>
			</div>
			<ul
				className="grid grid-cols-[repeat(auto-fill,minmax(min(24rem,100%),1fr))] gap-8"
				role="list"
			>
				{sortedSources.map((source) => {
					const { content, image, name } = source.data;

					const href = `/sources/${source.id}`;

					return (
						<li key={source.id}>
							<Card>
								<img
									alt=""
									className="aspect-[1.25] border-b border-neutral-100 object-cover"
									loading="lazy"
									src={image}
								/>
								<CardContent>
									<CardTitle>
										<Link
											className="rounded transition hover:text-primary-600 focus:outline-none focus-visible:ring focus-visible:ring-primary-600"
											href={href}
										>
											{name}
										</Link>
									</CardTitle>
									<div className="leading-7 text-neutral-500">{content}</div>
								</CardContent>
								<CardFooter>
									<span></span>
								</CardFooter>
							</Card>
						</li>
					);
				})}
			</ul>
		</MainContent>
	);
}
