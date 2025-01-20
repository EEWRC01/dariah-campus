"use client";

import type { ReactNode } from "react";
import { useHits } from "react-instantsearch-core";

import { AvatarsList } from "@/components/avatars-list";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/card";
import { ContentTypeIcon } from "@/components/content-type-icon";
import { Link } from "@/components/link";
import type { ContentType } from "@/lib/keystatic/options";

interface Hit {
	collection:
		| "resources-hosted"
		| "resources-external"
		| "resources-events"
		| "resources-pathfinders";
	id: string;
	kind: "event" | "curriculum" | "pathfinder" | ContentType;
	locale: "en" | "de" | "sv";
	people: Array<string>;
	"publication-date": string;
	summary: string;
	tags: Array<string>;
	title: string;
}

export function SearchResults(): ReactNode {
	const hits = useHits<Hit>();

	return (
		<ul
			className="grid grid-cols-[repeat(auto-fill,minmax(min(24rem,100%),1fr))] gap-8"
			role="list"
		>
			{hits.items.map((hit) => {
				const { collection, id, kind, people, summary, title } = hit;

				const href = `/${collection.slice(0, 10)}/${id}`;

				return (
					<li key={id}>
						<Card>
							<CardContent>
								<CardTitle>
									<Link className="after:absolute after:inset-0" href={href}>
										<ContentTypeIcon kind={kind} />
										{title}
									</Link>
								</CardTitle>
								<div className="leading-7 text-neutral-500">{summary}</div>
								<CardFooter>
									<AvatarsList avatars={people} />
								</CardFooter>
							</CardContent>
						</Card>
					</li>
				);
			})}
		</ul>
	);
}
