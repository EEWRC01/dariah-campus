"use client";

import type { ReactNode } from "react";
import { useHits } from "react-instantsearch-core";

export function SearchResults(): ReactNode {
	const hits = useHits();

	return (
		<ul role="list">
			{hits.items.map((hit) => {
				return (
					<li key={hit.objectID}>
						<pre>{JSON.stringify(hit, null, 2)}</pre>
					</li>
				);
			})}
		</ul>
	);
}
