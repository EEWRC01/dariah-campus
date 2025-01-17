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
		<article>
			<h2>
				<span>ICON</span>
				{title}
			</h2>
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
