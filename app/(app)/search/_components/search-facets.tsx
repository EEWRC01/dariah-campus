"use client";

import type { ReactNode } from "react";
import { useRefinementList } from "react-instantsearch-core";

interface SearchFacetsProps {
	attribute: "locale" | "tags";
}

export function SearchFacets(props: SearchFacetsProps): ReactNode {
	const { attribute } = props;

	const facets = useRefinementList({ attribute });

	return (
		<ul className="grid gap-y-1" role="list">
			{facets.items.map((item) => {
				function onChange() {
					facets.refine(item.value);
				}

				return (
					<li key={item.value} className="flex">
						<label className="inline-flex gap-x-2">
							<input
								checked={item.isRefined}
								name="locale"
								onChange={onChange}
								type="checkbox"
								value={item.value}
							/>
							<span>
								{/* eslint-disable-next-line react/jsx-no-literals */}
								{item.label} ({item.count})
							</span>
						</label>
					</li>
				);
			})}
		</ul>
	);
}
