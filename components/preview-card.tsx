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
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { Link } from "@/components/link";
import { maxPeople } from "@/config/content.config";

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

	const t = useTranslations("PreviewCard");

	const Icon = icons[kind];

	return (
		<article className="flex flex-col overflow-hidden rounded-xl border border-neutral-150 shadow-sm hover:shadow-md">
			<div>
				<h2>
					<Icon aria-hidden={true} className="size-5 shrink-0" />
					{title}
				</h2>
			</div>
			<div className="rounded bg-primary-600 px-2 py-1 text-xs font-medium text-white">
				{locale.toUpperCase()}
			</div>
			<div>{abstract}</div>
			<footer>
				<div>
					{people.map((person) => {
						return <div key={person.id}></div>;
					})}
				</div>
				<Link href={href}>{t("read-more")} &rarr;</Link>
			</footer>
		</article>
	);
}
