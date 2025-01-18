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

import { Image } from "@/components/image";
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
			<div className="flex flex-col space-y-5 p-10">
				<h2 className="text-2xl font-semibold">
					<Link
						className="rounded transition hover:text-primary-600 focus:outline-none focus-visible:ring focus-visible:ring-primary-600"
						href={href}
					>
						<span className="mr-2 inline-flex text-primary-600">
							<Icon aria-hidden={true} className="size-5 shrink-0" />
						</span>
						<span>{title}</span>
					</Link>
				</h2>
				<div className="flex">
					<div className="rounded bg-primary-600 px-2 py-1 text-xs font-medium text-white">
						{locale.toUpperCase()}
					</div>
				</div>
				<div className="leading-7 text-neutral-500">{abstract}</div>
			</div>
			<footer className="flex h-20 items-center justify-between bg-neutral-100 px-10 py-5">
				<dl>
					<div>
						<dt className="sr-only">{t("authors")}</dt>
						<dd>
							<ul className="flex items-center space-x-1">
								{people.slice(0, maxPeople).map((person) => {
									return (
										<li key={person.id} className="flex">
											<span className="sr-only">{person.name}</span>
											<Image
												alt=""
												className="size-8 rounded-full object-cover"
												height={32}
												src={person.image}
												width={32}
											/>
										</li>
									);
								})}
							</ul>
						</dd>
					</div>
				</dl>
				<Link href={href}>
					{/* eslint-disable-next-line react/jsx-no-literals */}
					{t("read-more")} <span className="sr-only">&rarr;</span>
				</Link>
			</footer>
		</article>
	);
}
