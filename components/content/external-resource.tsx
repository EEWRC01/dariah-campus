import type { ReactNode } from "react";

interface ExternalResourceProps {
	subtitle: string;
	title: string;
	url: string;
}

export function ExternalResource(props: ExternalResourceProps): ReactNode {
	const { subtitle, title, url } = props;

	return (
		<aside className="grid gap-y-2">
			<div>{title}</div>
			<div>{subtitle}</div>
			<a href={url}>Go to resource</a>
		</aside>
	);
}
