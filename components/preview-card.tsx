import {
	BookIcon,
	GlobeIcon,
	ImagesIcon,
	MicIcon,
	SignpostIcon,
	TvMinimalPlayIcon,
	UsersIcon,
	VideoIcon,
} from "lucide-react";
import type { ReactNode } from "react";

import { Link } from "@/components/link";

const icons = {
	audio: MicIcon,
	event: UsersIcon,
	pathfinder: SignpostIcon,
	slides: ImagesIcon,
	"training-module": BookIcon,
	video: VideoIcon,
	"webinar-recording": TvMinimalPlayIcon,
	website: GlobeIcon,
};

interface PreviewCardProps {
	abstract: string;
	href: string;
	kind:
		| "audio"
		| "event"
		| "pathfinder"
		| "slides"
		| "training-module"
		| "video"
		| "webinar-recording"
		| "website";
	people: Array<{ id: string; name: string; image: string }>;
	locale: "de" | "en" | "sv";
	title: string;
}

export function PreviewCard(props: PreviewCardProps): ReactNode {
	const { abstract, href, kind, locale, people, title } = props;

	const Icon = icons[kind];

	return (
		<article className="flex flex-col overflow-hidden rounded-xl border border-neutral-150 shadow-sm hover:shadow-md">
			<div>
				<h2>
					<Icon aria-hidden={true} className="size-5 shrink-0" />
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
