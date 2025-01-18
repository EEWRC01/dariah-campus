import {
	BookIcon,
	GlobeIcon,
	GraduationCapIcon,
	ImagesIcon,
	MicIcon,
	SignpostIcon,
	TvMinimalPlayIcon,
	UsersIcon,
	VideoIcon,
} from "lucide-react";
import type { ReactNode } from "react";

const icons = {
	audio: MicIcon,
	curriculum: GraduationCapIcon,
	event: UsersIcon,
	pathfinder: SignpostIcon,
	slides: ImagesIcon,
	"training-module": BookIcon,
	video: VideoIcon,
	"webinar-recording": TvMinimalPlayIcon,
	website: GlobeIcon,
};

interface ContentTypeIconProps {
	className?: string;
	kind:
		| "audio"
		| "curriculum"
		| "event"
		| "pathfinder"
		| "slides"
		| "training-module"
		| "video"
		| "webinar-recording"
		| "website";
}

export function ContentTypeIcon(props: ContentTypeIconProps): ReactNode {
	const { className, kind } = props;

	const Icon = icons[kind];

	return <Icon aria-hidden={true} className={className} />;
}
