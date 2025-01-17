import type { ReactNode } from "react";

import { Link } from "@/components/link";

interface PreviewCardProps {
	abstract: string;
	href: string;
	people: Array<{ id: string; name: string; image: string }>;
	locale: "de" | "en" | "sv";
	title: string;
}

export function PreviewCard(props: PreviewCardProps): ReactNode {
	const { abstract, href, locale, people, title } = props;

	return (
		<article className="flex flex-col overflow-hidden rounded-xl border border-neutral-150 shadow-sm hover:shadow-md">
			<div>
				<h2>
					<span>ICON</span>
					{title}
				</h2>
			</div>
			<div>{abstract}</div>
			<footer>
				<div>
					{people.map((person) => {
						return <div key={person.id}></div>;
					})}
				</div>
				<Link href={href}>Read more</Link>
			</footer>
		</article>
	);
}
